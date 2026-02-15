export function decideNext(answeredQuestions, sessionDifficulty) {
  const count = answeredQuestions.length;
  const lastQ = answeredQuestions.at(-1);
  const lastScore = lastQ?.score ?? 50;
  const followUpUsed = answeredQuestions.some(q => q.is_followup);

  // Follow-up triggers (guarantee at least one per session)
  if (!followUpUsed) {
    if (lastScore >= 85 || lastScore <= 30 || count >= 3) {
      return { action: 'followup', difficulty: sessionDifficulty };
    }
  }

  // Always stay at the user's selected difficulty
  return { action: 'new_question', difficulty: sessionDifficulty };
}

export function shouldEndSession(session, questionCount) {
  const elapsed = (Date.now() - new Date(session.created_at).getTime()) / 60000;
  return elapsed >= session.duration_min;
}
