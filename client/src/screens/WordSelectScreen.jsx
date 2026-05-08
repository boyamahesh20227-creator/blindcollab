import { useEffect, useState, useRef } from 'react';

export default function WordSelectScreen({ role, sentence, words, guesserName, claimedWords, onClaim, phaseEndTime, phaseDuration, myName }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [myClaim, setMyClaim] = useState(null);
  const timerBarRef = useRef(null);

  useEffect(() => {
    if (!phaseEndTime) return;
    const iv = setInterval(() => {
      setTimeLeft(Math.ceil(Math.max(0, (phaseEndTime - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(iv);
  }, [phaseEndTime]);

  useEffect(() => {
    if (!timerBarRef.current || !phaseDuration || !phaseEndTime) return;
    const remaining = Math.max(0, phaseEndTime - Date.now());
    timerBarRef.current.style.transition = `width ${remaining / 1000}s linear`;
    timerBarRef.current.style.width = '0%';
  }, [phaseEndTime, phaseDuration]);

  // Check if my name appears in claimedWords
  useEffect(() => {
    const entry = Object.entries(claimedWords).find(([, v]) => v.playerName === myName);
    if (entry) setMyClaim(Number(entry[0]));
  }, [claimedWords, myName]);

  if (role === 'guesser') {
    return (
      <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 font-body text-center">
        <div className="text-5xl mb-4">👁️</div>
        <h2 className="font-mono text-game-accent text-2xl font-bold mb-2">you're the guesser!</h2>
        <p className="text-gray-400 mb-6">Others are picking their words to draw…</p>
        <div className="px-4 py-2 rounded-xl bg-game-card border border-game-border">
          <span className="text-gray-400 text-sm font-mono">get ready to watch and guess</span>
        </div>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-game-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col font-body">
      {/* Timer bar */}
      <div className="h-1 bg-game-border">
        <div ref={timerBarRef} className="h-full bg-game-accent" style={{ width: '100%' }} />
      </div>

      <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
        <div className="text-center pt-4 pb-6">
          <p className="text-xs font-mono text-gray-500 mb-1">
            {guesserName} is guessing — pick YOUR word to draw
          </p>
          <h2 className="font-mono text-game-accent text-xl font-bold">
            tap a word to claim it
          </h2>
          <p className="text-xs text-gray-600 mt-1 font-mono">{timeLeft}s to pick</p>
        </div>

        {/* The sentence as claimable word tiles */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {words.map((word, idx) => {
            const claim = claimedWords[idx];
            const isMine = myClaim === idx;
            const isTaken = !!claim && !isMine;
            const isAvailable = !claim && myClaim === null;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (isAvailable) { setMyClaim(idx); onClaim(idx); }
                }}
                disabled={isTaken || myClaim !== null}
                className={`flex flex-col items-center px-5 py-4 rounded-2xl border-2 transition-all min-w-[80px]
                  ${isMine
                    ? 'bg-game-accent border-game-accent text-black scale-105 shadow-lg shadow-game-accent/30'
                    : isTaken
                    ? 'bg-game-card border-game-border opacity-50 cursor-not-allowed'
                    : isAvailable
                    ? 'bg-game-card border-game-border hover:border-game-accent hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-game-card border-game-border opacity-40 cursor-not-allowed'
                  }`}
              >
                <span className="text-xs font-mono opacity-60 mb-1">word {idx + 1}</span>
                <span className="font-mono font-bold text-lg">{word}</span>
                {claim && (
                  <span className="text-xs mt-1 font-body truncate max-w-[80px]" style={{ color: claim.playerColor }}>
                    {isMine ? 'you!' : claim.playerName}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {myClaim !== null && (
          <div className="animate-slide-up text-center p-4 rounded-2xl bg-game-accent/10 border border-game-accent/30">
            <p className="font-mono text-game-accent font-bold">
              you'll draw: <span className="text-white">"{words[myClaim]}"</span> (word {myClaim + 1} of {words.length})
            </p>
            <p className="text-gray-400 text-xs mt-1">waiting for others to pick…</p>
          </div>
        )}

        <div className="mt-auto pt-4 text-center">
          <p className="text-xs font-mono text-gray-600">
            full sentence (shh! don't say it): <span className="text-gray-400">"{sentence}"</span>
          </p>
        </div>
      </div>
    </div>
  );
}
