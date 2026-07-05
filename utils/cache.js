const PFX = 'gm_';

export function getStale(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PFX + key);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch { return null; }
}

export function setCached(key, data, ttlMs = 120_000) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PFX + key, JSON.stringify({ data, exp: Date.now() + ttlMs }));
  } catch {}
}

export function bustCache(key) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(PFX + key); } catch {}
}
