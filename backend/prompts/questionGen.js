export function buildQuestionPrompt({ role, type, difficulty, previousQuestions, isFollowup }) {
  const topicsCovered = previousQuestions
    .map((q, i) => `Q${i + 1} (${q.difficulty}): ${q.question_text}`)
    .join('\n');

  const lastQ = previousQuestions.at(-1);

  let followupBlock = '';
  if (isFollowup && lastQ) {
    followupBlock = `
IMPORTANT: Generate a FOLLOW-UP question that probes deeper into the candidate's previous answer.
Previous question: "${lastQ.question_text}"
Previous answer: "${lastQ.answer_text}"
Dig deeper into their reasoning, ask for specifics, edge cases, or trade-offs related to their answer.`;
  }

  return `You are an expert ${type} interviewer conducting a mock interview for a ${role} position.

Current difficulty level: ${difficulty}

${previousQuestions.length > 0 ? `Questions already asked (DO NOT repeat topics):
${topicsCovered}` : 'This is the first question of the interview.'}
${followupBlock}

Generate exactly 1 interview question appropriate for the ${difficulty} difficulty level.

Rules:
- For "technical" interviews: ask coding, architecture, or domain-specific questions
- For "behavioral" interviews: use STAR-format situational questions
- For "system_design" interviews: ask about designing systems, scalability, trade-offs
- Do not repeat any topic already covered
- Match the question complexity to the difficulty level

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "question": "your question text here"
}`;
}
