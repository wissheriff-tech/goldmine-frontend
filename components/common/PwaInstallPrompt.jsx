'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'salonmoney-pwa-install-dismissed-at';
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

function recentlyDismissed() {
  try {
    const value = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return value && Date.now() - value < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (!isMobile || isStandalone() || recentlyDismissed()) return undefined;

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
      setIosHelp(true);
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isMobile]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) {
      setIosHelp(true);
      return;
    }
    installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
    dismiss();
  };

  if (!visible || !isMobile) return null;

  return (
    <div className="pwa-install-shell" role="dialog" aria-live="polite" aria-label="Install SalonMoney app">
      <div className="pwa-install-card">
        <button type="button" className="pwa-install-close" onClick={dismiss} aria-label="Close install prompt">×</button>
        <div>
          <p className="pwa-install-title">Install SalonMoney</p>
          <p className="pwa-install-copy">
            Add the web app for faster mobile access.
          </p>
          {iosHelp && (
            <p className="pwa-install-help">
              iPhone: Share, then Add to Home Screen.
            </p>
          )}
        </div>
        <div className="pwa-install-actions">
          {!iosHelp && <button type="button" onClick={install}>Install</button>}
          <button type="button" onClick={dismiss}>Not now</button>
        </div>
      </div>
    </div>
  );
}
