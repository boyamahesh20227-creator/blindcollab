import { useEffect, useState } from 'react';

const ROLE_COLORS = {
  BACKGROUND: '#60a5fa',
  CHARACTER: '#f472b6',
  OBJECT: '#fbbf24',
  DETAIL: '#34d399',
  ATMOSPHERE: '#a78bfa',
};

const ROLE_HINTS = {
  BACKGROUND: 'draw the scene, sky, ground — set the stage',
  CHARACTER: 'draw the main person, animal, or creature',
  OBJECT: 'draw the key object or prop in the scene',
  DETAIL: 'add small details, textures, and accents',
  ATMOSPHERE: 'add weather, lighting, mood elements',
};

export default function RoleScreen({ role, word, countdown, round, maxRounds }) {
  const [count, setCount] = useState(countdown ?? 5);

  useEffect(() => {
    setCount(countdown ?? 5);
  }, [countdown]);

  const roleColor = ROLE_COLORS[role] || '#c4b5fd';

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 font-body text-center">
      <div className="mb-6">
        <span className="text-xs font-mono text-gray-500">
          round {round} / {maxRounds}
        </span>
      </div>

      <div className="animate-slide-up">
        <p className="text-sm font-mono text-gray-400 mb-3">your role is</p>

        <div
          className="px-6 py-3 rounded-2xl font-mono text-3xl font-bold mb-6 inline-block"
          style={{ backgroundColor: `${roleColor}20`, color: roleColor, border: `2px solid ${roleColor}40` }}
        >
          {role}
        </div>

        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
          {ROLE_HINTS[role]}
        </p>

        <div className="mb-6">
          <p className="text-xs font-mono text-gray-500 mb-2">the secret word is</p>
          <div className="px-8 py-4 rounded-2xl bg-game-accent/10 border-2 border-game-accent/40 inline-block">
            <span className="font-mono text-2xl font-bold text-game-accent">{word}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 font-mono">
          🤫 don't tell anyone! draw your role, not the full word.
        </p>
      </div>

      {/* Countdown */}
      <div className="mt-10">
        <div
          className="w-16 h-16 rounded-full border-4 border-game-accent flex items-center justify-center"
          style={{ animation: 'pulse 1s ease-in-out infinite' }}
        >
          <span className="font-mono text-2xl font-bold text-game-accent">{count}</span>
        </div>
        <p className="text-xs font-mono text-gray-600 mt-2">drawing starts in...</p>
      </div>
    </div>
  );
}
