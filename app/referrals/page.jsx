'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Copy, Share2, X, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

const SHARE_PLATFORMS = [
  { label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.15)', border: 'rgba(37,211,102,0.35)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    action: (link, code) => window.open(`https://wa.me/?text=${encodeURIComponent(`Join Gold Mine! Use my code: ${code}\n${link}`)}`, '_blank') },
  { label: 'Telegram', color: '#2AABEE', bg: 'rgba(42,171,238,0.15)', border: 'rgba(42,171,238,0.35)',
    icon: <TelegramIcon />,
    action: (link, code) => window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join Gold Mine! Use my code: ${code}`)}`, '_blank') },
  { label: 'Twitter / X', color: '#e5e7eb', bg: 'rgba(229,231,235,0.1)', border: 'rgba(229,231,235,0.2)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    action: (link, code) => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join Gold Mine! Use my code: ${code}`)}&url=${encodeURIComponent(link)}`, '_blank') },
  { label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.15)', border: 'rgba(24,119,242,0.35)',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    action: (link) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank') },
];

export default function Referrals() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    api.get('/user/referrals')
      .then(({ data }) => { setReferrals(data.referrals); setStats(data.stats); })
      .catch(() => toast.error('Failed to load referrals'))
      .finally(() => setLoading(false));
  }, [user?.id, isInitializing, router]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success(key === 'code' ? 'Code copied!' : 'Link copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${user?.referral_code}` : '';

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="36" height="36" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3"/>
            <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Share modal */}
      {showShare && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowShare(false)}>
          <div style={{ width: '100%', maxWidth: 380, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: '1.5rem' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Share & Earn</p>
              <button onClick={() => setShowShare(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {SHARE_PLATFORMS.map(p => (
                <button key={p.label} onClick={() => { p.action(referralLink, user.referral_code); setShowShare(false); }}
                  style={{
                    background: p.bg, border: `1px solid ${p.border}`, borderRadius: 14,
                    padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    cursor: 'pointer', color: p.color, transition: 'opacity 0.15s',
                  }}>
                  {p.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{p.label}</span>
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Referral Link</p>
                <button onClick={() => copy(referralLink, 'link')} style={{ fontSize: '0.72rem', color: copied === 'link' ? '#10b981' : '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{referralLink}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Referrals</h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>Earn commissions when friends deposit</p>
          </div>

          {/* Code card */}
          <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 18, padding: '1.5rem' }}>
            <p style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your Referral Code</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontFamily: 'monospace', fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>{user.referral_code}</p>
              <button onClick={() => copy(user.referral_code, 'code')} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 10,
                background: copied === 'code' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', border: `1px solid ${copied === 'code' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}`,
                color: copied === 'code' ? '#10b981' : '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}>
                <Copy size={14} /> {copied === 'code' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', gap: '0.625rem' }}>
              <button onClick={() => copy(referralLink, 'link')} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem',
                borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: copied === 'link' ? '#10b981' : 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}>
                <Copy size={13} /> {copied === 'link' ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={() => setShowShare(true)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem',
                borderRadius: 10, background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)',
                color: '#a78bfa', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}>
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
            {[
              { label: 'Total Referrals', value: stats?.total_referrals || 0, icon: Users, color: '#60a5fa' },
              { label: 'Pending', value: stats?.pending_bonuses || 0, icon: Clock, color: '#fcd34d' },
              { label: 'Earned', value: `${(stats?.total_earned_NSL || 0).toLocaleString()} NSL`, icon: TrendingUp, color: '#10b981' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                  <Icon size={18} color={s.color} style={{ margin: '0 auto 0.4rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: s.color, marginBottom: '0.2rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Commission structure */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '1.25rem' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.875rem' }}>3-Level Commission Structure</p>
            {[
              { level: 'L1', label: 'Direct referrals deposit', pct: '3%', color: '#a78bfa' },
              { level: 'L2', label: "Their referrals deposit",  pct: '2%', color: '#60a5fa' },
              { level: 'L3', label: '3rd-level deposits',       pct: '1%', color: '#22d3ee' },
            ].map(c => (
              <div key={c.level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 6, background: `${c.color}20`, color: c.color }}>{c.level}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{c.label}</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{c.pct}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.625rem' }}>Credited automatically when a deposit is approved.</p>
          </div>

          {/* Referred users */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Referred Users ({referrals.length})</p>
            </div>
            {referrals.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <Users size={32} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 0.625rem' }} />
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>No referrals yet — share your code to start earning</p>
              </div>
            ) : (
              <div>
                {referrals.map((r, i) => (
                  <div key={r.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{r.referred_id?.phone || '—'}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                        {new Date(r.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textAlign: 'right' }}>
                      <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 800 }}>+{r.bonus_NSL} NSL</p>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        background: r.status === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        border: `1px solid ${r.status === 'paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        color: r.status === 'paid' ? '#6ee7b7' : '#fcd34d',
                      }}>
                        {r.status === 'paid' ? <><CheckCircle size={10} /> Paid</> : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
