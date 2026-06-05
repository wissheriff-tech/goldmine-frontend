'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const VIP_ACCENT = [
  'var(--ink-tertiary)',   // VIP0
  'oklch(0.72 0.14 55)',   // VIP1 amber
  'oklch(0.78 0.10 200)',  // VIP2 sky
  'oklch(0.72 0.18 145)',  // VIP3 green
  'oklch(0.72 0.16 260)',  // VIP4 blue
  'var(--purple-light)',   // VIP5 purple
  'oklch(0.72 0.18 320)',  // VIP6 pink
  'oklch(0.72 0.20 20)',   // VIP7 red
  'oklch(0.78 0.14 75)',   // VIP8 yellow
  'oklch(0.85 0.08 200)',  // VIP9 cyan
];

function PlanCard({ product, index }) {
  const accent = VIP_ACCENT[index] || 'var(--purple-light)';
  const roi = Math.ceil(product.price_NSL / product.daily_income_NSL);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(16px)',
      borderRadius: 'var(--r-lg)', padding: '1.25rem', display: 'flex',
      flexDirection: 'column', gap: '0.85rem',
      transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 24px ${accent}33`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: accent, textTransform: 'uppercase' }}>
          {product.name}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--ink-tertiary)' }}>{product.validity_days}d</span>
      </div>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
          ${parseFloat(product.price_usdt).toFixed(0)}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--ink-tertiary)', marginTop: 3 }}>one-time deposit</div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--ink-tertiary)' }}>Daily income</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>{product.daily_income_NSL} NSL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--ink-tertiary)' }}>Total return</span>
          <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>{(product.daily_income_NSL * product.validity_days).toLocaleString()} NSL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--ink-tertiary)' }}>Break even</span>
          <span style={{ color: 'var(--ink-secondary)' }}>day {roi}</span>
        </div>
      </div>
    </div>
  );
}

function PlansSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then(r => r.json())
      .then(data => setPlans(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', height: 160, opacity: 0.5 }} />
      ))}
    </div>
  );

  if (!plans.length) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
      {plans.map((p, i) => <PlanCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

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
    <div className="gradient-bg" style={{ minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Aurora blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      <div className="aurora-blob aurora-blob-5" />
      <div className="aurora-noise" />
      <div className="aurora-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
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
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', marginBottom: '4rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}>
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

      {/* VIP Plans Preview */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Investment plans</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-tertiary)', marginTop: 4 }}>Choose a plan that fits your budget. Earnings begin the next day.</p>
          </div>
          <Link href="/signup" style={{ fontSize: '0.8rem', color: 'var(--purple-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Get started →
          </Link>
        </div>
        <PlansSection />
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--ink)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
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
          <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', backdropFilter: 'blur(20px)', borderRadius: 'var(--r-xl)', padding: '2.5rem 2rem' }}>
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
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginTop: 'auto' }}>
        &copy; 2026 SalonMoney. Secure financial platform.
      </footer>

      </div>{/* /aurora-content */}
    </div>
  );
}
