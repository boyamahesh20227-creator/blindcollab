import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti';
import LayerReveal from '../components/LayerReveal';

export default function GuessScreen({ layers, guesses, correctGuess, phaseEndTime, phaseDuration, onSubmitGuess, playerName }) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const feedRef = useRef(null);
  const timerBarRef = useRef(null);
  const alreadyCorrect = correctGuess?.playerName === playerName;

  useEffect(() => {
    if (!phaseEndTime) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, (phaseEndTime - Date.now()) / 1000);
      setTimeLeft(Math.ceil(rem));
      if (rem <= 0) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [phaseEndTime]);

  useEffect(() => {
    if (!timerBarRef.current || !phaseDuration || !phaseEndTime) return;
    const elapsed = Date.now() - (phaseEndTime - phaseDuration);
    const remaining = Math.max(0, phaseDuration - elapsed);
    timerBarRef.current.style.transition = `width ${remaining / 1000}s linear`;
    timerBarRef.current.style.width = '0%';
  }, [phaseEndTime, phaseDuration]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [guesses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || alreadyCorrect) return;
    onSubmitGuess(input.trim());
    setInput('');
  };

  const isUrgent = timeLeft <= 10;

  return (
    <div className="h-screen bg-game-bg flex flex-col font-body overflow-hidden">
      <Confetti active={!!correctGuess} />

      {/* Timer bar */}
      <div className="h-1 bg-game-border">
        <div ref={timerBarRef} className="h-full bg-game-warning" style={{ width: '100%' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-game-border">
        <h2 className="font-mono text-white font-bold">what is this?</h2>
        <span className={`font-mono font-bold text-lg ${isUrgent ? 'text-game-danger animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Final merged image */}
      <div className="p-3 border-b border-game-border flex justify-center">
        {layers.length > 0 && (
          <div className="w-full max-w-xs">
            <LayerReveal layers={layers} isFinal={true} />
          </div>
        )}
      </div>

      {/* Correct guess banner */}
      {correctGuess && (
        <div className="px-4 py-3 bg-game-success/20 border-b border-game-success/40 text-center animate-slide-up">
          <span className="font-mono text-game-success font-bold">
            🎉 {correctGuess.playerName} got it! — "{correctGuess.word}"
          </span>
        </div>
      )}

      {/* Guess feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
        {guesses.map((g, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-xl text-sm font-body animate-slide-up
              ${g.isCorrect ? 'bg-game-success/20 text-game-success border border-game-success/30' : 'bg-game-card text-gray-300 border border-game-border'}`}
          >
            {g.guess}
          </div>
        ))}
        {guesses.length === 0 && (
          <p className="text-center text-gray-600 text-sm font-mono pt-4">no guesses yet...</p>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-game-border">
        {alreadyCorrect ? (
          <div className="text-center py-2">
            <span className="font-mono text-game-success">✓ you got it right! +15 pts</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl bg-game-card border border-game-border text-white font-body focus:outline-none focus:border-game-accent placeholder-gray-600"
              placeholder="type your guess..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!!correctGuess && !alreadyCorrect}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-3 rounded-xl bg-game-accent text-black font-mono font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 min-w-[44px]"
            >
              →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
