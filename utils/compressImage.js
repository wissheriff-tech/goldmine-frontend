const TARGET_BYTES = 400 * 1024;   // 400 KB ceiling
const MAX_DIMENSION = 2048;         // max px on longest side
const MIME_OUT = 'image/jpeg';

function scaleCanvas(img, maxDim) {
  let { naturalWidth: w, naturalHeight: h } = img;
  if (w > maxDim || h > maxDim) {
    const r = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      MIME_OUT,
      quality,
    );
  });
}

async function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image failed to load')); };
    img.src = url;
  });
}

/**
 * Compress an image file to TARGET_BYTES.
 * Non-image files (PDF, etc.) are returned unchanged.
 * Returns { file, originalSize, compressedSize, ratio, skipped }
 */
export async function compressImage(inputFile) {
  const originalSize = inputFile.size;

  if (!inputFile.type.startsWith('image/')) {
    return { file: inputFile, originalSize, compressedSize: originalSize, ratio: 1, skipped: true };
  }

  if (originalSize <= TARGET_BYTES) {
    return { file: inputFile, originalSize, compressedSize: originalSize, ratio: 1, skipped: true };
  }

  const img = await loadImage(inputFile);

  // Stage 1 — try full dimensions, quality stepping from 0.85 → 0.20
  let canvas = scaleCanvas(img, MAX_DIMENSION);
  for (let q = 0.85; q >= 0.20; q -= 0.10) {
    const blob = await canvasToBlob(canvas, q);
    if (blob.size <= TARGET_BYTES) {
      const file = new File([blob], sanitiseName(inputFile.name), { type: MIME_OUT });
      return { file, originalSize, compressedSize: blob.size, ratio: blob.size / originalSize, skipped: false };
    }
  }

  // Stage 2 — halve dimensions, quality step again
  canvas = scaleCanvas(img, 1024);
  for (let q = 0.85; q >= 0.20; q -= 0.10) {
    const blob = await canvasToBlob(canvas, q);
    if (blob.size <= TARGET_BYTES) {
      const file = new File([blob], sanitiseName(inputFile.name), { type: MIME_OUT });
      return { file, originalSize, compressedSize: blob.size, ratio: blob.size / originalSize, skipped: false };
    }
  }

  // Stage 3 — quarter dimensions, minimum quality floor
  canvas = scaleCanvas(img, 512);
  const blob = await canvasToBlob(canvas, 0.60);
  const file = new File([blob], sanitiseName(inputFile.name), { type: MIME_OUT });
  return { file, originalSize, compressedSize: blob.size, ratio: blob.size / originalSize, skipped: false };
}

function sanitiseName(name) {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.jpg`;
}

export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
