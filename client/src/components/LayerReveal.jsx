import { useEffect, useRef } from 'react';
import { mergeLayersToCanvas } from '../utils/canvasUtils';

export default function LayerReveal({ layers, isFinal = false }) {
  const mergeCanvasRef = useRef(null);

  useEffect(() => {
    if (!isFinal || !mergeCanvasRef.current || layers.length === 0) return;
    mergeLayersToCanvas(mergeCanvasRef.current, layers);
  }, [isFinal, layers]);

  if (isFinal) {
    return (
      <div className="relative w-full max-w-lg mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-game-accent shadow-2xl shadow-game-accent/20">
        <canvas ref={mergeCanvasRef} className="w-full h-full" width={600} height={600} />
        <div className="absolute inset-0 border-2 border-game-accent/50 rounded-2xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
      {layers.map((layer, index) => (
        <div
          key={index}
          className="animate-fade-in opacity-0"
          style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#c4b5fd' }}
            />
            <span className="text-sm font-mono text-game-accent">{layer.role}</span>
            <span className="text-sm text-gray-400">— {layer.playerName}</span>
          </div>
          {layer.imageBase64 ? (
            <img
              src={layer.imageBase64}
              alt={`${layer.playerName}'s layer`}
              className="w-full rounded-xl border border-game-border"
            />
          ) : (
            <div className="w-full h-24 rounded-xl border border-game-border bg-game-card flex items-center justify-center text-gray-500 text-sm">
              no drawing submitted
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
