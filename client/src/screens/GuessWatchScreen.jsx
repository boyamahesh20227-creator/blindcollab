import { useState, useRef, useEffect } from 'react';
import Confetti from '../components/Confetti';
import { matchSentence, scoreColor } from '../utils/sentenceMatcher';

export default function GuessWatchScreen({ liveCanvases, totalWords, guesses, drawingProgress, phaseEndTime, phaseDuration, onSubmitGuess }) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [lastResult, setLastResult] = useState(null);
  const feedRef = useRef(null);
  const timerBarRef = useRef(null);
  const correctGuess = guesses.find((g) => g.isCorrect);

  useEffect(() => {
    if (!phaseEndTime) return;
    const iv = setInterval(() => setTimeLeft(Math.ceil(Math.max(0, (phaseEndTime - Date.now()) / 1000))), 500);
    return () => clearInterval(iv);
  }, [phaseEndTime]);

  useEffect(() => {
    if (!timerBarRef.current || !phaseDuration || !phaseEndTime) return;
    const remaining = Math.max(0, phaseEndTime - Date.now());
    timerBarRef.current.style.transition = `width ${remaining / 1000}s linear`;
    timerBarRef.current.style.width = '0%';
  }, [phaseEndTime, phaseDuration]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [guesses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || correctGuess) return;
    const result = matchSentence(input.trim(), ''); // local feedback only
    setLastResult({ guess: input.trim(), ...matchSentence(input.trim(), input.trim()) });
    onSubmitGuess(input.trim());
    setInput('');
  };

  const wordSlots = Array.from({ length: totalWords }, (_, i) => i);
  const isUrgent = timeLeft <= 15;

  return (
    <div className="h-screen bg-game-bg flex flex-col font-body overflow-hidden">
      <Confetti active={!!correctGuess} />

      {/* Timer bar */}
      <div className="h-1 bg-game-border">
        <div ref={timerBarRef} className="h-full bg-game-warning" style={{ width: '100%' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-game-border flex-shrink-0">
        <div>
          <h2 className="font-mono text-white font-bold text-sm">what's the sentence?</h2>
          <p className="text-gray-500 text-xs font-mono">
            {drawingProgress.submitted}/{drawingProgress.total} drawers done
          </p>
        </div>
        <span className={`font-mono font-bold text-lg tabular-nums ${isUrgent ? 'text-game-danger animate-pulse' : 'text-white'}`}>
          {correctGuess ? '🎉' : `${timeLeft}s`}
        </span>
      </div>

      {/* Live canvas grid */}
      <div className="flex-shrink-0 p-2 border-b border-game-border">
        <div className={`grid gap-2 ${totalWords <= 2 ? 'grid-cols-2' : totalWords <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {wordSlots.map((i) => (
            <div key={i} className="flex flex-col">
              <div className="text-center text-xs font-mono text-game-accent mb-1">
                word {i + 1}
              </div>
              <div className="rounded-xl overflow-hidden border border-game-border bg-white aspect-square">
                {liveCanvases[i] ? (
                  <img src={liveCanvases[i]} alt={`word ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-game-accent/40 border-t-game-accent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guess history */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1 min-h-0">
        {guesses.length === 0 && (
          <p className="text-center text-gray-600 text-xs font-mono pt-2">type your guess below while they draw…</p>
        )}
        {guesses.map((g, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-game-card border border-game-border animate-slide-up">
            <span className="flex-1 text-sm text-white font-body truncate">"{g.guess}"</span>
            <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: scoreColor(g.score) }}>
              {g.isCorrect ? '✓ correct!' : `${Math.round(g.score * 100)}%`}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-game-border flex-shrink-0">
        {correctGuess ? (
          <div className="text-center py-2">
            <p className="font-mono text-game-success font-bold">🎉 you got it!</p>
            <p className="text-gray-400 text-xs mt-1">revealing the drawings…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              autoFocus
              className="flex-1 px-3 py-3 rounded-xl bg-game-card border border-game-border text-white font-body focus:outline-none focus:border-game-accent placeholder-gray-600 text-sm"
              placeholder="type the full sentence…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-3 rounded-xl bg-game-accent text-black font-mono font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
            >
              →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
