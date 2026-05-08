import { useState, useEffect } from 'react';
import { scoreColor } from '../utils/sentenceMatcher';

export default function RevealScreen({ revealData }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!revealData) return;
    setVisibleCount(0);
    const total = revealData.revealLayers.length;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= total) clearInterval(iv);
    }, 1200);
    return () => clearInterval(iv);
  }, [revealData]);

  if (!revealData) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center font-body">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-game-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-gray-400">preparing reveal…</p>
        </div>
      </div>
    );
  }

  const { revealLayers, sentence, bestGuess, score, guesserName, guesserPts, drawerPts } = revealData;
  const scorePercent = Math.round(score * 100);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center p-4 font-body overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center py-6">
          <h2 className="font-mono text-game-accent text-2xl font-bold">the reveal!</h2>
          <p className="text-gray-400 text-sm mt-1">
            {guesserName} was guessing
          </p>
        </div>

        {/* Drawings in word order */}
        <div className="flex flex-col gap-4 mb-6">
          {revealLayers.map((layer, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{ opacity: i < visibleCount ? 1 : 0, transition: 'opacity 0.6s ease-out' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-lg bg-game-accent/20 text-game-accent font-mono text-xs font-bold">
                  word {i + 1}
                </span>
                <span className="font-mono text-white font-bold">{layer.word}</span>
                <span className="text-gray-500 text-xs">— by {layer.playerName}</span>
              </div>
              {layer.imageBase64 ? (
                <img
                  src={layer.imageBase64}
                  alt={`${layer.word} — ${layer.playerName}`}
                  className="w-full rounded-2xl border-2 border-game-border"
                />
              ) : (
                <div className="w-full h-24 rounded-2xl border-2 border-game-border bg-game-card flex items-center justify-center text-gray-600 text-sm font-mono">
                  (no drawing submitted)
                </div>
              )}
            </div>
          ))}
        </div>

        {visibleCount >= revealLayers.length && (
          <div className="animate-slide-up space-y-4 pb-8">
            {/* The sentence */}
            <div className="p-4 rounded-2xl bg-game-card border border-game-border text-center">
              <p className="text-gray-400 text-xs font-mono mb-1">the sentence was</p>
              <p className="font-mono text-game-accent text-xl font-bold">"{sentence}"</p>
            </div>

            {/* Best guess */}
            <div className="p-4 rounded-2xl bg-game-card border border-game-border text-center">
              <p className="text-gray-400 text-xs font-mono mb-1">{guesserName}'s best guess</p>
              <p className="font-mono text-white text-lg font-bold mb-2">
                "{bestGuess || '(no guess)'}"
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-game-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${scorePercent}%`, backgroundColor: scoreColor(score) }}
                  />
                </div>
                <span className="font-mono font-bold text-sm" style={{ color: scoreColor(score) }}>
                  {scorePercent}%
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="p-4 rounded-2xl bg-game-card border border-game-border">
              <p className="text-gray-400 text-xs font-mono mb-3 text-center">points earned</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-game-accent">+{guesserPts}</p>
                  <p className="text-xs text-gray-400">{guesserName} (guesser)</p>
                </div>
                <div className="w-px bg-game-border" />
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-game-success">+{drawerPts}</p>
                  <p className="text-xs text-gray-400">each drawer</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
