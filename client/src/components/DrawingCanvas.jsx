// React Native compatible: PARTIAL (swap Canvas API with RN Skia)
// Props: onDrawingComplete(base64), readOnly, layerImage
import { useEffect, useRef, useState } from 'react';
import { useCanvas, PALETTE, BRUSH_SIZES } from '../hooks/useCanvas';
import { drawImageOnCanvas } from '../utils/canvasUtils';

export default function DrawingCanvas({ onDrawingComplete, readOnly = false, layerImage = null }) {
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES.medium);
  const [isEraser, setIsEraser] = useState(false);
  const containerRef = useRef(null);
  const submitted = useRef(false);

  const {
    canvasRef,
    initCanvas,
    resizeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    exportDrawing,
  } = useCanvas({ brushSize, color, isEraser });

  useEffect(() => {
    initCanvas();

    if (layerImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      drawImageOnCanvas(ctx, layerImage, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(containerRef.current);
    resizeCanvas();
    return () => ro.disconnect();
  }, [resizeCanvas]);

  const handleSubmit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const base64 = exportDrawing();
    onDrawingComplete?.(base64);
  };

  const toggleEraser = () => {
    setIsEraser((e) => !e);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          {/* Brush sizes */}
          <div className="flex gap-1">
            {Object.entries(BRUSH_SIZES).map(([name, size]) => (
              <button
                key={name}
                onClick={() => { setBrushSize(size); setIsEraser(false); }}
                title={name}
                className={`flex items-center justify-center rounded-full transition-all
                  ${brushSize === size && !isEraser
                    ? 'bg-game-accent ring-2 ring-white'
                    : 'bg-game-card hover:bg-game-border'
                  }`}
                style={{ width: 40, height: 40 }}
              >
                <div
                  className="rounded-full bg-current"
                  style={{
                    width: name === 'small' ? 6 : name === 'medium' ? 12 : 20,
                    height: name === 'small' ? 6 : name === 'medium' ? 12 : 20,
                    backgroundColor: isEraser ? '#6b7280' : color,
                  }}
                />
              </button>
            ))}
          </div>

          {/* Eraser */}
          <button
            onClick={toggleEraser}
            className={`px-3 py-2 rounded-lg text-sm font-mono transition-all min-w-[44px] min-h-[44px]
              ${isEraser ? 'bg-game-accent text-black' : 'bg-game-card text-white hover:bg-game-border'}`}
          >
            ✕ erase
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="px-3 py-2 rounded-lg text-sm font-mono bg-game-card text-game-danger hover:bg-game-border transition-all min-w-[44px] min-h-[44px]"
          >
            clear
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-mono font-bold bg-game-success text-black hover:opacity-90 transition-all min-w-[44px] min-h-[44px]"
          >
            submit →
          </button>
        </div>
      )}

      {/* Color palette */}
      {!readOnly && (
        <div className="flex flex-wrap gap-1 px-1">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className={`rounded-full transition-transform hover:scale-110 active:scale-95
                ${color === c && !isEraser ? 'ring-2 ring-white ring-offset-1 ring-offset-game-bg scale-110' : ''}`}
              style={{ backgroundColor: c, width: 28, height: 28, minWidth: 28 }}
              title={c}
            />
          ))}
        </div>
      )}

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 rounded-xl overflow-hidden border-2 border-game-border bg-white"
        style={{ minHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ touchAction: 'none', cursor: readOnly ? 'default' : (isEraser ? 'cell' : 'crosshair') }}
          onPointerDown={readOnly ? undefined : startDrawing}
          onPointerMove={readOnly ? undefined : draw}
          onPointerUp={readOnly ? undefined : stopDrawing}
          onPointerLeave={readOnly ? undefined : stopDrawing}
          onPointerCancel={readOnly ? undefined : stopDrawing}
        />
      </div>
    </div>
  );
}
