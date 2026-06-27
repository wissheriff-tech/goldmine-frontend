'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, X, AlertTriangle, ChevronRight, ShieldAlert, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import { API_ROUTES, APP_ROUTES } from '@/utils/navigation';
import Layout from '@/components/common/Layout';

const NETWORKS = ['TRC20', 'BSC', 'ETH'];
const DEFAULT_NSL_TO_USDT = 23;
const DEFAULT_CRYPTO_FEE = 10;
const DEFAULT_MOBILE_FEE = 20;

const METHODS = [
  { key: 'crypto',       label: 'Crypto',       color: '#a78bfa', activeBg: 'rgba(167,139,250,0.25)', accent: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)' },
  { key: 'orange_money', label: 'Orange Money', color: '#fb923c', activeBg: 'rgba(249,115,22,0.25)',  accent: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.35)'  },
  { key: 'africell',     label: 'Africell',     color: '#60a5fa', activeBg: 'rgba(59,130,246,0.25)',  accent: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)'  },
];

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  icon: Clock },
  approved:  { label: 'Approved',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: XCircle },
};

const S = {
  bg: 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)',
  card: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '1.5rem' },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0.8rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  },
  label: { display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
};

function FeeRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: bold ? 800 : 600, color, fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  const ts = new Date(receipt.timestamp);
  const formatted = ts.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const isCrypto = receipt.method === 'crypto';
  const isOrange = receipt.method === 'orange_money';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'rgba(10,6,25,0.98)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.7))', padding: '1.5rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '0.3rem', lineHeight: 0 }}><X size={16} /></button>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Wallet size={22} color="#fff" />
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>Withdrawal Submitted</p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{formatted}</p>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            ['Reference', receipt.reference || '—', '#fff', true],
            ['Method', isCrypto ? `Crypto — ${receipt.network || 'TRC20'}` : isOrange ? 'Orange Money' : 'Africell', '#a78bfa', false],
            ['Destination', receipt.destination, 'rgba(255,255,255,0.65)', true],
          ].map(([k, v, c, mono]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: '0.78rem', color: c, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</span>
            </div>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.1rem 0' }} />

          <FeeRow label="Amount" value={`${receipt.amount.toLocaleString()} NSL`} color="#fff" />
          <FeeRow label={`Fee (${receipt.feePct}%)`} value={`−${receipt.fee.toLocaleString()} NSL`} color="#f87171" />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.1rem 0' }} />
          <FeeRow label="You receive" value={isCrypto ? `$${receipt.usdt} USDT` : `${receipt.netNSL.toLocaleString()} NSL`} color="#10b981" bold />

          <div style={{ marginTop: '0.25rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '0.6rem 0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Clock size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Pending review — funds sent within 24h after admin approval.</p>
          </div>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ tx, nslRate }) {
  const isCrypto = !tx.payment_method || (tx.payment_method !== 'orange_money' && tx.payment_method !== 'africell');
  const isOrange = tx.payment_method === 'orange_money';
  const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const amount = parseFloat(tx.amount_NSL) || 0;
  const notes = (() => { try { return JSON.parse(tx.notes || '{}'); } catch { return {}; } })();
  const dest = isCrypto ? tx.withdrawal_address : notes.phone || tx.reference_id || '—';
  const date = new Date(tx.timestamp || tx.created_at);
  const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const methodColor = isCrypto ? '#a78bfa' : isOrange ? '#fb923c' : '#60a5fa';
  const methodLabel = isCrypto ? `Crypto (${tx.withdrawal_network || 'TRC20'})` : isOrange ? 'Orange Money' : 'Africell';

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: `rgba(${isCrypto ? '167,139,250' : isOrange ? '249,115,22' : '59,130,246'},0.15)`, border: `1px solid rgba(${isCrypto ? '167,139,250' : isOrange ? '249,115,22' : '59,130,246'},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Wallet size={17} color={methodColor} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{amount.toLocaleString()} NSL</span>
          <span style={{ fontSize: '0.65rem', color: methodColor, background: `rgba(${isCrypto ? '167,139,250' : isOrange ? '249,115,22' : '59,130,246'},0.12)`, border: `1px solid rgba(${isCrypto ? '167,139,250' : isOrange ? '249,115,22' : '59,130,246'},0.25)`, borderRadius: 20, padding: '0.1rem 0.45rem', fontWeight: 700 }}>{methodLabel}</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest}</p>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.15rem' }}>{dateStr} · {timeStr}</p>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '0.25rem 0.6rem' }}>
        <Icon size={11} color={cfg.color} />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  );
}

export default function Withdraw() {
  const { user, isInitializing } = useAuthStore();
  const [method, setMethod]       = useState('crypto');
  const [balance, setBalance]     = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt]     = useState(null);
  const [nslRate, setNslRate]     = useState(DEFAULT_NSL_TO_USDT);
  const [cryptoFeePct, setCryptoFeePct] = useState(DEFAULT_CRYPTO_FEE);
  const [mobileFeePct, setMobileFeePct] = useState(DEFAULT_MOBILE_FEE);
  const router = useRouter();

  // Crypto fields
  const [amount_NSL, setAmount_NSL] = useState('');
  const [address, setAddress]       = useState('');
  const [network, setNetwork]       = useState('TRC20');

  // Mobile money fields
  const [mobileAmount, setMobileAmount] = useState('');
  const [mobilePhone, setMobilePhone]   = useState('');

  // History
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage]   = useState(0);
  const PAGE_SIZE = 10;

  const fetchHistory = useCallback(async (page = 0) => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/user/transactions?type=withdrawal&limit=${PAGE_SIZE}&skip=${page * PAGE_SIZE}`);
      if (page === 0) {
        setHistory(data.transactions || []);
      } else {
        setHistory(prev => [...prev, ...(data.transactions || [])]);
      }
      setHistoryTotal(data.pagination?.total || 0);
      setHistoryPage(page);
    } catch {
      toast.error('Could not load withdrawal history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push(APP_ROUTES.login); return; }
    Promise.allSettled([
      api.get(API_ROUTES.user.dashboard),
      api.get('/finance/nsl-rate'),
      api.get('/finance/withdrawal-fees'),
    ]).then(([dashRes, rateRes, feesRes]) => {
      if (dashRes.status === 'fulfilled') setBalance(dashRes.value.data.user?.balance_NSL || 0);
      if (rateRes.status === 'fulfilled') setNslRate(parseFloat(rateRes.value.data.nsl_per_usdt) || DEFAULT_NSL_TO_USDT);
      if (feesRes.status === 'fulfilled') {
        setCryptoFeePct(feesRes.value.data.crypto_fee_pct ?? DEFAULT_CRYPTO_FEE);
        setMobileFeePct(feesRes.value.data.mobile_fee_pct ?? DEFAULT_MOBILE_FEE);
      }
    });
    fetchHistory(0);
  }, [user?.id, isInitializing, router, fetchHistory]);

  const isCrypto = method === 'crypto';
  const meth = METHODS.find(m => m.key === method);
  const accentColor  = meth?.color   || '#a78bfa';
  const accentBg     = meth?.accent  || 'rgba(167,139,250,0.15)';
  const accentBorder = meth?.border  || 'rgba(167,139,250,0.35)';
  const accentActive = meth?.activeBg || 'rgba(167,139,250,0.25)';

  // Crypto calcs
  const amt  = parseFloat(amount_NSL) || 0;
  const fee  = parseFloat((amt * cryptoFeePct / 100).toFixed(2));
  const net  = parseFloat((amt - fee).toFixed(2));
  const usdt = (net / nslRate).toFixed(2);

  // Mobile calcs
  const mAmt = parseFloat(mobileAmount) || 0;
  const mFee = parseFloat((mAmt * mobileFeePct / 100).toFixed(2));
  const mNet = parseFloat((mAmt - mFee).toFixed(2));

  const handleCryptoWithdraw = async (e) => {
    e.preventDefault();
    if (amt < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (amt > balance) return toast.error('Insufficient balance');
    if (!address.trim()) return toast.error('Wallet address is required');
    setIsLoading(true);
    try {
      const { data } = await api.post('/user/withdraw', { amount_NSL: amt, withdrawal_address: address.trim(), withdrawal_network: network });
      setReceipt({ method: 'crypto', amount: amt, fee, feePct: cryptoFeePct, netNSL: net, usdt, destination: address.trim(), network, timestamp: new Date(), reference: data.reference_id });
      setAmount_NSL(''); setAddress('');
      fetchHistory(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally { setIsLoading(false); }
  };

  const handleMobileWithdraw = async (e) => {
    e.preventDefault();
    if (mAmt < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (mAmt > balance) return toast.error('Insufficient balance');
    if (!mobilePhone.trim()) return toast.error('Phone number is required');
    setIsLoading(true);
    try {
      const { data } = await api.post('/orange-money/withdraw', { amount_NSL: mAmt, phone: mobilePhone.trim(), provider: method });
      setReceipt({ method, amount: mAmt, fee: mFee, feePct: mobileFeePct, netNSL: mNet, destination: mobilePhone.trim(), timestamp: new Date(), reference: data.order_id });
      setMobileAmount(''); setMobilePhone('');
      fetchHistory(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally { setIsLoading(false); }
  };

  const hasMore = history.length < historyTotal;

  return (
    <Layout>
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem 1rem 4rem', position: 'relative' }}>
        {/* Aurora blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Back */}
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>Withdraw</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', marginBottom: '1.75rem' }}>Balance deducted on submission — paid within 24h after approval</p>

          {/* Balance card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.15))', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 20, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <Wallet size={13} color="rgba(167,139,250,0.7)" />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</span>
              </div>
              <p style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{parseFloat(balance).toLocaleString()} <span style={{ fontSize: '1rem', color: '#a78bfa', fontWeight: 700 }}>NSL</span></p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>≈ ${(balance / nslRate).toFixed(2)} USDT</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={24} color="#a78bfa" />
            </div>
          </div>

          {/* KYC Gate */}
          {user && !user.kyc_verified && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 18, padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShieldAlert size={24} color="#f87171" />
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>KYC Verification Required</h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.25rem' }}>Complete identity verification before withdrawing funds.</p>
              <button onClick={() => router.push('/account/kyc')} style={{ padding: '0.75rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldAlert size={14} /> Verify My Identity
              </button>
            </div>
          )}

          {/* Form — only when KYC passed */}
          {user?.kyc_verified && (
            <>
              {/* Method tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '0.3rem', marginBottom: '1.25rem' }}>
                {METHODS.map(({ key, label, color, activeBg }) => (
                  <button key={key} onClick={() => setMethod(key)} style={{
                    flex: 1, padding: '0.65rem 0.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', border: 'none',
                    background: method === key ? activeBg : 'transparent',
                    color: method === key ? color : 'rgba(255,255,255,0.38)',
                    transition: 'all 0.15s',
                  }}>{label}</button>
                ))}
              </div>

              <div style={S.card}>
                {isCrypto ? (
                  <form onSubmit={handleCryptoWithdraw}>
                    {/* Amount */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={S.label}>Amount (NSL)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" min="100" step="1" max={balance} value={amount_NSL}
                          onChange={e => setAmount_NSL(e.target.value)}
                          placeholder="Min 100 NSL"
                          style={{ ...S.input, paddingRight: '4.5rem' }}
                          required
                        />
                        <button type="button" onClick={() => setAmount_NSL(String(Math.floor(balance)))}
                          style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: accentActive, border: `1px solid ${accentBorder}`, borderRadius: 7, color: accentColor, fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    {amt >= 100 && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <FeeRow label="You withdraw" value={`${amt.toLocaleString()} NSL`} color="#fff" />
                        <FeeRow label={`Fee (${cryptoFeePct}%)`} value={`−${fee.toLocaleString()} NSL`} color="#f87171" />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.1rem 0' }} />
                        <FeeRow label="You receive" value={`$${usdt} USDT`} color="#10b981" bold />
                        <FeeRow label="Rate" value={`1 USDT = ${nslRate.toFixed(2)} NSL`} color="rgba(255,255,255,0.35)" />
                      </div>
                    )}

                    {/* Wallet address */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={S.label}>USDT Wallet Address</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Paste your wallet address" style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.78rem' }} required />
                    </div>

                    {/* Network */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={S.label}>Network</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {NETWORKS.map(n => (
                          <button key={n} type="button" onClick={() => setNetwork(n)} style={{
                            flex: 1, padding: '0.6rem', borderRadius: 9, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                            background: network === n ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${network === n ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: network === n ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.15s',
                          }}>{n}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: '0.74rem', color: 'rgba(245,158,11,0.85)', lineHeight: 1.5 }}>Double-check your wallet address and network. Wrong address = permanent loss of funds.</p>
                    </div>

                    <button type="submit" disabled={isLoading || amt < 100 || amt > balance || !address.trim()} style={{
                      width: '100%', padding: '0.9rem', borderRadius: 13, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      background: accentActive, border: `1px solid ${accentBorder}`, color: accentColor,
                      opacity: isLoading || amt < 100 || amt > balance || !address.trim() ? 0.45 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'opacity 0.15s',
                    }}>
                      {isLoading ? 'Submitting…' : <><ChevronRight size={16} /> Request Crypto Withdrawal</>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleMobileWithdraw}>
                    {/* Amount */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={S.label}>Amount (NSL)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" min="100" step="1" max={balance} value={mobileAmount}
                          onChange={e => setMobileAmount(e.target.value)}
                          placeholder="Min 100 NSL"
                          style={{ ...S.input, paddingRight: '4.5rem' }}
                          required
                        />
                        <button type="button" onClick={() => setMobileAmount(String(Math.floor(balance)))}
                          style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: accentActive, border: `1px solid ${accentBorder}`, borderRadius: 7, color: accentColor, fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    {mAmt >= 100 && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <FeeRow label="You withdraw" value={`${mAmt.toLocaleString()} NSL`} color="#fff" />
                        <FeeRow label={`Fee (${mobileFeePct}%)`} value={`−${mFee.toLocaleString()} NSL`} color="#f87171" />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.1rem 0' }} />
                        <FeeRow label="You receive" value={`${mNet.toLocaleString()} NSL equivalent`} color="#10b981" bold />
                      </div>
                    )}

                    {/* Phone */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={S.label}>{method === 'orange_money' ? 'Orange Money' : 'Africell'} Number</label>
                      <input type="tel" value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} placeholder="+232 XX XXX XXXX" style={S.input} required />
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.35rem' }}>NSL equivalent paid directly to this number after admin approval</p>
                    </div>

                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: '0.74rem', color: 'rgba(245,158,11,0.85)', lineHeight: 1.5 }}>Verify your {method === 'orange_money' ? 'Orange Money' : 'Africell'} number carefully. Funds sent to the wrong number cannot be recovered.</p>
                    </div>

                    <button type="submit" disabled={isLoading || mAmt < 100 || mAmt > balance || !mobilePhone.trim()} style={{
                      width: '100%', padding: '0.9rem', borderRadius: 13, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      background: accentActive, border: `1px solid ${accentBorder}`, color: accentColor,
                      opacity: isLoading || mAmt < 100 || mAmt > balance || !mobilePhone.trim() ? 0.45 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'opacity 0.15s',
                    }}>
                      {isLoading ? 'Submitting…' : <><ChevronRight size={16} /> Withdraw via {method === 'orange_money' ? 'Orange Money' : 'Africell'}</>}
                    </button>
                  </form>
                )}
              </div>

              {/* Process steps */}
              <div style={{ marginTop: '1rem', padding: '1rem 1.1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>How it works</p>
                {[
                  'Submit request — balance is deducted immediately',
                  'Finance admin reviews and processes within 24h',
                  isCrypto ? 'USDT sent to your wallet after approval' : `Funds paid to your ${method === 'orange_money' ? 'Orange Money' : 'Africell'} number`,
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.68rem', color: accentColor, fontWeight: 800, minWidth: 16, marginTop: '0.05rem' }}>{i + 1}.</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Withdrawal History ── */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Withdrawal History</h2>
                {historyTotal > 0 && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{historyTotal} total request{historyTotal !== 1 ? 's' : ''}</p>}
              </div>
              <button
                onClick={() => fetchHistory(0)}
                disabled={historyLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0.4rem 0.75rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={12} style={{ animation: historyLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>

            {historyLoading && history.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1rem 1.1rem', height: 72, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <Wallet size={32} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>No withdrawals yet</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>Your requests will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {history.map(tx => <HistoryItem key={tx.id} tx={tx} nslRate={nslRate} />)}

                {hasMore && (
                  <button
                    onClick={() => fetchHistory(historyPage + 1)}
                    disabled={historyLoading}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                    {historyLoading ? 'Loading…' : `Load more (${historyTotal - history.length} remaining)`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Layout>
  );
}
