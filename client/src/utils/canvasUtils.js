// React Native compatible: PARTIAL (swap Canvas API with RN Skia)

export function exportCanvasAsBase64(canvas) {
  return canvas.toDataURL('image/png');
}

export function exportCanvasScaled(canvas, size = 320) {
  const tmp = document.createElement('canvas');
  tmp.width = size;
  tmp.height = size;
  const ctx = tmp.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(canvas, 0, 0, size, size);
  return tmp.toDataURL('image/jpeg', 0.7);
}

export async function drawImageOnCanvas(ctx, base64, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, width, height); resolve(); };
    img.onerror = reject;
    img.src = base64;
  });
}

export async function mergeLayersToCanvas(canvas, layers) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const layer of layers) {
    if (!layer.imageBase64) continue;
    ctx.globalAlpha = 0.85;
    await drawImageOnCanvas(ctx, layer.imageBase64, canvas.width, canvas.height);
  }
  ctx.globalAlpha = 1;
}

export function getPointFromEvent(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if (e.touches) {
    const t = e.touches[0] || e.changedTouches[0];
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  }
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}
