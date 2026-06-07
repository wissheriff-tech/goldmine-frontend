'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, ShoppingBag, Users, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const PAGE_SIZE = 20;

const TYPE_META = {
  recharge:      { label: 'Recharge',      color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',  icon: ArrowDownLeft,  sign: '+' },
  income:        { label: 'Daily Income',  color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',    icon: TrendingUp,     sign: '+' },
  referral_bonus:{ label: 'Referral',      color: 'text-cyan-400',   bg: 'bg-cyan-400/10 border-cyan-400/20',    icon: Users,          sign: '+' },
  purchase:      { label: 'Purchase',      color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20',icon: ShoppingBag,    sign: '-' },
  renewal:       { label: 'Renewal',       color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20',icon: RefreshCw,      sign: '-' },
  withdrawal:    { label: 'Withdrawal',    color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',      icon: ArrowUpRight,   sign: '-' },
};

const STATUS_BADGE = {
  pending:   'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  approved:  'bg-green-500/15 text-green-300 border border-green-500/30',
  completed: 'bg-green-500/15 text-green-300 border border-green-500/30',
  rejected:  'bg-red-500/15 text-red-300 border border-red-500/30',
};

const FILTERS = ['all', 'recharge', 'withdrawal', 'income', 'purchase', 'referral_bonus', 'renewal'];

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function Transactions() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (f, p) => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, skip: p * PAGE_SIZE };
      if (f !== 'all') params.type = f;
      const { data } = await api.get('/user/transactions', { params });
      setTransactions(data.transactions);
      setTotal(data.pagination?.total || data.transactions.length);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchTransactions(filter, page);
  }, [user?.id, isInitializing, router, filter, page, fetchTransactions]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const changeFilter = (f) => { setFilter(f); setPage(0); };

  if (loading && transactions.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} total records</p>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => changeFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === f
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}>
                {f === 'all' ? 'All' : (TYPE_META[f]?.label || f)}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
              <Filter className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => {
                const meta = TYPE_META[tx.type] || TYPE_META.recharge;
                const Icon = meta.icon;
                const isCredit = meta.sign === '+';
                return (
                  <div key={tx.id} className={`bg-gray-900 border rounded-2xl px-4 py-3.5 flex items-center gap-3.5 ${meta.bg}`}>
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold">{meta.label}</p>
                        {tx.payment_method && tx.payment_method !== 'binance' && (
                          <span className="text-xs text-gray-500 capitalize">· {tx.payment_method.replace('_', ' ')}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{formatDate(tx.timestamp)}</p>
                      {tx.reference_id && (
                        <p className="text-gray-600 text-xs font-mono mt-0.5 truncate">Ref: {tx.reference_id}</p>
                      )}
                      {tx.notes && (
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{tx.notes}</p>
                      )}
                    </div>

                    {/* Amount + status */}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}{Number(tx.amount_NSL).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-xs font-normal">NSL</span>
                      </p>
                      {tx.amount_usdt > 0 && (
                        <p className="text-gray-500 text-xs">${Number(tx.amount_usdt).toFixed(2)}</p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[tx.status] || STATUS_BADGE.pending}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 disabled:opacity-30 hover:text-white transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-gray-500 text-sm">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 disabled:opacity-30 hover:text-white transition-colors text-sm">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
