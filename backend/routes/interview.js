import { Router } from 'express';
import pool from '../db/pool.js';
import { generateQuestion, evaluateAnswer, generateReport } from '../services/ai.js';
import { decideNext, shouldEndSession } from '../services/adaptive.js';

const router = Router();

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_TYPES = ['technical', 'behavioral', 'system_design'];
const VALID_DURATIONS = [15, 30, 45, 60];

// POST /api/sessions — create session + generate first question
router.post('/', async (req, res) => {
  try {
    const { role, difficulty, type, duration_min } = req.body;

    // Strict input validation
    if (!role || typeof role !== 'string' || role.trim().length < 2) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be: easy, medium, or hard' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be: technical, behavioral, or system_design' });
    }
    if (!VALID_DURATIONS.includes(Number(duration_min))) {
      return res.status(400).json({ error: 'Invalid duration. Must be: 15, 30, 45, or 60' });
    }

    const sanitizedRole = role.trim().slice(0, 100);

    // Create session
    const { rows } = await pool.query(
      `INSERT INTO sessions (role, difficulty, type, duration_min)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sanitizedRole, difficulty, type, Number(duration_min)]
    );
    const session = rows[0];

    // Generate first question
    const questionText = await generateQuestion({
      role: sanitizedRole,
      type,
      difficulty,
      previousQuestions: [],
      isFollowup: false,
    });

    // Save question
    const qResult = await pool.query(
      `INSERT INTO questions (session_id, sequence_num, question_text, difficulty, is_followup)
       VALUES ($1, 1, $2, $3, false) RETURNING *`,
      [session.id, questionText, difficulty]
    );

    const totalQuestions = Math.max(3, Math.floor(Number(duration_min) / 2));

    res.status(201).json({
      session_id: session.id,
      created_at: session.created_at,
      duration_min: session.duration_min,
      total_questions: totalQuestions,
      question: {
        id: qResult.rows[0].id,
        sequence_num: 1,
        question_text: questionText,
        difficulty,
        is_followup: false,
      },
    });
  } catch (err) {
    console.error('POST /sessions error:', err);
    res.status(500).json({ error: 'Failed to create session. Please try again.' });
  }
});

// POST /api/sessions/:id/answer — submit answer, get evaluation + next question
router.post('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer_text } = req.body;

    if (!answer_text || typeof answer_text !== 'string') {
      return res.status(400).json({ error: 'answer_text is required and must be a string' });
    }

    // Cap answer length to prevent abuse
    const sanitizedAnswer = answer_text.trim().slice(0, 5000);

    // Fetch session
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const session = sessionResult.rows[0];

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Session already completed' });
    }

    // Fetch all questions for this session
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE session_id = $1 ORDER BY sequence_num',
      [id]
    );
    const questions = questionsResult.rows;

    // Find the latest unanswered question
    const currentQuestion = questions.find(q => !q.answer_text);
    if (!currentQuestion) {
      return res.status(400).json({ error: 'No pending question to answer' });
    }

    // Evaluate the answer
    const evaluation = await evaluateAnswer({
      role: session.role,
      type: session.type,
      difficulty: currentQuestion.difficulty,
      questionText: currentQuestion.question_text,
      answerText: sanitizedAnswer,
    });

    // Save answer + evaluation
    await pool.query(
      `UPDATE questions
       SET answer_text = $1, score = $2, feedback = $3, quality = $4
       WHERE id = $5`,
      [sanitizedAnswer, evaluation.score, evaluation.feedback, evaluation.quality, currentQuestion.id]
    );

    // Update in-memory list for adaptive logic
    const answeredQuestions = [
      ...questions.filter(q => q.answer_text),
      { ...currentQuestion, answer_text: sanitizedAnswer, score: evaluation.score, quality: evaluation.quality },
    ];

    // Check if session time is up
    const timeUp = shouldEndSession(session, answeredQuestions.length);

    if (timeUp) {
      // Generate report and end session
      const report = await generateReport({
        role: session.role,
        type: session.type,
        difficulty: session.difficulty,
        questions: answeredQuestions,
      });

      await pool.query(
        `UPDATE sessions SET status = 'completed', report = $1, completed_at = NOW() WHERE id = $2`,
        [JSON.stringify(report), id]
      );

      return res.json({
        score: evaluation.score,
        feedback: evaluation.feedback,
        quality: evaluation.quality,
        is_complete: true,
        report,
      });
    }

    // Adaptive logic: decide next question type + difficulty
    const decision = decideNext(answeredQuestions, session.difficulty);
    const isFollowup = decision.action === 'followup';

    // Generate next question
    const nextQuestionText = await generateQuestion({
      role: session.role,
      type: session.type,
      difficulty: decision.difficulty,
      previousQuestions: answeredQuestions,
      isFollowup,
    });

    const nextSeqNum = questions.length + 1;

    const nextQResult = await pool.query(
      `INSERT INTO questions (session_id, sequence_num, question_text, difficulty, is_followup)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, nextSeqNum, nextQuestionText, decision.difficulty, isFollowup]
    );

    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
      quality: evaluation.quality,
      is_complete: false,
      next_question: {
        id: nextQResult.rows[0].id,
        sequence_num: nextSeqNum,
        question_text: nextQuestionText,
        difficulty: decision.difficulty,
        is_followup: isFollowup,
      },
    });
  } catch (err) {
    console.error('POST /sessions/:id/answer error:', err);
    res.status(500).json({ error: 'Failed to process answer. Please try again.' });
  }
});

// POST /api/sessions/:id/end — force-end session + generate report
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const sessionResult = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const session = sessionResult.rows[0];

    if (session.status === 'completed') {
      return res.json({ report: session.report });
    }

    // Get all answered questions
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE session_id = $1 AND answer_text IS NOT NULL ORDER BY sequence_num',
      [id]
    );

    if (questionsResult.rows.length === 0) {
      // No answers at all — generate a failure report
      await pool.query(
        `UPDATE sessions SET status = 'completed', report = $1, completed_at = NOW() WHERE id = $2`,
        [JSON.stringify({
          overall_score: 0,
          strengths: ['Showed up for the interview'],
          improvements: ['Answer at least one question', 'Practice basic concepts', 'Prepare before starting'],
          sample_answers: [],
          practice_topics: ['Start with fundamentals', 'Review common interview questions', 'Practice explaining concepts out loud'],
        }), id]
      );

      const updatedSession = await pool.query('SELECT report FROM sessions WHERE id = $1', [id]);
      return res.json({ report: updatedSession.rows[0].report });
    }

    const report = await generateReport({
      role: session.role,
      type: session.type,
      difficulty: session.difficulty,
      questions: questionsResult.rows,
    });

    await pool.query(
      `UPDATE sessions SET status = 'completed', report = $1, completed_at = NOW() WHERE id = $2`,
      [JSON.stringify(report), id]
    );

    res.json({ report });
  } catch (err) {
    console.error('POST /sessions/:id/end error:', err);
    res.status(500).json({ error: 'Failed to end session. Please try again.' });
  }
});

export default router;
