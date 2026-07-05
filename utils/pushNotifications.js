import api from './api';

let vapidKey = null;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function getVapidPublicKey() {
  if (vapidKey) return vapidKey;
  const { data } = await api.get('/push/vapid-public-key');
  vapidKey = data.data.publicKey;
  return vapidKey;
}

export async function subscribeToPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    const json = subscription.toJSON();
    await api.post('/push/subscribe', {
      endpoint: json.endpoint,
      keys: json.keys
    });

    return true;
  } catch (err) {
    console.warn('Push subscribe failed:', err);
    return false;
  }
}

export async function unsubscribeFromPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
  } catch (err) {
    console.warn('Push unsubscribe failed:', err);
  }
}

export async function getPushPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
