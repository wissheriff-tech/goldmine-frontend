'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import {
  CalendarCheck, Star, ShieldCheck, Wallet,
  CheckCircle2, Clock, Lock, Gift, ArrowRight, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

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

function msUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight - now;
}

function fmtCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
}

function TaskCard({ task, onClaim, claiming }) {
  const [countdown, setCountdown] = useState('');
  const Icon = ICON_MAP[task.icon] || Gift;
  const colors = TYPE_COLORS[task.type];

  useEffect(() => {
    if (!task.claimed || task.type !== 'daily') return;
    const tick = () => setCountdown(fmtCountdown(msUntilMidnightUTC()));
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
      borderRadius: 18,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      opacity: task.claimed && task.type === 'one_time' ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Header row */}
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

      {/* Reward + type badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#10b981',
        }}>
          +{task.reward_NSL} NSL
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: colors.badge, border: `1px solid ${colors.border}`,
          borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, color: colors.text,
        }}>
          {task.type === 'daily' ? 'Daily' : 'One-time'}
        </span>
      </div>

      {/* Action area */}
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
            onClick={() => onClaim(task.key)}
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
  const [isFetching, setIsFetching] = useState(true);
  const [claiming, setClaiming] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchTasks();
  }, [user, router, fetchTasks]);

  const handleClaim = async (key) => {
    setClaiming(key);
    try {
      const { data } = await api.post(`/tasks/${key}/claim`);
      toast.success(data.message || 'Reward claimed!');
      if (setUser && data.new_balance_NSL !== undefined) {
        setUser({ ...user, balance_NSL: data.new_balance_NSL });
      }
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const totalEarnable = tasks.reduce((s, t) => s + t.reward_NSL, 0);
  const totalEarned = tasks.filter(t => t.claimed && t.type === 'one_time').reduce((s, t) => s + t.reward_NSL, 0);
  const dailyClaimed = tasks.filter(t => t.type === 'daily' && t.claimed).length;
  const dailyTotal = tasks.filter(t => t.type === 'daily').length;

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
        {/* Blobs */}
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
              Complete tasks to earn NSL rewards every day
            </p>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem', marginBottom: '1.5rem',
          }}>
            {[
              { label: 'Today\'s Daily', value: `${dailyClaimed}/${dailyTotal}`, color: '#a78bfa' },
              { label: 'One-time Earned', value: `${totalEarned} NSL`, color: '#10b981' },
              { label: 'Total Available', value: `${totalEarnable} NSL`, color: '#f59e0b' },
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

          {/* Task cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {tasks.map(task => (
              <TaskCard key={task.key} task={task} onClaim={handleClaim} claiming={claiming} />
            ))}
          </div>

          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '2rem' }}>
            Daily tasks reset at midnight UTC
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
