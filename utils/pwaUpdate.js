export const APP_VERSION = '2026-06-19-3';

const SW_PATH = '/sw.js';
const PROGRESS_EVENT = 'salonmoney:pwa-update-progress';

function canUseServiceWorker() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function postSkipWaiting(worker) {
  if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
}

function waitForControllerChange(timeoutMs = 1500) {
  if (!canUseServiceWorker() || !navigator.serviceWorker.controller) return Promise.resolve(false);

  return new Promise((resolve) => {
    let done = false;
    const finish = (changed) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      resolve(changed);
    };
    const onChange = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
  });
}

function emitProgress(progress) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, {
    detail: { progress: Math.max(1, Math.min(100, Math.round(progress))) },
  }));
}

async function runProgress(durationMs = 2200, onProgress) {
  const startedAt = Date.now();
  let progress = 1;
  emitProgress(progress);
  onProgress?.(progress);

  return new Promise((resolve) => {
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      progress = Math.min(99, Math.max(1, Math.round((elapsed / durationMs) * 100)));
      emitProgress(progress);
      onProgress?.(progress);

      if (elapsed >= durationMs) {
        window.clearInterval(timer);
        emitProgress(100);
        onProgress?.(100);
        resolve();
      }
    }, 70);
  });
}

export async function registerPwaWorker() {
  if (!canUseServiceWorker()) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH, { updateViaCache: 'none' });
  } catch {
    return null;
  }
}

export async function checkForPwaUpdate() {
  if (!canUseServiceWorker()) return null;

  const registration = await registerPwaWorker();
  if (!registration) return null;

  postSkipWaiting(registration.waiting);
  await registration.update().catch(() => null);
  postSkipWaiting(registration.waiting);

  return registration;
}

export async function reloadIfPwaUpdateIsReady({ onProgress, progressDurationMs = 2200 } = {}) {
  if (!canUseServiceWorker()) return false;

  const registration = await checkForPwaUpdate();
  if (!registration) return false;

  const worker = registration.waiting || registration.installing;
  if (!worker) return false;

  postSkipWaiting(worker);
  const [changed] = await Promise.all([
    waitForControllerChange(progressDurationMs + 1000),
    runProgress(progressDurationMs, onProgress),
  ]);
  if (changed || registration.waiting) {
    window.location.reload();
    return true;
  }

  return false;
}

export { PROGRESS_EVENT };
