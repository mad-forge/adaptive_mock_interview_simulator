const DIFFICULTY_UP = { easy: 'medium', medium: 'hard', hard: 'hard' };
const DIFFICULTY_DOWN = { easy: 'easy', medium: 'easy', hard: 'medium' };

export function decideNext(answeredQuestions, sessionDifficulty) {
  const count = answeredQuestions.length;
  const lastQ = answeredQuestions.at(-1);
  const lastScore = lastQ?.score ?? 50;
  const followUpUsed = answeredQuestions.some(q => q.is_followup);

  // Follow-up triggers (guarantee at least one per session)
  if (!followUpUsed) {
    // Excellent answer — probe deeper
    if (lastScore >= 85) {
      return { action: 'followup', difficulty: currentDifficulty(answeredQuestions, sessionDifficulty) };
    }
    // Poor answer — give a simpler follow-up as a second chance
    if (lastScore <= 30) {
      return { action: 'followup', difficulty: DIFFICULTY_DOWN[currentDifficulty(answeredQuestions, sessionDifficulty)] };
    }
    // Fallback: force follow-up after question 3 if none triggered yet
    if (count >= 3) {
      return { action: 'followup', difficulty: currentDifficulty(answeredQuestions, sessionDifficulty) };
    }
  }

  // Difficulty adjustment based on sliding window of last 2 answers
  const recent = answeredQuestions.slice(-2);
  const recentAvg = recent.reduce((sum, q) => sum + (q.score ?? 50), 0) / recent.length;
  const current = currentDifficulty(answeredQuestions, sessionDifficulty);

  let nextDifficulty = current;
  if (recentAvg >= 80) nextDifficulty = DIFFICULTY_UP[current];
  if (recentAvg <= 40) nextDifficulty = DIFFICULTY_DOWN[current];

  return { action: 'new_question', difficulty: nextDifficulty };
}

function currentDifficulty(answeredQuestions, sessionDifficulty) {
  // Current difficulty is whatever the last question was asked at
  return answeredQuestions.at(-1)?.difficulty || sessionDifficulty;
}

export function shouldEndSession(session, questionCount) {
  const elapsed = (Date.now() - new Date(session.created_at).getTime()) / 60000;
  return elapsed >= session.duration_min;
}
