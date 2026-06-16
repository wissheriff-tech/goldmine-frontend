'use client';

import { useAuthStore } from '@/store/auth';

const TELEGRAM_GROUP = 'https://t.me/+efq5cq3gd60znty0';

export default function ChatWidget() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <a
      href={TELEGRAM_GROUP}
      target="_blank"
      rel="noopener noreferrer"
      title="Join our Telegram group"
      style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #229ED9, #1a7fc4)',
        color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(34,158,217,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(34,158,217,0.7)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,158,217,0.5)';
      }}
    >
      {/* Telegram logo SVG */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" fill="white"/>
      </svg>
    </a>
  );
}
