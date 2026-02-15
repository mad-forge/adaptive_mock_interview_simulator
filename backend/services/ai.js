import OpenAI from 'openai';
import { buildQuestionPrompt } from '../prompts/questionGen.js';
import { buildEvaluatePrompt } from '../prompts/evaluate.js';
import { buildReportPrompt } from '../prompts/report.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = 'gpt-4o-mini';

// Per-task config: lower tokens + lower temp = faster + more deterministic
const TASK_CONFIG = {
  question:  { max_tokens: 256,  temperature: 0.8 },
  evaluate:  { max_tokens: 256,  temperature: 0.3 },
  report:    { max_tokens: 1500, temperature: 0.4 },
};

async function callAI(prompt, task = 'question') {
  const config = TASK_CONFIG[task] || TASK_CONFIG.question;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: config.temperature,
    max_tokens: config.max_tokens,
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    // Retry: try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }
    console.error('AI returned non-JSON:', raw);
    throw new Error('AI response was not valid JSON');
  }
}

export async function generateQuestion({ role, type, difficulty, previousQuestions, isFollowup }) {
  const prompt = buildQuestionPrompt({ role, type, difficulty, previousQuestions, isFollowup });
  const result = await callAI(prompt, 'question');
  if (!result.question || typeof result.question !== 'string') {
    throw new Error('AI did not return a valid question');
  }
  return result.question;
}

export async function evaluateAnswer({ role, type, difficulty, questionText, answerText }) {
  // Pre-check: catch obvious garbage before wasting an API call
  const trimmed = (answerText || '').trim();
  if (trimmed.length < 3 || /^[.\-_!@#$%^&*()=+\s]+$/.test(trimmed)) {
    return { score: 0, feedback: 'No meaningful answer provided. You need to write a real response to get evaluated.', quality: 'poor' };
  }

  const prompt = buildEvaluatePrompt({ role, type, difficulty, questionText, answerText: trimmed });
  const result = await callAI(prompt, 'evaluate');

  // Validate and clamp score
  const score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
  const quality = ['poor', 'fair', 'good', 'excellent'].includes(result.quality) ? result.quality : 'poor';
  const feedback = typeof result.feedback === 'string' ? result.feedback : 'Unable to evaluate this answer.';

  return { score, feedback, quality };
}

export async function generateReport({ role, type, difficulty, questions }) {
  const prompt = buildReportPrompt({ role, type, difficulty, questions });
  const result = await callAI(prompt, 'report');

  // Validate report structure — fill in defaults if AI returns partial data
  return {
    overall_score: Math.max(0, Math.min(100, Math.round(Number(result.overall_score) || 0))),
    strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : ['No strengths identified', 'Need more practice', 'Try again with better preparation'],
    improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 3) : ['Study core concepts', 'Practice with examples', 'Work on communication'],
    sample_answers: Array.isArray(result.sample_answers) ? result.sample_answers.slice(0, 2) : [],
    practice_topics: Array.isArray(result.practice_topics) ? result.practice_topics.slice(0, 3) : ['Review fundamentals', 'Practice coding problems', 'Study system design'],
  };
}
