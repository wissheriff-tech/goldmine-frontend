'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, ShoppingBag, Users, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';
import { getStale, setCached } from '@/utils/cache';

const PAGE_SIZE = 20;

const TYPE_META = {
  recharge:      { label: 'Recharge',     icon: ArrowDownLeft, accent: '#10b981', sign: '+' },
  income:        { label: 'Daily Income', icon: TrendingUp,    accent: '#60a5fa', sign: '+' },
  referral_bonus:{ label: 'Referral',     icon: Users,         accent: '#22d3ee', sign: '+' },
  purchase:      { label: 'Purchase',     icon: ShoppingBag,   accent: '#a78bfa', sign: '-' },
  renewal:       { label: 'Renewal',      icon: RefreshCw,     accent: '#fb923c', sign: '-' },
  withdrawal:    { label: 'Withdrawal',   icon: ArrowUpRight,  accent: '#f87171', sign: '-' },
};

const STATUS_COLOR = {
  pending:   { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  text: '#fcd34d' },
  approved:  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
  completed: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5' },
};

const FILTERS = ['all', 'recharge', 'withdrawal', 'income', 'purchase', 'referral_bonus', 'renewal'];

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function Transactions() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [transactions, setTransactions] = useState(() => getStale('transactions_p0') ?? []);
  const [total, setTotal] = useState(() => getStale('transactions_p0_total') ?? 0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(() => !getStale('transactions_p0'));

  const fetchTransactions = useCallback(async (f, p, df, dt) => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, skip: p * PAGE_SIZE };
      if (f !== 'all') params.type = f;
      if (df) params.date_from = df;
      if (dt) params.date_to = dt;
      const { data } = await api.get('/user/transactions', { params });
      setTransactions(data.transactions);
      const tot = data.pagination?.total || data.transactions.length;
      setTotal(tot);
      if (f === 'all' && p === 0 && !df && !dt) {
        setCached('transactions_p0', data.transactions, 60_000);
        setCached('transactions_p0_total', tot, 60_000);
      }
    } catch {
      if (!getStale('transactions_p0')) toast.error('Failed to load transactions');
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchTransactions(filter, page, dateFrom, dateTo);
  }, [user?.id, isInitializing, router, filter, page, dateFrom, dateTo, fetchTransactions]);

  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const changeFilter = (f) => { setFilter(f); setPage(0); };
  const clearDates = () => { setDateFrom(''); setDateTo(''); setPage(0); };

  const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

  if (loading && transactions.length === 0) {
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
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Transactions</h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>{total.toLocaleString()} total records</p>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {FILTERS.map(f => {
              const active = filter === f;
              const meta = TYPE_META[f];
              return (
                <button key={f} onClick={() => changeFilter(f)} style={{
                  padding: '0.35rem 0.875rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${active ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.15s',
                }}>
                  {f === 'all' ? 'All' : (meta?.label || f)}
                </button>
              );
            })}
          </div>

          {/* Date range filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(0); }}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.35rem 0.65rem', color: dateFrom ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: '0.75rem', outline: 'none', colorScheme: 'dark' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(0); }}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.35rem 0.65rem', color: dateTo ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: '0.75rem', outline: 'none', colorScheme: 'dark' }}
            />
            {(dateFrom || dateTo) && (
              <button onClick={clearDates} style={{ padding: '0.35rem 0.65rem', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3"/>
                <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '4rem 1rem', textAlign: 'center' }}>
              <Filter size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No transactions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.map(tx => {
                const meta = TYPE_META[tx.type] || TYPE_META.recharge;
                const Icon = meta.icon;
                const isCredit = meta.sign === '+';
                const sc = STATUS_COLOR[tx.status] || STATUS_COLOR.pending;
                return (
                  <div key={tx.id} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 14, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `${meta.accent}20`, border: `1px solid ${meta.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={meta.accent} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{meta.label}</p>
                        {tx.payment_method && tx.payment_method !== 'binance' && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>· {tx.payment_method.replace('_', ' ')}</span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{fmtDate(tx.timestamp)}</p>
                      {tx.reference_id && (
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontFamily: 'monospace', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Ref: {tx.reference_id}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: isCredit ? '#10b981' : '#f87171' }}>
                        {isCredit ? '+' : '-'}{Number(tx.amount_NSL).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>NSL</span>
                      </p>
                      {tx.amount_usdt > 0 && (
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>${Number(tx.amount_usdt).toFixed(2)}</p>
                      )}
                      <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                        {tx.status}
                      </span>
                      {tx.status === 'pending' && (
                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>Awaiting financial admin</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.875rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}>
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.875rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: page >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
