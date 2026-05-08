// React Native compatible: PARTIAL (Canvas API — swap with RN Skia for mobile)
import { useRef, useCallback, useEffect } from 'react';
import { getPointFromEvent, exportCanvasAsBase64 } from '../utils/canvasUtils';

export const BRUSH_SIZES = { small: 4, medium: 12, large: 24 };

export const PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#a78bfa', '#34d399',
  '#fbbf24', '#60a5fa', '#f472b6', '#6b7280',
];

export function useCanvas({ brushSize = BRUSH_SIZES.medium, color = '#000000', isEraser = false } = {}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const savedImageRef = useRef(null);

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const saved = canvas.toDataURL();

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = saved;
    }
  }, []);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const point = getPointFromEvent(e, canvas);
    lastPoint.current = point;

    const ctx = getCtx();
    ctx.beginPath();
    ctx.arc(point.x, point.y, (isEraser ? brushSize * 1.5 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? '#ffffff' : color;
    ctx.fill();
  }, [brushSize, color, isEraser, getCtx]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPointFromEvent(e, canvas);
    const ctx = getCtx();

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? brushSize * 1.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPoint.current = point;
  }, [color, brushSize, isEraser, getCtx]);

  const stopDrawing = useCallback((e) => {
    e?.preventDefault();
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const exportDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return exportCanvasAsBase64(canvas);
  }, []);

  return {
    canvasRef,
    initCanvas,
    resizeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    exportDrawing,
  };
}
