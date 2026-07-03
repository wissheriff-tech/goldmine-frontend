'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import {
  CalendarCheck, Star, ShieldCheck, Wallet,
  CheckCircle2, Clock, Lock, Gift, ArrowRight, Trophy,
  ClipboardList, ChevronRight, X, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

const VIP_COLORS = {
  VIP0: '#94a3b8',
  VIP1: '#10b981',
  VIP2: '#22d3ee',
  VIP3: '#60a5fa',
  VIP4: '#a78bfa',
  VIP5: '#f472b6',
  VIP6: '#fb923c',
  VIP7: '#facc15',
  VIP8: '#34d399',
  VIP9: '#e879f9',
};

const ICON_MAP = {
  calendar: CalendarCheck,
  star: Star,
  shield: ShieldCheck,
  wallet: Wallet,
};

const TYPE_COLORS = {
  daily: { badge: 'rgba(167,139,250,0.15)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  one_time: { badge: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

function useCountdown(targetIso) {
  const [ms, setMs] = useState(() => targetIso ? Math.max(0, new Date(targetIso) - Date.now()) : 0);
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => setMs(Math.max(0, new Date(targetIso) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return ms;
}

function fmtMs(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
}

function fmtMsUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(0, midnight - now);
}

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem',
            color: n <= value ? '#facc15' : 'rgba(255,255,255,0.2)',
            fontSize: '1.5rem', lineHeight: 1, transition: 'color 0.1s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ClaimRewardModal({ task, onConfirm, onClose, claiming }) {
  if (!task) return null;
  const Icon = ICON_MAP[task.icon] || Gift;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 1rem 2rem',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'oklch(0.16 0.22 290)', border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: 24, padding: '2rem 1.5rem 1.5rem',
          width: '100%', maxWidth: 420, textAlign: 'center',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{
          width: 60, height: 60, borderRadius: 18, margin: '0 auto 1rem',
          background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={26} color="#a78bfa" />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', marginBottom: '0.35rem' }}>
          {task.title}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
          {task.description}
        </p>
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 14, padding: '0.875rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          <Sparkles size={16} color="#10b981" />
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
            {task.show_reward !== false ? `+${task.reward_NSL} NSL` : 'Claim your reward'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '0.75rem', borderRadius: 12,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(task.key)} disabled={claiming}
            style={{
              flex: 2, padding: '0.75rem', borderRadius: 12,
              background: claiming ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.22)',
              border: '1px solid rgba(167,139,250,0.4)',
              color: '#a78bfa', fontWeight: 800, fontSize: '0.85rem',
              cursor: claiming ? 'not-allowed' : 'pointer', opacity: claiming ? 0.6 : 1,
            }}>
            {claiming ? 'Claiming…' : 'Claim Now'}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

function ReviewModal({ modal, onClose, onComplete }) {
  const { subscription, reviews } = modal;
  const color = VIP_COLORS[subscription.vip_level] || '#a78bfa';
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState([0, 0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const setRating = (idx, val) => setRatings(prev => {
    const next = [...prev];
    next[idx] = val;
    return next;
  });

  const handleSubmit = async () => {
    if (ratings.some(r => r === 0)) {
      toast.error('Please rate all products before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tasks/vip-tax/${subscription.subscription_id}/complete`, {
        reviews: reviews.map((item, i) => ({ item_id: item.id, rating: ratings[i] })),
      });
      setSuccess(data);
      onComplete(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'oklch(0.14 0.22 280)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px 24px 0 0',
          padding: '1.5rem 1.25rem 2.5rem',
          width: '100%', maxWidth: 480,
          animation: 'slideUp 0.25s ease',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.4rem' }}>
              Reward Earned!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem' }}>
              Your {subscription.vip_level} daily income has been credited.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 2rem', borderRadius: 12,
                background: `${color}22`, border: `1px solid ${color}55`,
                color, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {subscription.vip_level} Daily Review
                </p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                  Review {step + 1} of {reviews.length}
                </h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {reviews.map((_, i) => (
                <div key={i} style={{
                  height: 4, flex: 1, borderRadius: 2,
                  background: i <= step ? color : 'rgba(255,255,255,0.12)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {/* Current item */}
            {reviews.map((item, i) => i !== step ? null : (
              <div key={item.id}>
                <div style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
                    }}>
                      {item.emoji}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '0.15rem' }}>{item.name}</p>
                      <span style={{
                        display: 'inline-block',
                        background: `${color}18`, border: `1px solid ${color}33`,
                        borderRadius: 20, padding: '0.15rem 0.6rem',
                        fontSize: '0.68rem', fontWeight: 700, color,
                      }}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: '0.6rem' }}>
                    Your Rating
                  </p>
                  <StarRating value={ratings[i]} onChange={v => setRating(i, v)} />
                  {ratings[i] > 0 && (
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratings[i]]}
                    </p>
                  )}
                </div>

                {i < reviews.length - 1 ? (
                  <button
                    onClick={() => { if (ratings[i] === 0) { toast.error('Please give a rating first'); return; } setStep(i + 1); }}
                    style={{
                      width: '100%', padding: '0.875rem', borderRadius: 12,
                      background: `${color}22`, border: `1px solid ${color}55`,
                      color, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '0.875rem', borderRadius: 12,
                      background: submitting ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.18)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      color: '#10b981', fontWeight: 800, fontSize: '0.9rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    <Sparkles size={16} /> {submitting ? 'Submitting…' : 'Claim Reward'}
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

function VipTaxCard({ sub, onStartReview }) {
  const color = VIP_COLORS[sub.vip_level] || '#a78bfa';
  const cdMs = useCountdown(sub.next_available_at);

  const expiresDate = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : null;

  return (
    <div style={{
      background: sub.can_claim ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${sub.can_claim ? `${color}44` : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 18, padding: '1.125rem',
      opacity: sub.is_expired ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: `${color}18`, border: `1px solid ${color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 900, color,
          }}>
            {sub.vip_level.replace('VIP', 'V')}
          </div>
          <div>
            <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', marginBottom: '0.1rem' }}>
              {sub.vip_level} Daily Review
            </p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
              Daily review task
            </p>
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: `${color}15`, border: `1px solid ${color}33`,
          borderRadius: 20, padding: '0.2rem 0.625rem',
          fontSize: '0.7rem', fontWeight: 700, color,
          flexShrink: 0,
        }}>
          {sub.today_count ?? 0}/{sub.daily_limit ?? 3} done
        </span>
      </div>

      {sub.is_expired ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', fontWeight: 600 }}>
          <Lock size={14} /> Expired {expiresDate}
        </div>
      ) : sub.can_claim ? (
        <button
          onClick={() => onStartReview(sub)}
          style={{
            width: '100%', padding: '0.65rem', borderRadius: 10,
            background: `${color}20`, border: `1px solid ${color}55`,
            color, fontWeight: 800, fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}
        >
          <ClipboardList size={15} /> Start Review Task
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> {sub.today_count}/{sub.daily_limit} done today
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
            <Clock size={12} /> {fmtMs(cdMs)}
          </div>
        </div>
      )}

      {expiresDate && !sub.is_expired && (
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>
          Expires {expiresDate}
        </p>
      )}
    </div>
  );
}

function TaskCard({ task, onClaim, onOpenClaimModal, claiming }) {
  const [countdown, setCountdown] = useState('');
  const Icon = ICON_MAP[task.icon] || Gift;
  const colors = TYPE_COLORS[task.type];

  useEffect(() => {
    if (!task.claimed || task.type !== 'daily') return;
    const tick = () => setCountdown(fmtMs(fmtMsUntilMidnightUTC()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [task.claimed, task.type]);

  const isLocked = !task.claimed && task.type === 'one_time' && task.locked;
  const isClaiming = claiming === task.key;

  return (
    <div style={{
      background: task.claimed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
      border: `1px solid ${task.claimed ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.14)'}`,
      borderRadius: 18, padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.875rem',
      opacity: task.claimed && task.type === 'one_time' ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: task.claimed ? 'rgba(255,255,255,0.06)' : 'rgba(167,139,250,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={task.claimed ? 'rgba(255,255,255,0.3)' : '#a78bfa'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: task.claimed ? 'rgba(255,255,255,0.4)' : '#fff', marginBottom: '0.15rem', lineHeight: 1.3 }}>
            {task.title}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.45 }}>
            {task.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: colors.badge, border: `1px solid ${colors.border}`,
          borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, color: colors.text,
        }}>
          {task.type === 'daily' ? 'Daily' : 'One-time'}
        </span>
      </div>

      {task.claimed && task.type === 'one_time' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
          <CheckCircle2 size={15} /> Completed
        </div>
      ) : task.claimed && task.type === 'daily' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
            <CheckCircle2 size={15} /> Claimed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
            <Clock size={12} /> {countdown}
          </div>
        </div>
      ) : isLocked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', fontWeight: 600 }}>
          <Lock size={14} /> Requirement not met
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {task.action_url && (
            <a
              href={task.action_url}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.5rem 0.75rem', borderRadius: 9,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600,
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              Go <ArrowRight size={12} />
            </a>
          )}
          <button
            onClick={() => onOpenClaimModal(task)}
            disabled={isClaiming}
            style={{
              flex: 1, padding: '0.5rem 0.75rem', borderRadius: 9,
              background: isClaiming ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.18)',
              border: '1px solid rgba(167,139,250,0.35)',
              color: '#a78bfa', fontWeight: 700, fontSize: '0.8rem',
              cursor: isClaiming ? 'not-allowed' : 'pointer',
              opacity: isClaiming ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isClaiming ? 'Claiming…' : 'Claim Reward'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [vipSubs, setVipSubs] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [modal, setModal] = useState(null);
  const [claimModal, setClaimModal] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, vipRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/vip-tax').catch(() => ({ data: { subscriptions: [] } })),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setVipSubs(vipRes.data.subscriptions || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchData();
  }, [user, router, fetchData]);

  const handleClaim = async (key) => {
    setClaiming(key);
    try {
      const { data } = await api.post(`/tasks/${key}/claim`);
      setClaimModal(null);
      toast.success(data.message || 'Reward claimed!');
      if (setUser && data.new_balance_NSL !== undefined) {
        setUser({ ...user, balance_NSL: data.new_balance_NSL });
      }
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const handleOpenClaimModal = (task) => setClaimModal(task);

  const handleStartReview = (sub) => {
    setModal({ subscription: sub, reviews: sub.review_items });
  };

  const handleReviewComplete = (data) => {
    if (setUser && data.new_balance_NSL !== undefined) {
      setUser({ ...user, balance_NSL: data.new_balance_NSL });
    }
    toast.success(data.message || 'Daily income received!');
    fetchData();
  };

  const totalEarnable = tasks.reduce((s, t) => s + t.reward_NSL, 0);
  const totalEarned = tasks.filter(t => t.claimed && t.type === 'one_time').reduce((s, t) => s + t.reward_NSL, 0);
  const dailyClaimed = tasks.filter(t => t.type === 'daily' && t.claimed).length;
  const dailyTotal = tasks.filter(t => t.type === 'daily').length;
  const vipClaimedToday = vipSubs.reduce((s, sub) => s + (sub.today_count || 0), 0);
  const vipActive = vipSubs.filter(s => !s.is_expired).reduce((s, sub) => s + (sub.daily_limit || 1), 0);

  if (isFetching) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" />
            <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 5rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .08)', filter: 'blur(90px)', top: -80, right: -60 }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .06)', filter: 'blur(80px)', bottom: -60, left: -50 }} />
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Trophy size={22} color="#f59e0b" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                Daily Tasks
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              Complete reviews to unlock your VIP daily income
            </p>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'VIP Reviews', value: `${vipClaimedToday}/${vipActive}`, color: '#f59e0b' },
              { label: 'Bonus Tasks', value: `${dailyClaimed}/${dailyTotal}`, color: '#a78bfa' },
              { label: 'One-time Earned', value: `${totalEarned} NSL`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14, padding: '0.875rem 0.75rem', textAlign: 'center',
              }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: s.color, marginBottom: '0.2rem' }}>{s.value}</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* VIP Daily Reviews section */}
          {vipSubs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <ClipboardList size={17} color="#f59e0b" />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>VIP Daily Reviews</h2>
                <span style={{
                  background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 20, padding: '0.1rem 0.5rem',
                  fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b',
                }}>
                  Unlocks Income
                </span>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Complete 2 product reviews for each active VIP to receive your daily income. Reviews reset 24 hours after your session begins.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {vipSubs.map(sub => (
                  <VipTaxCard key={sub.subscription_id} sub={sub} onStartReview={handleStartReview} />
                ))}
              </div>
            </div>
          )}

          {vipSubs.length === 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 18, padding: '1.5rem', textAlign: 'center', marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
              <p style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.3rem' }}>No Active VIP Plans</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                Purchase a VIP plan to unlock daily income reviews and start earning every day.
              </p>
            </div>
          )}

          {/* Bonus Tasks section */}
          {tasks.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Star size={17} color="#a78bfa" />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Bonus Tasks</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {tasks.map(task => (
                  <TaskCard key={task.key} task={task} onClaim={handleClaim} onOpenClaimModal={handleOpenClaimModal} claiming={claiming} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ReviewModal
          modal={modal}
          onClose={() => setModal(null)}
          onComplete={(data) => { handleReviewComplete(data); }}
        />
      )}

      {claimModal && (
        <ClaimRewardModal
          task={claimModal}
          onConfirm={handleClaim}
          onClose={() => setClaimModal(null)}
          claiming={!!claiming}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
