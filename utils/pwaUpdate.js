export const APP_VERSION = '2026-06-19-2';

const SW_PATH = '/sw.js';

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

export async function reloadIfPwaUpdateIsReady() {
  if (!canUseServiceWorker()) return false;

  const registration = await checkForPwaUpdate();
  if (!registration) return false;

  const worker = registration.waiting || registration.installing;
  if (!worker) return false;

  postSkipWaiting(worker);
  const changed = await waitForControllerChange();
  if (changed || registration.waiting) {
    window.location.reload();
    return true;
  }

  return false;
}
