import { useState, useEffect } from 'react';
import LayerReveal from '../components/LayerReveal';

export default function RevealScreen({ layers, word }) {
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (layers.length === 0) return;
    const timeout = setTimeout(() => setShowFinal(true), layers.length * 900 + 1500);
    return () => clearTimeout(timeout);
  }, [layers.length]);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center p-4 font-body overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center py-6">
          <h2 className="font-mono text-game-accent text-2xl font-bold">the reveal</h2>
          <p className="text-gray-400 text-sm mt-1">layers merging in...</p>
        </div>

        {showFinal ? (
          <div className="animate-fade-in">
            <p className="text-center text-sm font-mono text-gray-400 mb-4">the combined masterpiece</p>
            <LayerReveal layers={layers} isFinal={true} />
            <div className="mt-6 text-center">
              <p className="text-xs font-mono text-gray-500">guessing phase starting soon...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {layers.map((layer, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.9}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-2 mb-1 mt-3">
                  <span className="text-xs font-mono text-game-accent font-bold">{layer.role}</span>
                  <span className="text-xs text-gray-500">by {layer.playerName}</span>
                </div>
                {layer.imageBase64 ? (
                  <img
                    src={layer.imageBase64}
                    alt={`${layer.playerName} - ${layer.role}`}
                    className="w-full rounded-xl border border-game-border object-contain max-h-48"
                  />
                ) : (
                  <div className="w-full h-24 rounded-xl bg-game-card border border-game-border flex items-center justify-center text-gray-600 text-sm font-mono">
                    (no drawing)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
