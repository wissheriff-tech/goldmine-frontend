'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';
const PERIODS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

function fmtNSL(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function rankColor(rank) {
  if (rank === 1) return '#fbbf24';
  if (rank === 2) return '#94a3b8';
  if (rank === 3) return '#f97316';
  return 'rgba(255,255,255,0.35)';
}

function RankIcon({ rank }) {
  if (rank === 1) return <Crown size={18} color="#fbbf24" />;
  if (rank === 2) return <Medal size={18} color="#94a3b8" />;
  if (rank === 3) return <Medal size={18} color="#f97316" />;
  return <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', minWidth: 18, textAlign: 'center' }}>#{rank}</span>;
}

export default function LeaderboardPage() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/user/referrals/leaderboard', { params: { period: p } });
      setData(res);
    } catch { toast.error('Failed to load leaderboard'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchLeaderboard(period);
  }, [user?.id, isInitializing, router, fetchLeaderboard, period]);

  const myEntry = data?.current_user;
  const leaderboard = data?.leaderboard || [];
  const myUserId = user?.id;
  const isInTop = leaderboard.some(e => e.user_id === myUserId);

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 4rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <Trophy size={22} color="#fbbf24" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Top Referrers</h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>Invite friends and climb the leaderboard</p>
          </div>

          {/* Period selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '0.4rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                background: period === p.key ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                color: period === p.key ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
              }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* My rank card */}
          {myEntry && (
            <div style={{
              background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)',
              borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="#a78bfa" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>Your Rank</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>{myEntry.total_referrals} referral{myEntry.total_referrals !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>#{myEntry.rank}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{fmtNSL(myEntry.total_earnings)} NSL earned</p>
              </div>
            </div>
          )}

          {/* Leaderboard list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Spinner /></div>
          ) : leaderboard.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '4rem 1rem', textAlign: 'center' }}>
              <Users size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No referrals yet for this period</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginTop: '0.3rem' }}>Invite friends to earn referral bonuses</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {leaderboard.map(entry => {
                const isMe = entry.user_id === myUserId;
                const color = rankColor(entry.rank);
                return (
                  <div key={entry.user_id} style={{
                    background: isMe ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isMe ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, padding: '0.875rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                  }}>
                    <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RankIcon rank={entry.rank} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.username || `User #${entry.user_id}`}
                          {isMe && <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', color: '#a78bfa', fontWeight: 600 }}>you</span>}
                        </p>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                        {entry.total_referrals} referral{entry.total_referrals !== 1 ? 's' : ''}
                        {entry.vip_level && entry.vip_level !== 'none' && <span style={{ marginLeft: '0.4rem', color: '#fbbf24' }}>· {entry.vip_level}</span>}
                      </p>
                    </div>
                    <p style={{ color: color, fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>
                      {fmtNSL(entry.total_earnings)} <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>NSL</span>
                    </p>
                  </div>
                );
              })}

              {/* Show my position if not in top list */}
              {!isInTop && myEntry && myEntry.total_referrals > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>· · ·</p>
                  <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 14, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.4rem' }}>
                    <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa' }}>#{myEntry.rank}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{user?.username} <span style={{ fontSize: '0.68rem', color: '#a78bfa' }}>you</span></p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>{myEntry.total_referrals} referral{myEntry.total_referrals !== 1 ? 's' : ''}</p>
                    </div>
                    <p style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: 800 }}>
                      {fmtNSL(myEntry.total_earnings)} <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>NSL</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" />
      <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
