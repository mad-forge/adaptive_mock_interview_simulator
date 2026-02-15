import OpenAI from 'openai';
import { buildQuestionPrompt } from '../prompts/questionGen.js';
import { buildEvaluatePrompt } from '../prompts/evaluate.js';
import { buildReportPrompt } from '../prompts/report.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL_FAST = 'gpt-4o-mini';
const MODEL_SMART = 'gpt-4o-mini';

async function callAI(prompt, model = MODEL_FAST) {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown code fences if the model wraps JSON in them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error('AI returned non-JSON:', raw);
    throw new Error('AI response was not valid JSON');
  }
}

export async function generateQuestion({ role, type, difficulty, previousQuestions, isFollowup }) {
  const prompt = buildQuestionPrompt({ role, type, difficulty, previousQuestions, isFollowup });
  const result = await callAI(prompt, MODEL_SMART);
  return result.question;
}

export async function evaluateAnswer({ role, type, difficulty, questionText, answerText }) {
  const prompt = buildEvaluatePrompt({ role, type, difficulty, questionText, answerText });
  return await callAI(prompt, MODEL_FAST);
}

export async function generateReport({ role, type, difficulty, questions }) {
  const prompt = buildReportPrompt({ role, type, difficulty, questions });
  return await callAI(prompt, MODEL_SMART);
}
