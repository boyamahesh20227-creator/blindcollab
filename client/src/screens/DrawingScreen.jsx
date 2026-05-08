import { useEffect, useState, useRef } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';

const ROLE_COLORS = {
  BACKGROUND: '#60a5fa',
  CHARACTER: '#f472b6',
  OBJECT: '#fbbf24',
  DETAIL: '#34d399',
  ATMOSPHERE: '#a78bfa',
};

export default function DrawingScreen({ role, word, phaseEndTime, phaseDuration, onSubmit }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef(null);
  const roleColor = ROLE_COLORS[role] || '#c4b5fd';
  const timerBarRef = useRef(null);

  useEffect(() => {
    if (!phaseEndTime) return;

    const update = () => {
      const remaining = Math.max(0, (phaseEndTime - Date.now()) / 1000);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) clearInterval(intervalRef.current);
    };

    update();
    intervalRef.current = setInterval(update, 500);
    return () => clearInterval(intervalRef.current);
  }, [phaseEndTime]);

  useEffect(() => {
    if (!timerBarRef.current || !phaseDuration || !phaseEndTime) return;
    const elapsed = Date.now() - (phaseEndTime - phaseDuration);
    const remaining = Math.max(0, phaseDuration - elapsed);
    timerBarRef.current.style.transition = `width ${remaining / 1000}s linear`;
    timerBarRef.current.style.width = '0%';
  }, [phaseEndTime, phaseDuration]);

  const handleDrawingComplete = (base64) => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit(base64);
  };

  const isUrgent = timeLeft <= 10;

  return (
    <div className="h-screen bg-game-bg flex flex-col font-body overflow-hidden">
      {/* Timer bar */}
      <div className="h-1 bg-game-border w-full">
        <div
          ref={timerBarRef}
          className="h-full bg-game-accent"
          style={{ width: '100%', transition: 'none' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-game-border">
        <div
          className="px-3 py-1 rounded-lg text-sm font-mono font-bold"
          style={{ backgroundColor: `${roleColor}20`, color: roleColor }}
        >
          {role}
        </div>

        <div className={`font-mono font-bold text-lg tabular-nums ${isUrgent ? 'text-game-danger animate-pulse' : 'text-white'}`}>
          {submitted ? '✓ submitted' : `${timeLeft}s`}
        </div>

        <div className="px-3 py-1 rounded-lg bg-game-accent/10 border border-game-accent/30">
          <span className="font-mono text-sm text-game-accent">{word}</span>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 p-2 min-h-0">
        {submitted ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <p className="font-mono text-game-success text-lg font-bold">drawing submitted!</p>
              <p className="text-gray-500 text-sm mt-2">waiting for other players...</p>
            </div>
          </div>
        ) : (
          <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
        )}
      </div>
    </div>
  );
}
