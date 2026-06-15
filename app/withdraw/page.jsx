'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, X, AlertTriangle, CheckCircle, ChevronRight, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const NETWORKS = ['TRC20', 'BSC', 'ETH'];
const NSL_TO_USDT = parseFloat(process.env.NEXT_PUBLIC_NSL_TO_USDT || 23);
const SLL_PER_NSL = parseFloat(process.env.NEXT_PUBLIC_ORANGE_SLL_PER_NSL || 1);
const CRYPTO_FEE_PCT = 10;
const OM_FEE_PCT = 20;

const S = {
  bg: 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)',
  card: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '1.5rem' },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0.8rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  },
  label: { display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', fontWeight: 600 },
};

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  const ts = new Date(receipt.timestamp);
  const formatted = ts.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(59,130,246,0.6))', padding: '1.5rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', lineHeight: 0 }}><X size={18} /></button>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>SalonMoney</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Withdrawal Receipt</p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{formatted}</p>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            ['Reference', receipt.reference || receipt.orderId || '—', '#fff', true],
            ['Method', receipt.method === 'orange' ? 'Orange Money' : 'Crypto Wallet', '#a78bfa', false],
            ['Destination', receipt.destination, 'rgba(255,255,255,0.7)', true],
            null,
            ['Amount', `${receipt.amount.toLocaleString()} NSL`, '#fff', false],
            [`Fee (${receipt.method === 'orange' ? OM_FEE_PCT : CRYPTO_FEE_PCT}%)`, `−${receipt.fee.toLocaleString()} NSL`, '#f87171', false],
            ['You receive', receipt.method === 'orange'
              ? `${receipt.netSLL?.toLocaleString()} SLE`
              : `${receipt.netNSL.toLocaleString()} NSL ≈ $${receipt.usdt}`, '#10b981', false],
            null,
            ['Status', 'Pending Admin Approval', '#f59e0b', false],
          ].map((row, i) => row === null ? (
            <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />
          ) : (
            <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{row[0]}</span>
              <span style={{ fontSize: '0.78rem', color: row[2], fontWeight: 600, textAlign: 'right', wordBreak: 'break-all', fontFamily: row[3] ? 'monospace' : 'inherit' }}>{row[1]}</span>
            </div>
          ))}
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.5rem' }}>Funds sent within 24h after approval.</p>
        </div>
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '0.8rem', borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            View Transactions
          </button>
        </div>
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
  const router = useRouter();

  const [amount_NSL, setAmount_NSL] = useState('');
  const [address, setAddress]       = useState('');
  const [network, setNetwork]       = useState('TRC20');
  const [omAmount, setOmAmount]     = useState('');
  const [omPhone, setOmPhone]       = useState('');

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    api.get('/user/dashboard').then(({ data }) => setBalance(data.user?.balance_NSL || 0)).catch(() => {});
  }, [user?.id, isInitializing, router]);

  const amt  = parseFloat(amount_NSL) || 0;
  const fee  = parseFloat((amt * CRYPTO_FEE_PCT / 100).toFixed(4));
  const net  = parseFloat((amt - fee).toFixed(4));
  const usdt = (net / NSL_TO_USDT).toFixed(2);

  const handleCryptoWithdraw = async (e) => {
    e.preventDefault();
    if (amt < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (amt > balance) return toast.error('Insufficient balance');
    if (!address.trim()) return toast.error('Wallet address is required');
    setIsLoading(true);
    try {
      const { data } = await api.post('/user/withdraw', { amount_NSL: amt, withdrawal_address: address.trim(), withdrawal_network: network });
      toast.success(data.message || 'Withdrawal submitted!');
      setReceipt({ method: 'crypto', amount: amt, fee, netNSL: net, usdt, destination: address.trim(), timestamp: new Date(), reference: data.reference_id });
      setAmount_NSL(''); setAddress('');
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally { setIsLoading(false); }
  };

  const omNsl = parseFloat(omAmount) || 0;
  const omFee = parseFloat((omNsl * OM_FEE_PCT / 100).toFixed(4));
  const omNet = parseFloat((omNsl - omFee).toFixed(4));
  const omSLL = Math.round(omNet * SLL_PER_NSL);

  const handleOmWithdraw = async (e) => {
    e.preventDefault();
    if (omNsl < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (omNsl > balance) return toast.error('Insufficient balance');
    if (!omPhone.trim()) return toast.error('Phone number is required');
    setIsLoading(true);
    try {
      const { data } = await api.post('/orange-money/withdraw', { amount_NSL: omNsl, phone: omPhone.trim() });
      toast.success(data.message || 'Withdrawal submitted!');
      setReceipt({ method: 'orange', amount: omNsl, fee: omFee, netNSL: omNet, netSLL: omSLL, destination: omPhone.trim(), timestamp: new Date(), reference: data.order_id });
      setOmAmount(''); setOmPhone('');
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally { setIsLoading(false); }
  };

  return (
    <Layout>
      <ReceiptModal receipt={receipt} onClose={() => { setReceipt(null); router.push('/transactions'); }} />
      <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem 1rem 3rem', position: 'relative' }}>
        {/* Aurora */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Withdraw Funds</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Funds sent after admin approval — within 24h</p>

          {/* Balance */}
          <div style={{ ...S.card, marginBottom: '1.25rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Wallet size={14} color="#a78bfa" />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Available Balance</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{parseFloat(balance).toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#a78bfa' }}>NSL</span></p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>${(balance / NSL_TO_USDT).toFixed(2)} USDT</p>
          </div>

          {/* KYC Gate */}
          {user && !user.kyc_verified && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 18, padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={26} color="#f87171" />
                </div>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Identity Verification Required</h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                You must complete KYC verification before you can withdraw funds. This protects your account and ensures secure transactions.
              </p>
              <button
                onClick={() => router.push('/account/kyc')}
                style={{ padding: '0.8rem 2rem', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShieldAlert size={15} /> Verify My Identity
              </button>
            </div>
          )}

          {/* Method Tabs + Form — only shown when KYC passed */}
          {user?.kyc_verified && <>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.25rem', marginBottom: '1.25rem' }}>
            {[['crypto', 'Crypto Wallet'], ['orange', 'Orange Money']].map(([key, label]) => (
              <button key={key} onClick={() => setMethod(key)} style={{
                flex: 1, padding: '0.65rem', borderRadius: 9, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                background: method === key ? (key === 'crypto' ? 'rgba(167,139,250,0.25)' : 'rgba(249,115,22,0.25)') : 'transparent',
                color: method === key ? (key === 'crypto' ? '#a78bfa' : '#fb923c') : 'rgba(255,255,255,0.4)',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          <div style={S.card}>
            {method === 'crypto' ? (
              <form onSubmit={handleCryptoWithdraw}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={S.label}>Amount (NSL)</label>
                  <input type="number" min="100" step="0.01" max={balance} value={amount_NSL} onChange={e => setAmount_NSL(e.target.value)} placeholder="Min 100 NSL" style={S.input} required />
                </div>

                {amt >= 100 && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <FeeRow label="You send" value={`${amt.toLocaleString()} NSL`} color="#fff" />
                    <FeeRow label={`Fee (${CRYPTO_FEE_PCT}%)`} value={`−${fee.toLocaleString()} NSL`} color="#f87171" />
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.15rem 0' }} />
                    <FeeRow label="You receive" value={`${net.toLocaleString()} NSL ≈ $${usdt}`} color="#10b981" bold />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={S.label}>Wallet Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Paste your USDT wallet address" style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.8rem' }} required />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={S.label}>Network</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {NETWORKS.map(n => (
                      <button key={n} type="button" onClick={() => setNetwork(n)} style={{
                        flex: 1, padding: '0.6rem', borderRadius: 9, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        background: network === n ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${network === n ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: network === n ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Double-check your wallet address and network. Wrong address = permanent loss of funds.</p>
                </div>

                <button type="submit" disabled={isLoading || amt < 100 || amt > balance || !address.trim()} style={{
                  width: '100%', padding: '0.875rem', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
                  background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa',
                  opacity: isLoading || amt < 100 || amt > balance || !address.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}>
                  {isLoading ? 'Submitting…' : <><ChevronRight size={15} /> Request Withdrawal</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOmWithdraw}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={S.label}>Amount (NSL)</label>
                  <input type="number" min="100" step="1" max={balance} value={omAmount} onChange={e => setOmAmount(e.target.value)} placeholder="Min 100 NSL" style={S.input} required />
                </div>

                {omNsl >= 100 && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <FeeRow label="You send" value={`${omNsl.toLocaleString()} NSL`} color="#fff" />
                    <FeeRow label={`Fee (${OM_FEE_PCT}%)`} value={`−${omFee.toLocaleString()} SLE`} color="#f87171" />
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.15rem 0' }} />
                    <FeeRow label="You receive" value={`${omSLL.toLocaleString()} SLE`} color="#fb923c" bold />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={S.label}>Orange Money Number</label>
                  <input type="tel" value={omPhone} onChange={e => setOmPhone(e.target.value)} placeholder="+232 XX XXX XXXX" style={S.input} required />
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.35rem' }}>Funds sent directly to this number</p>
                </div>

                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Verify your Orange Money number carefully. Funds sent to the wrong number cannot be recovered.</p>
                </div>

                <button type="submit" disabled={isLoading || omNsl < 100 || omNsl > balance || !omPhone.trim()} style={{
                  width: '100%', padding: '0.875rem', borderRadius: 12, fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer',
                  background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)', color: '#fb923c',
                  opacity: isLoading || omNsl < 100 || omNsl > balance || !omPhone.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}>
                  {isLoading ? 'Submitting…' : <><ChevronRight size={15} /> Withdraw via Orange Money</>}
                </button>
              </form>
            )}
          </div>

          {/* Process steps */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Process</p>
            {[
              method === 'crypto' ? 'Submit request' : 'Submit request — balance deducted immediately',
              'Finance admin reviews within 24h',
              method === 'crypto' ? 'If approved, USDT sent to your wallet' : 'SLE sent to your Orange Money number',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', color: method === 'crypto' ? '#a78bfa' : '#fb923c', fontWeight: 700, minWidth: 14 }}>{i + 1}.</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{step}</span>
              </div>
            ))}
          </div>
          </>}
        </div>
      </div>
    </Layout>
  );
}

function FeeRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: bold ? 800 : 600, color, fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
