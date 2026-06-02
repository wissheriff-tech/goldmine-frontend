'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const FEATURES = [
  {
    label: 'Daily income',
    desc: 'NSL tokens credited to your account every day you hold an active plan.',
  },
  {
    label: '35% referral bonus',
    desc: 'Invite a friend. When they make their first purchase, you earn 35% of the plan price.',
  },
  {
    label: 'USDT deposits',
    desc: 'Send USDT via TRC20. Upload your receipt and an admin credits your account.',
  },
  {
    label: 'Secure accounts',
    desc: 'JWT-protected sessions, bcrypt passwords, and an admin approval flow before any withdrawal.',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
        <div className="container" style={{ maxWidth: 1100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--purple-light)' }}>SalonMoney</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>Sign in</Link>
                <Link href="/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', textWrap: 'balance', marginBottom: '1.25rem', color: 'var(--ink)' }}>
          Grow your savings with daily passive income
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--ink-secondary)', lineHeight: 1.7, maxWidth: '52ch', margin: '0 auto 2rem' }}>
          Deposit USDT, choose a VIP investment plan, and receive NSL tokens credited to your account every day.
        </p>
        {!isAuthenticated && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Open an account
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Sign in
            </Link>
          </div>
        )}
      </section>

      {/* Trust strip */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.25rem 1.5rem', marginBottom: '4rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { val: 'VIP0–VIP9', lbl: 'Investment tiers' },
            { val: 'Daily',     lbl: 'Income credited' },
            { val: 'USDT',      lbl: 'Accepted currency' },
          ].map(item => (
            <div key={item.val}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--purple-light)' }}>{item.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginTop: 2 }}>{item.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--ink)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--ink-tertiary)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                0{i + 1}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>{f.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.5rem 5rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--purple-subtle)', border: '1px solid var(--purple-dim)', borderRadius: 'var(--r-xl)', padding: '2.5rem 2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ink)' }}>
              Ready to start?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginBottom: '1.5rem' }}>
              Create an account and choose your first investment plan.
            </p>
            <Link href="/signup" className="btn-primary" style={{ padding: '0.75rem 2.5rem', fontSize: '0.95rem' }}>
              Create account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-tertiary)' }}>
        &copy; 2026 SalonMoney. Secure financial platform.
      </footer>

    </div>
  );
}
