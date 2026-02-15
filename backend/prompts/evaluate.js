export function buildEvaluatePrompt({ role, type, difficulty, questionText, answerText }) {
  return `You are an EXTREMELY STRICT ${type} interviewer at a top tech company evaluating a ${role} candidate.

Question (${difficulty} level): "${questionText}"
Candidate's answer: "${answerText}"

STRICT SCORING RUBRIC — follow this EXACTLY:

SCORE 0-5 (quality: "poor"):
- Gibberish, random characters, dots, symbols, single words
- Copy-pasting the question back as the answer
- "I don't know", "no idea", or blank-equivalent responses
- Completely irrelevant content unrelated to the question

SCORE 6-20 (quality: "poor"):
- One sentence answers with zero depth
- Name-dropping terms without explaining them
- Vague generalities like "it depends" or "there are many ways" without specifics
- Answers that ONLY state the obvious without any insight

SCORE 21-40 (quality: "fair"):
- Partially correct but missing critical details
- Shows basic awareness but no real understanding
- No examples, no trade-offs, no edge cases mentioned
- Would fail a real interview at this point

SCORE 41-65 (quality: "good"):
- Correct core answer with some supporting details
- Mentions at least one concrete example or scenario
- Shows working knowledge but gaps remain
- Acceptable but not impressive in a real interview

SCORE 66-85 (quality: "good"):
- Technically accurate with good depth
- Provides specific examples, mentions trade-offs
- Well-structured response showing clear understanding
- Would pass a real interview round

SCORE 86-100 (quality: "excellent"):
- ONLY for truly exceptional answers
- Deep technical precision with multiple examples
- Discusses edge cases, trade-offs, alternatives
- Production-level thinking, well-communicated
- Would impress a senior interviewer

CRITICAL — CALIBRATE EVERYTHING TO THE DIFFICULTY LEVEL ("${difficulty}"):

If difficulty is "easy":
- A correct answer in simple language with basic understanding is ENOUGH for a high score
- You do NOT expect edge cases, trade-offs, or deep architecture — it's an easy question
- A clear, correct 2-3 sentence answer can score 60-80
- Feedback should be encouraging but point out what could be added for a stronger answer
- Feedback tone: supportive, like a mentor helping a junior developer

If difficulty is "medium":
- Expect correct answer WITH some depth — at least one example or real-world scenario
- A surface-level correct answer scores lower (40-55) because more is expected
- Feedback should be balanced — acknowledge what's right, push for more depth
- Feedback tone: professional, like a mid-level interview

If difficulty is "hard":
- Expect deep technical precision, trade-offs, edge cases, system-level thinking
- A correct but shallow answer scores much lower (30-50) because hard demands depth
- Only score 70+ if the answer shows senior-level thinking
- Feedback should be tough and specific — point out exactly what depth was missing
- Feedback tone: strict, like a senior staff engineer interview

FEEDBACK RULES:
- Match your feedback language to the difficulty level (simpler for easy, more technical for hard)
- Point out exactly what was wrong or missing
- Tell them what a BETTER answer would include at THIS difficulty level
- If the answer is bad, say so clearly

Respond with ONLY valid JSON:
{"score":<0-100>,"feedback":"<2-3 sentences, direct and specific>","quality":"<poor|fair|good|excellent>"}`;
}
