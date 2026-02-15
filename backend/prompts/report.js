export function buildReportPrompt({ role, type, difficulty, questions }) {
  const transcript = questions.map((q, i) => ({
    number: i + 1,
    question: q.question_text,
    answer: q.answer_text || '(no answer provided)',
    score: q.score ?? 0,
    difficulty: q.difficulty,
    is_followup: q.is_followup,
  }));

  return `You are an expert interviewer generating a performance report for a mock ${type} interview.

Role: ${role}
Starting difficulty: ${difficulty}
Total questions: ${questions.length}

Full interview transcript:
${JSON.stringify(transcript, null, 2)}

Generate a comprehensive performance report.

Pick the 2 WEAKEST answers (lowest scores) for the "sample_answers" section and provide significantly improved versions.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "overall_score": <number 0-100, weighted average considering difficulty>,
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    "<area for improvement 1>",
    "<area for improvement 2>",
    "<area for improvement 3>"
  ],
  "sample_answers": [
    {
      "question": "<the original question>",
      "original_answer": "<what the candidate said>",
      "improved_answer": "<a strong, detailed model answer>"
    },
    {
      "question": "<the original question>",
      "original_answer": "<what the candidate said>",
      "improved_answer": "<a strong, detailed model answer>"
    }
  ],
  "practice_topics": [
    "<topic 1>",
    "<topic 2>",
    "<topic 3>"
  ]
}`;
}
