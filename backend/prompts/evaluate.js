export function buildEvaluatePrompt({ role, type, difficulty, questionText, answerText }) {
  return `You are a STRICT expert ${type} interviewer evaluating a candidate for a ${role} position.

Question (${difficulty} difficulty): "${questionText}"

Candidate's answer: "${answerText}"

CRITICAL RULES FOR SCORING:
1. If the answer is gibberish, random characters, dots, symbols, single words, or clearly not a real attempt — score MUST be 0-5 with quality "poor".
2. If the answer is vague, generic, or could apply to any question without specific technical content — score MUST be 10-25 with quality "poor".
3. If the answer is partially correct but missing key details — score 30-55 with quality "fair".
4. If the answer is correct with reasonable depth and specifics — score 60-80 with quality "good".
5. Only score 81-100 with quality "excellent" if the answer is thorough, technically precise, well-structured, and demonstrates deep understanding.

Evaluate the answer based on:
- Correctness and technical accuracy
- Depth of understanding (surface-level vs deep knowledge)
- Specificity (concrete examples, code references, real-world scenarios)
- Clarity and communication
- Relevance to the exact question asked

Be HARSH. Real interviewers are tough. A one-word answer or nonsense should NEVER score above 5.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence constructive but honest feedback>",
  "quality": "<one of: poor, fair, good, excellent>"
}`;
}
