'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Banknote } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    color: '#fbbf24', Icon: Clock },
  approved:  { label: 'Processing', color: '#60a5fa', Icon: Loader2 },
  completed: { label: 'Paid',       color: '#34d399', Icon: CheckCircle },
  rejected:  { label: 'Rejected',   color: '#f87171', Icon: XCircle },
};

function fmtNSL(n) { return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }); }
function fmtDate(d) { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
      color: cfg.color, borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700,
    }}>
      <cfg.Icon size={11} style={status === 'approved' ? { animation: 'spin 1.5s linear infinite' } : {}} />
      {cfg.label}
    </span>
  );
}

function Timeline({ status }) {
  const steps = ['pending', 'approved', 'completed'];
  const idx = steps.indexOf(status);
  const rejected = status === 'rejected';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
      {steps.map((s, i) => {
        const done = rejected ? false : i <= idx;
        const current = !rejected && i === idx;
        const label = s === 'pending' ? 'Submitted' : s === 'approved' ? 'Processing' : 'Paid';
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: i < 2 ? '1 1 auto' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: rejected && i === 0 ? '#f87171' : done ? '#34d399' : 'rgba(255,255,255,0.15)',
                border: `2px solid ${current ? '#34d399' : 'transparent'}`,
                boxShadow: current ? '0 0 6px #34d399' : 'none',
              }} />
              <span style={{ fontSize: '0.6rem', color: done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: rejected ? 'rgba(255,255,255,0.1)' : i < idx ? '#34d399' : 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: '0.9rem' }} />
            )}
          </div>
        );
      })}
      {rejected && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
          <span style={{ fontSize: '0.6rem', color: '#f87171' }}>Rejected</span>
        </div>
      )}
    </div>
  );
}

export default function WithdrawalsPage() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const fetch = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data } = await api.get('/user/transactions', { params: { type: 'withdrawal', limit: LIMIT, skip: p * LIMIT } });
      setTxs(data.transactions || data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetch(page);
  }, [user?.id, isInitializing, router, fetch, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Withdrawals</h1>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>Track your withdrawal requests</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Spinner /></div>
          ) : txs.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '4rem 1rem', textAlign: 'center' }}>
              <Banknote size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No withdrawals yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {txs.map(tx => (
                <div key={tx.id} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '1rem 1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{fmtNSL(tx.amount_NSL)} NSL</p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{fmtDate(tx.created_at)}</p>
                      {tx.notes && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{tx.notes}</p>}
                      {tx.rejection_reason && <p style={{ color: '#f87171', fontSize: '0.73rem', marginTop: '0.25rem' }}>Reason: {tx.rejection_reason}</p>}
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                  {tx.status !== 'rejected' && <Timeline status={tx.status} />}
                </div>
              ))}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>Prev</button>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', alignSelf: 'center' }}>Page {page + 1} / {totalPages}</span>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}>Next</button>
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
