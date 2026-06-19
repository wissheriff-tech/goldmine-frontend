'use client';

import { useEffect, useState } from 'react';
import { checkForPwaUpdate, registerPwaWorker } from '@/utils/pwaUpdate';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

function syncInstalledModeClass() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('pwa-standalone', isStandalone());
}

function activateWaitingWorker(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    syncInstalledModeClass();

    const syncMode = () => syncInstalledModeClass();
    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', syncMode);
    window.addEventListener('appinstalled', syncMode);

    return () => {
      media.removeEventListener?.('change', syncMode);
      window.removeEventListener('appinstalled', syncMode);
    };
  }, []);

  useEffect(() => {
    if (!isMobile || isStandalone()) return undefined;

    setVisible(true);

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
      setIosHelp(true);
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
    if (!('serviceWorker' in navigator)) return undefined;

    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (!hadController) return;
      if (refreshing) return;
      refreshing = true;
      setUpdateVisible(true);
      window.location.reload();
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'APP_UPDATE_AVAILABLE') {
        setUpdateVisible(true);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    registerPwaWorker()
      .then((registration) => {
        if (!registration) return;
        activateWaitingWorker(registration);

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        registration.update().catch(() => {});
      })
      .catch(() => {});

    const checkForUpdates = () => {
      checkForPwaUpdate().then((registration) => activateWaitingWorker(registration));
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) checkForUpdates();
    };
    const updateInterval = window.setInterval(checkForUpdates, 30000);

    window.addEventListener('focus', checkForUpdates);
    window.addEventListener('online', checkForUpdates);
    window.addEventListener('pageshow', checkForUpdates);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      window.clearInterval(updateInterval);
      window.removeEventListener('focus', checkForUpdates);
      window.removeEventListener('online', checkForUpdates);
      window.removeEventListener('pageshow', checkForUpdates);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const dismiss = () => {
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
    syncInstalledModeClass();
    dismiss();
  };

  if (updateVisible) {
    return (
      <div className="pwa-update-shell" role="status" aria-live="assertive">
        <div className="pwa-update-card">
          <p className="pwa-install-title">Updating SalonMoney</p>
          <p className="pwa-install-copy">Loading the latest version now.</p>
        </div>
      </div>
    );
  }

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
