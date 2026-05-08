import { useEffect, useState, useRef } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';

export default function DrawingScreen({ assignedWord, assignedWordIndex, totalWords, phaseEndTime, phaseDuration, onSubmit, onCanvasUpdate }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [submitted, setSubmitted] = useState(false);
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

  const handleComplete = (base64) => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit(base64);
  };

  const isUrgent = timeLeft <= 15;

  return (
    <div className="h-screen bg-game-bg flex flex-col font-body overflow-hidden">
      {/* Timer bar */}
      <div className="h-1 bg-game-border">
        <div ref={timerBarRef} className="h-full bg-game-accent" style={{ width: '100%' }} />
      </div>

      {/* Header: word + index + timer */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-game-border flex-shrink-0">
        <div>
          <p className="text-xs font-mono text-gray-500">
            word {(assignedWordIndex ?? 0) + 1} of {totalWords}
          </p>
          <p className="font-mono text-2xl font-bold text-game-accent">
            {submitted ? '✓ submitted' : (assignedWord || '…')}
          </p>
        </div>
        <div className={`font-mono font-bold text-2xl tabular-nums ${isUrgent && !submitted ? 'text-game-danger animate-pulse' : 'text-white'}`}>
          {submitted ? '✓' : `${timeLeft}s`}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-2 min-h-0">
        {submitted ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">✓</div>
              <p className="font-mono text-game-success text-lg font-bold">drawing submitted!</p>
              <p className="text-gray-500 text-sm mt-2">waiting for others…</p>
            </div>
          </div>
        ) : (
          <DrawingCanvas
            onDrawingComplete={handleComplete}
            onCanvasUpdate={onCanvasUpdate}
          />
        )}
      </div>
    </div>
  );
}
