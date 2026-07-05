'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { subscribeToPush, getPushPermissionState } from '@/utils/pushNotifications';

export default function PushSubscriber() {
  const user = useAuthStore(state => state.user);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user || subscribedRef.current) return;
    if (typeof window === 'undefined' || !('PushManager' in window)) return;

    async function trySubscribe() {
      const state = await getPushPermissionState();

      if (state === 'granted') {
        subscribedRef.current = true;
        subscribeToPush().catch(() => null);
      } else if (state === 'default') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
          || window.navigator.standalone === true;

        if (isStandalone) {
          subscribedRef.current = true;
          subscribeToPush().catch(() => null);
        }
      }
    }

    trySubscribe();
  }, [user]);

  return null;
}
