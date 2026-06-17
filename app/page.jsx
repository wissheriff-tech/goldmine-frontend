'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import { API_ROUTES } from '@/utils/navigation';

const VIP_ACCENT = [
  'oklch(0.75 0.14 175)',
  'oklch(0.72 0.14 55)',
  'oklch(0.78 0.10 200)',
  'oklch(0.72 0.18 145)',
  'oklch(0.72 0.16 260)',
  'var(--purple-light)',
  'oklch(0.72 0.18 320)',
  'oklch(0.72 0.20 20)',
  'oklch(0.78 0.14 75)',
  'oklch(0.85 0.08 200)',
];

const DUR_ACCENT = {
  short: '#f59e0b',
  week:  '#10b981',
  month: '#60a5fa',
  promo: '#f472b6',
};

const HOME_TEXT = {
  primary: '#ffffff',
  secondary: 'rgba(255,255,255,0.78)',
  tertiary: 'rgba(255,255,255,0.58)',
};

function PlanCard({ product, index, selectedDuration }) {
  const accent = VIP_ACCENT[index] || 'var(--purple-light)';
  const roi = Math.ceil(product.price_NSL / product.daily_income_NSL);
  const days = selectedDuration ? selectedDuration.days : product.validity_days;
  const totalReturn = Math.round(product.daily_income_NSL * days);
  const durationLabel = selectedDuration ? selectedDuration.label : `${product.validity_days}d`;
  const dailyRate = ((product.daily_income_NSL / product.price_NSL) * 100).toFixed(1);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px)', borderRadius: 'var(--r-lg)', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
        transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 24px ${accent}33`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: accent, textTransform: 'uppercase' }}>
          {product.name}
        </span>
        <span style={{ fontSize: '0.65rem', color: HOME_TEXT.tertiary, background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '2rem' }}>
          {durationLabel}
        </span>
      </div>

      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: HOME_TEXT.primary, lineHeight: 1 }}>
          ${parseFloat(product.price_usdt).toFixed(0)}
        </div>
        <div style={{ fontSize: '0.72rem', color: HOME_TEXT.tertiary, marginTop: 3 }}>
          one-time deposit · {dailyRate}%/day
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: HOME_TEXT.secondary }}>Daily income</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>{product.daily_income_NSL} NSL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: HOME_TEXT.secondary }}>Total return</span>
          <span style={{ color: HOME_TEXT.primary, fontWeight: 600 }}>{totalReturn.toLocaleString()} NSL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: HOME_TEXT.secondary }}>Break even</span>
          <span style={{ color: HOME_TEXT.secondary }}>day {roi}</span>
        </div>
      </div>

      <Link
        href="/signup"
        style={{ marginTop: '0.25rem', display: 'block', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: accent, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', transition: 'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Get started →
      </Link>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [durations, setDurations] = useState([]);
  const [referral, setReferral] = useState({ l1_pct: 3, l2_pct: 2, l3_pct: 1 });
  const [selectedKey, setSelectedKey] = useState('short');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(API_ROUTES.products.list),
      api.get(API_ROUTES.products.durations),
    ])
      .then(([{ data: products }, { data: durData }]) => {
        setPlans(Array.isArray(products) ? products : []);
        if (Array.isArray(durData.options)) setDurations(durData.options);
        if (durData.referral) setReferral(durData.referral);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedDuration = durations.find(d => d.key === selectedKey) ?? null;
  const defaultDurations = durations.filter(d => d.group !== 'invitation');
  const invitationDurations = durations.filter(d => d.group === 'invitation');

  const minDays = durations[0]?.days ?? 3;
  const maxDays = durations[2]?.days ?? 30;

  const FEATURES = [
    {
      label: 'Daily income',
      desc: 'NSL tokens credited to your account every day you hold an active plan.',
    },
    {
      label: `${referral.l1_pct}% / ${referral.l2_pct}% / ${referral.l3_pct}% referral commissions`,
      desc: `Earn ${referral.l1_pct}% when your direct invite invests, ${referral.l2_pct}% from their invites, and ${referral.l3_pct}% one level deeper — paid on every purchase, not just the first.`,
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

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', color: HOME_TEXT.primary }}>
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
                  <Link href="/login" style={{ fontSize: '0.875rem', color: HOME_TEXT.secondary }}>Sign in</Link>
                  <Link href="/signup" className="btn-primary">Get started</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: 680, margin: '0 auto', padding: '5rem 1.5rem 3.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', textWrap: 'balance', marginBottom: '1.25rem', background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 40%, #67e8f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Grow your savings with daily passive income
          </h1>
          <p style={{ fontSize: '1.1rem', color: HOME_TEXT.secondary, lineHeight: 1.7, maxWidth: '52ch', margin: '0 auto 2rem' }}>
            Deposit USDT, choose a VIP investment plan, and receive NSL tokens credited to your account every day.
          </p>
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                Open an account
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  color: HOME_TEXT.primary,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 'var(--r-md)',
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </div>
          )}
        </section>

        {/* Trust strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', marginBottom: '4rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            {[
              { val: 'VIP0–VIP9',                   lbl: 'Investment tiers' },
              { val: 'Daily',                        lbl: 'Income credited' },
              { val: `${minDays}d – ${maxDays}d`,   lbl: 'Duration options' },
              { val: 'USDT',                         lbl: 'Accepted currency' },
            ].map(item => (
              <div key={item.val}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--purple-light)' }}>{item.val}</div>
                <div style={{ fontSize: '0.75rem', color: HOME_TEXT.secondary, marginTop: 2 }}>{item.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Plans */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: HOME_TEXT.primary, margin: 0 }}>Investment plans</h2>
              <p style={{ fontSize: '0.8rem', color: HOME_TEXT.secondary, marginTop: 4 }}>
                Choose a duration below to see your projected returns.
              </p>
            </div>
            <Link href="/signup" style={{ fontSize: '0.8rem', color: 'var(--purple-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Get started →
            </Link>
          </div>

          {/* Duration tabs */}
          {durations.length > 0 && (
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                ['Default', defaultDurations],
                ['Invitation only', invitationDurations],
              ].map(([label, list]) => list.length > 0 && (
                <div key={label}>
                  <p style={{ color: HOME_TEXT.primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>{label}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {list.map(d => {
                      const isSelected = d.key === selectedKey;
                      const accent = DUR_ACCENT[d.key] || '#a78bfa';
                      return (
                        <button
                          key={d.key}
                          onClick={() => setSelectedKey(d.key)}
                          style={{
                            padding: '0.4rem 0.9rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 700,
                            border: `1px solid ${isSelected ? accent : 'rgba(255,255,255,0.18)'}`,
                            background: isSelected ? `${accent}22` : 'rgba(255,255,255,0.05)',
                            color: isSelected ? accent : HOME_TEXT.secondary,
                            cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(8px)',
                          }}
                        >
                          {d.label}
                          {d.requires_invitation && <span style={{ marginLeft: '0.35rem', color: '#fff', fontSize: '0.65rem' }}>Invite</span>}
                          {isSelected && <span style={{ marginLeft: '0.3rem', fontSize: '0.65rem' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cards */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', height: 195, opacity: 0.5 }} />
              ))}
            </div>
          ) : plans.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {plans.map((p, i) => (
                <PlanCard key={p.id} product={p} index={i} selectedDuration={selectedDuration} />
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: HOME_TEXT.primary }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--purple-light)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  0{i + 1}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: HOME_TEXT.primary, marginBottom: '0.5rem' }}>{f.label}</h3>
                <p style={{ fontSize: '0.85rem', color: HOME_TEXT.secondary, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!isAuthenticated && (
          <section style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.5rem 5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', backdropFilter: 'blur(20px)', borderRadius: 'var(--r-xl)', padding: '2.5rem 2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: HOME_TEXT.primary }}>
                Ready to start?
              </h2>
              <p style={{ fontSize: '0.9rem', color: HOME_TEXT.secondary, marginBottom: '1.5rem' }}>
                Create an account and choose your first investment plan.
              </p>
              <Link href="/signup" className="btn-primary" style={{ padding: '0.75rem 2.5rem', fontSize: '0.95rem' }}>
                Create account
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: HOME_TEXT.secondary, marginTop: 'auto' }}>
          &copy; 2026 SalonMoney. Secure financial platform.
        </footer>

      </div>
    </div>
  );
}
