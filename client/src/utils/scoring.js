// React Native compatible: YES
export const POINTS = {
  CORRECT_GUESS: 15,
  FIRST_CORRECT_BONUS: 5,
  MOST_HELPFUL_VOTE: 10,
  MOST_CHAOTIC_VOTE: 5,
  WORD_NOT_GUESSED: -3,
};

export function getRankEmoji(index) {
  return ['🥇', '🥈', '🥉'][index] || `#${index + 1}`;
}

export function formatScore(score) {
  return score >= 0 ? `+${score}` : `${score}`;
}
