'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TrendingUp, Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const PAGE_SIZE = 30;
const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtNSL(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function groupByDate(txs) {
  const groups = {};
  for (const tx of txs) {
    const day = fmtDate(tx.timestamp);
    if (!groups[day]) groups[day] = { day, total: 0, items: [] };
    groups[day].total += parseFloat(tx.amount_NSL);
    groups[day].items.push(tx);
  }
  return Object.values(groups);
}

function productFromNotes(notes) {
  if (!notes) return null;
  const m = notes.match(/^Daily income from (.+)$/);
  return m ? m[1] : null;
}

function StatCard({ label, value, sub, accent, big }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: `${accent}12`,
      border: `1px solid ${accent}30`,
      borderRadius: 16, padding: '1rem',
    }}>
      <p style={{ color: `${accent}cc`, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{label}</p>
      <p style={{ color: '#fff', fontSize: big ? '1.5rem' : '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
        {fmtNSL(value)} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>NSL</span>
      </p>
      {sub && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginTop: '0.25rem' }}>{sub}</p>}
    </div>
  );
}

export default function IncomePage() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { data } = await api.get('/user/income-summary');
      setSummary(data);
    } catch { toast.error('Failed to load income summary'); }
    finally { setSummaryLoading(false); }
  }, []);

  const fetchTransactions = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data } = await api.get('/user/transactions', { params: { type: 'income', limit: PAGE_SIZE, skip: p * PAGE_SIZE } });
      setTransactions(data.transactions);
      setTotal(data.pagination?.total || data.transactions.length);
    } catch { toast.error('Failed to load income history'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchSummary();
    fetchTransactions(0);
  }, [user?.id, isInitializing, router, fetchSummary, fetchTransactions]);

  useEffect(() => {
    if (!user || isInitializing) return;
    fetchTransactions(page);
  }, [page, fetchTransactions, user, isInitializing]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const groups = groupByDate(transactions);

  if (summaryLoading && !summary) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      </Layout>
    );
  }

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
              <TrendingUp size={22} color="#60a5fa" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Income History</h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>{total.toLocaleString()} payments received</p>
          </div>

          {/* Summary stats */}
          {summary && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <StatCard label="Today" value={summary.today_NSL} accent="#60a5fa" />
                <StatCard label="This Month" value={summary.this_month_NSL} accent="#a78bfa" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                <StatCard label="All Time" value={summary.all_time_NSL} sub={`${summary.total_payments} payments`} accent="#10b981" big />
                {summary.streak > 0 && (
                  <div style={{
                    flex: 1, minWidth: 0,
                    background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)',
                    borderRadius: 16, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Flame size={28} color="#fb923c" />
                    <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, marginTop: '0.3rem' }}>{summary.streak}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', marginTop: '0.2rem' }}>day streak</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* History list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Spinner /></div>
          ) : groups.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '4rem 1rem', textAlign: 'center' }}>
              <Calendar size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>No income received yet</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginTop: '0.3rem' }}>Buy a VIP plan to start earning daily</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {groups.map(group => (
                <div key={group.day}>
                  {/* Date header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>{group.day}</span>
                    <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 800 }}>+{fmtNSL(group.total)} NSL</span>
                  </div>
                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {group.items.map(tx => {
                      const product = productFromNotes(tx.notes);
                      return (
                        <div key={tx.id} style={{
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                          borderRadius: 13, padding: '0.75rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.875rem',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <TrendingUp size={15} color="#60a5fa" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>Daily Income</p>
                            {product && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.1rem' }}>{product}</p>}
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', marginTop: '0.1rem' }}>{fmtTime(tx.timestamp)}</p>
                          </div>
                          <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>
                            +{fmtNSL(tx.amount_NSL)} <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>NSL</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.875rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}>
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.875rem', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: page >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
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

function Spinner() {
  return (
    <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="3" />
      <path style={{ opacity: 0.8 }} fill="#60a5fa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
