// React Native compatible: YES

const STOP = new Set([
  'is', 'in', 'the', 'a', 'an', 'on', 'at', 'to', 'of', 'and', 'or', 'with',
  'are', 'was', 'be', 'by', 'as', 'that', 'this', 'it', 'its', 'for', 'from',
]);

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === 0 ? i : 0))
  );
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export function matchSentence(guess, sentence) {
  if (!guess || !sentence) return { isCorrect: false, score: 0, label: 'wrong' };
  const norm = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const g = norm(guess), s = norm(sentence);
  if (g === s) return { isCorrect: true, score: 1, label: 'exact!' };

  const keys = s.split(' ').filter((w) => !STOP.has(w) && w.length > 1);
  const gWords = g.split(' ');
  if (!keys.length) return { isCorrect: false, score: 0, label: 'wrong' };

  const matched = keys.filter((kw) =>
    gWords.some((gw) => gw === kw || gw.includes(kw) || kw.includes(gw) ||
      levenshtein(kw, gw) <= Math.floor(kw.length / 3) + 1)
  ).length;

  const score = Math.round((matched / keys.length) * 100) / 100;
  let label = 'wrong';
  if (score >= 0.8) label = 'correct!';
  else if (score >= 0.6) label = 'very close!';
  else if (score >= 0.4) label = 'getting there';
  else if (score >= 0.2) label = 'a bit off';
  return { isCorrect: score >= 0.8, score, label };
}

export function scoreColor(score) {
  if (score >= 0.8) return '#4ade80';
  if (score >= 0.6) return '#fbbf24';
  if (score >= 0.4) return '#f97316';
  return '#f87171';
}
