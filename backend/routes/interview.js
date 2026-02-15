import { Router } from 'express';
import pool from '../db/pool.js';
import { generateQuestion, evaluateAnswer, generateReport } from '../services/ai.js';
import { decideNext, shouldEndSession } from '../services/adaptive.js';

const router = Router();

// POST /api/sessions — create session + generate first question
router.post('/', async (req, res) => {
  try {
    const { role, difficulty, type, duration_min } = req.body;

    if (!role || !difficulty || !type || !duration_min) {
      return res.status(400).json({ error: 'Missing required fields: role, difficulty, type, duration_min' });
    }

    // Create session
    const { rows } = await pool.query(
      `INSERT INTO sessions (role, difficulty, type, duration_min)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [role, difficulty, type, duration_min]
    );
    const session = rows[0];

    // Generate first question
    const questionText = await generateQuestion({
      role,
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

    // Estimate total questions: ~2 min per question
    const totalQuestions = Math.max(3, Math.floor(duration_min / 2));

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
    res.status(500).json({ error: err.message || 'Failed to create session' });
  }
});

// POST /api/sessions/:id/answer — submit answer, get evaluation + next question
router.post('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer_text } = req.body;

    if (!answer_text) {
      return res.status(400).json({ error: 'answer_text is required' });
    }

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
      answerText: answer_text,
    });

    // Save answer + evaluation
    await pool.query(
      `UPDATE questions
       SET answer_text = $1, score = $2, feedback = $3, quality = $4
       WHERE id = $5`,
      [answer_text, evaluation.score, evaluation.feedback, evaluation.quality, currentQuestion.id]
    );

    // Update in-memory list for adaptive logic
    const answeredQuestions = [
      ...questions.filter(q => q.answer_text),
      { ...currentQuestion, answer_text, score: evaluation.score, quality: evaluation.quality },
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
    res.status(500).json({ error: err.message || 'Failed to process answer' });
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
      return res.status(400).json({ error: 'No answered questions to generate report from' });
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
    res.status(500).json({ error: err.message || 'Failed to end session' });
  }
});

export default router;
