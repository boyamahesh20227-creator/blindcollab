import { useState } from 'react';

export default function VoteScreen({ votePlayers = [], playerName, onVote }) {
  const [helpful, setHelpful] = useState(null);
  const [chaotic, setChaotic] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const others = votePlayers.filter((p) => p.name !== playerName);

  const handleSubmit = () => {
    if (!helpful || !chaotic || submitted) return;
    setSubmitted(true);
    onVote(helpful, chaotic);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center font-body">
        <div className="text-center">
          <div className="text-4xl mb-3">🗳️</div>
          <p className="font-mono text-game-success text-lg font-bold">vote submitted!</p>
          <p className="text-gray-500 text-sm mt-2">waiting for others...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col p-4 font-body max-w-md mx-auto">
      <div className="text-center py-6">
        <h2 className="font-mono text-game-accent text-2xl font-bold">vote!</h2>
        <p className="text-gray-400 text-sm mt-1">results are anonymous</p>
      </div>

      {/* Most Helpful */}
      <div className="mb-6">
        <h3 className="font-mono text-game-success font-bold mb-1">most helpful layer</h3>
        <p className="text-gray-500 text-xs mb-3">who made it easiest to guess? (+10 pts)</p>
        <div className="flex flex-col gap-2">
          {others.map((p) => (
            <button
              key={p.name}
              onClick={() => setHelpful(p.name)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 ${
                helpful === p.name
                  ? 'bg-game-success/20 border-game-success text-game-success'
                  : 'bg-game-card border-game-border text-white hover:border-game-success/50'
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold text-black flex-shrink-0"
                style={{ backgroundColor: p.color || '#c4b5fd' }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-body font-semibold">{p.name}</div>
                <div className="text-xs font-mono opacity-60">{p.role}</div>
              </div>
              {helpful === p.name && <span className="ml-auto text-game-success">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Most Chaotic */}
      <div className="mb-8">
        <h3 className="font-mono text-game-warning font-bold mb-1">most chaotic layer</h3>
        <p className="text-gray-500 text-xs mb-3">who made it the most chaotic? (+5 pts)</p>
        <div className="flex flex-col gap-2">
          {others.map((p) => (
            <button
              key={p.name}
              onClick={() => setChaotic(p.name)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 ${
                chaotic === p.name
                  ? 'bg-game-warning/20 border-game-warning text-game-warning'
                  : 'bg-game-card border-game-border text-white hover:border-game-warning/50'
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold text-black flex-shrink-0"
                style={{ backgroundColor: p.color || '#c4b5fd' }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-body font-semibold">{p.name}</div>
                <div className="text-xs font-mono opacity-60">{p.role}</div>
              </div>
              {chaotic === p.name && <span className="ml-auto text-game-warning">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!helpful || !chaotic}
        className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
      >
        submit vote →
      </button>
    </div>
  );
}
