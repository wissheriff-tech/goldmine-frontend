'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Users, DollarSign, CheckCircle, XCircle, Wallet, UserCheck, UserX, Activity, Clock, X, CreditCard, ChevronLeft, ChevronRight, Search, ArrowDownCircle, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { backendAssetUrl } from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '0.3rem' };

const TABS = [
  { id: 'transactions', label: 'Pending Transactions', Icon: Clock },
  { id: 'deposits',     label: 'Deposit Review',       Icon: ArrowDownCircle },
  { id: 'kyc',          label: 'KYC Review',           Icon: FileCheck },
  { id: 'users',        label: 'User Management',      Icon: Users },
  { id: 'payments',     label: 'Payments',             Icon: CreditCard },
  { id: 'activity',    label: 'Activity Log',          Icon: Activity, superadmin: true },
];

function parseTransactionNotes(notes) {
  if (!notes || typeof notes !== 'string') return { data: {}, isJson: false };
  try {
    const parsed = JSON.parse(notes);
    return { data: parsed && typeof parsed === 'object' ? parsed : {}, isJson: true };
  } catch {
    return { data: {}, isJson: false };
  }
}

export default function FinancePage() {
  const { user, isInitializing } = useAuthStore();
  const router   = useRouter();
  const [activeTab,   setActiveTab]   = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [users,        setUsers]        = useState([]);
  const [activityLog,  setActivityLog]  = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({ amount_NSL: '', amount_usdt: '', reason: '' });
  const [nslRate,      setNslRate]      = useState(23.99);
  const [ledger,         setLedger]         = useState([]);
  const [ledgerTotal,    setLedgerTotal]    = useState(0);
  const [ledgerPage,     setLedgerPage]     = useState(1);
  const [ledgerPages,    setLedgerPages]    = useState(1);
  const [ledgerMonth,    setLedgerMonth]    = useState('');
  const [ledgerSearch,   setLedgerSearch]   = useState('');
  const [paymentStatus,  setPaymentStatus]  = useState({ earning: [], matured: [] });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cashoutData,    setCashoutData]    = useState({ users: [], thresholds: { min_nsl: 150, min_referrals: 5 } });
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const [mobileDeposits,      setMobileDeposits]      = useState([]);
  const [kycSubmissions,      setKycSubmissions]       = useState([]);
  const [selectedDeposit,     setSelectedDeposit]     = useState(null);
  const [depositReviewModal,  setDepositReviewModal]  = useState(false);
  const [depositReviewNSL,    setDepositReviewNSL]    = useState('');
  const [depositReviewNotes,  setDepositReviewNotes]  = useState('');
  const [selectedKYCUser,     setSelectedKYCUser]     = useState(null);
  const [kycRejectModal,      setKycRejectModal]      = useState(false);
  const [kycRejectReason,     setKycRejectReason]     = useState('');

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some(tab => tab.id === requestedTab)) setActiveTab(requestedTab);
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user || (user.role !== 'superadmin' && user.role !== 'finance')) {
      router.push('/dashboard'); return;
    }
    fetchData();
    api.get('/finance/nsl-rate').then(({ data }) => setNslRate(parseFloat(data.nsl_per_usdt) || 23.99)).catch(() => {});
  }, [user, isInitializing, router, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transactions') {
        const { data } = await api.get('/finance/transactions?status=pending');
        setTransactions(data.transactions);
      } else if (activeTab === 'deposits') {
        const { data } = await api.get('/admin/mobile-deposits/pending');
        setMobileDeposits(data.data || []);
      } else if (activeTab === 'kyc') {
        const { data } = await api.get('/admin/kyc/pending');
        setKycSubmissions(data.data || []);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/finance/users');
        setUsers(data.users);
      } else if (activeTab === 'activity' && user.role === 'superadmin') {
        const { data } = await api.get('/finance/activity-log');
        setActivityLog(data.activities);
      } else if (activeTab === 'payments') {
        setPaymentLoading(true);
        setCashoutLoading(true);
        const [statusRes] = await Promise.all([
          api.get('/admin/payment-status'),
          fetchLedger(1, ledgerMonth, ledgerSearch),
          api.get('/admin/cashout-eligibility').then(({ data }) => setCashoutData(data)).catch(() => {}).finally(() => setCashoutLoading(false)),
        ]);
        setPaymentStatus(statusRes.data);
        setPaymentLoading(false);
      }
    } catch { toast.error('Failed to load data');
    } finally { setIsLoading(false); }
  };

  const fetchLedger = async (page = ledgerPage, month = ledgerMonth, search = ledgerSearch) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (month) params.set('month', month);
      if (search.trim()) params.set('search', search.trim());
      const { data } = await api.get(`/admin/vip-ledger?${params}`);
      setLedger(data.ledger);
      setLedgerTotal(data.total);
      setLedgerPage(data.page);
      setLedgerPages(data.pages);
    } catch { toast.error('Failed to load VIP ledger');
    } finally { setIsLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/finance/transactions/${id}/approve`, { reason: 'Approved by financial admin' });
      toast.success('Transaction approved'); fetchData();
    } catch (err) {
      const detail = err.response?.data?.errorDetail || err.response?.data?.error;
      const msg = err.response?.data?.message || 'Failed to approve';
      toast.error(detail ? `${msg}: ${detail}` : msg);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await api.patch(`/finance/transactions/${id}/reject`, { reason });
      toast.success('Transaction rejected'); fetchData();
    } catch { toast.error('Failed to reject'); }
  };

  const handleNslChange = (val) => {
    const nsl = val === '' ? '' : val;
    const usdt = val !== '' && !isNaN(parseFloat(val)) ? (parseFloat(val) / nslRate).toFixed(2) : '';
    setCurrencyForm(f => ({ ...f, amount_NSL: nsl, amount_usdt: usdt }));
  };

  const handleUsdtChange = (val) => {
    const usdt = val === '' ? '' : val;
    const nsl = val !== '' && !isNaN(parseFloat(val)) ? (parseFloat(val) * nslRate).toFixed(2) : '';
    setCurrencyForm(f => ({ ...f, amount_usdt: usdt, amount_NSL: nsl }));
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    if (!currencyForm.reason || currencyForm.reason.trim().length < 3) {
      toast.error('Reason must be at least 3 characters'); return;
    }
    try {
      await api.patch(`/finance/users/${selectedUser.id}/add-currency`, currencyForm);
      toast.success('Currency added'); setShowModal(false);
      setCurrencyForm({ amount_NSL: '', amount_usdt: '', reason: '' }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add currency'); }
  };

  const handleSuspend = async (id) => {
    const reason = prompt('Suspension reason (optional):');
    try { await api.patch(`/finance/users/${id}/suspend`, { reason }); toast.success('User suspended'); fetchData();
    } catch { toast.error('Failed to suspend'); }
  };

  const handleActivate = async (id) => {
    try { await api.patch(`/finance/users/${id}/activate`, {}); toast.success('User activated'); fetchData();
    } catch { toast.error('Failed to activate'); }
  };

  const handleApproveUser = async (id) => {
    try { await api.patch(`/finance/users/${id}/approve`, {}); toast.success('User approved'); fetchData();
    } catch { toast.error('Failed to approve'); }
  };

  const handleDepositApprove = async () => {
    if (!selectedDeposit) return;
    try {
      await api.patch(`/admin/transaction/${selectedDeposit.id}/approve`, {
        approved_NSL: depositReviewNSL || selectedDeposit.amount_NSL,
        notes: depositReviewNotes,
      });
      toast.success('Deposit approved');
      setDepositReviewModal(false);
      setSelectedDeposit(null);
      setDepositReviewNSL('');
      setDepositReviewNotes('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve deposit');
    }
  };

  const handleDepositReject = async () => {
    if (!selectedDeposit) return;
    const reason = prompt('Rejection reason (optional):') || 'Rejected by finance admin';
    try {
      await api.patch(`/admin/transaction/${selectedDeposit.id}/reject`, { reason });
      toast.success('Deposit rejected');
      setDepositReviewModal(false);
      setSelectedDeposit(null);
      fetchData();
    } catch { toast.error('Failed to reject deposit'); }
  };

  const handleKYCApprove = async (userId) => {
    try {
      await api.patch(`/admin/kyc/${userId}/approve`);
      toast.success('KYC approved');
      fetchData();
    } catch { toast.error('Failed to approve KYC'); }
  };

  const handleKYCReject = async () => {
    if (!selectedKYCUser) return;
    try {
      await api.patch(`/admin/kyc/${selectedKYCUser.id}/reject`, { reason: kycRejectReason || 'Rejected by finance admin' });
      toast.success('KYC rejected');
      setKycRejectModal(false);
      setSelectedKYCUser(null);
      setKycRejectReason('');
      fetchData();
    } catch { toast.error('Failed to reject KYC'); }
  };

  const TYPE_COLOR = (type) => type === 'recharge'
    ? { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981' }
    : { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' };

  const STATUS_COLOR = (status) => ({
    pending:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
    approved: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    rejected: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
    active:   { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    frozen:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
    pending_approval: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  }[status] || { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' });

  const Badge = ({ label, status }) => {
    const c = STATUS_COLOR(status);
    return <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, fontSize: '0.62rem', fontWeight: 800, background: c.bg, border: `1px solid ${c.border}`, color: c.color, letterSpacing: '0.04em' }}>{label.toUpperCase()}</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
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
      {/* Add Currency modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 420, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(124,58,237,0.3)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>Add Currency</p>
                <p style={{ fontWeight: 800, color: '#fff' }}>{selectedUser?.phone} · {selectedUser?.username}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCurrency} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>NSL: <strong style={{ color: '#60a5fa' }}>{selectedUser?.balance_NSL?.toFixed(2)}</strong></span>
                <span>USDT: <strong style={{ color: '#10b981' }}>{selectedUser?.balance_usdt?.toFixed(2)}</strong></span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Rate: 1 USDT = {nslRate} NSL</span>
              </div>
              <div>
                <label style={labelStyle}>Amount NSL</label>
                <input
                  type="number" step="0.01" min="0"
                  value={currencyForm.amount_NSL}
                  onChange={e => handleNslChange(e.target.value)}
                  style={inputStyle} placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Amount USDT</label>
                <input
                  type="number" step="0.01" min="0"
                  value={currencyForm.amount_usdt}
                  onChange={e => handleUsdtChange(e.target.value)}
                  style={inputStyle} placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Reason <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(min 3 chars)</span></label>
                <textarea rows={3} value={currencyForm.reason} onChange={e => setCurrencyForm(f => ({ ...f, reason: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} placeholder="Reason for adding…" />
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button type="button" onClick={() => { setShowModal(false); setCurrencyForm({ amount_NSL: '', amount_usdt: '', reason: '' }); }} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>Add Currency</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Review Modal */}
      {depositReviewModal && selectedDeposit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 460, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(16,185,129,0.2)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>Review Deposit</p>
                <p style={{ fontWeight: 800, color: '#fff' }}>{selectedDeposit.user?.username} · {selectedDeposit.user?.phone}</p>
              </div>
              <button onClick={() => { setDepositReviewModal(false); setSelectedDeposit(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Method: <span style={{ color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>{(selectedDeposit.payment_method || '').replace('_', ' ')}</span></p>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Requested: <span style={{ color: '#60a5fa', fontWeight: 700 }}>{parseFloat(selectedDeposit.amount_NSL || 0).toLocaleString()} NSL</span></p>
                {selectedDeposit.reference_id && <p style={{ color: 'rgba(255,255,255,0.5)' }}>Reference: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{selectedDeposit.reference_id}</span></p>}
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>{new Date(selectedDeposit.created_at).toLocaleString()}</p>
              </div>
              {selectedDeposit.payment_proof && (
                <a href={backendAssetUrl(selectedDeposit.payment_proof)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                  Open Receipt Image
                </a>
              )}
              <div>
                <label style={labelStyle}>Approved NSL Amount <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(leave blank to use submitted amount)</span></label>
                <input type="number" step="0.01" min="0" value={depositReviewNSL} onChange={e => setDepositReviewNSL(e.target.value)} style={inputStyle} placeholder={String(parseFloat(selectedDeposit.amount_NSL || 0))} />
              </div>
              <div>
                <label style={labelStyle}>Admin Notes <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
                <input type="text" value={depositReviewNotes} onChange={e => setDepositReviewNotes(e.target.value)} style={inputStyle} placeholder="Any notes…" />
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button onClick={handleDepositReject} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>Reject</button>
                <button onClick={handleDepositApprove} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Reject Modal */}
      {kycRejectModal && selectedKYCUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 420, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(248,113,113,0.15)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>Reject KYC</p>
                <p style={{ fontWeight: 800, color: '#fff' }}>{selectedKYCUser.username} · {selectedKYCUser.phone}</p>
              </div>
              <button onClick={() => { setKycRejectModal(false); setSelectedKYCUser(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={labelStyle}>Rejection Reason <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
                <textarea rows={3} value={kycRejectReason} onChange={e => setKycRejectReason(e.target.value)} style={{ ...inputStyle, resize: 'none' }} placeholder="Document unclear, ID expired, selfie mismatch…" />
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button onClick={() => { setKycRejectModal(false); setSelectedKYCUser(null); }} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                <button onClick={handleKYCReject} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>Reject KYC</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Finance Management</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.75rem' }}>Manage transactions and user accounts</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.25rem', width: 'fit-content', flexWrap: 'wrap' }}>
            {TABS.filter(t => !t.superadmin || user.role === 'superadmin').map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 9, border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: activeTab === id ? 'rgba(167,139,250,0.2)' : 'none', color: activeTab === id ? '#a78bfa' : 'rgba(255,255,255,0.45)' }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Transactions */}
          {activeTab === 'transactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {transactions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No pending transactions
                </div>
              ) : transactions.map((tx) => {
                const tc = TYPE_COLOR(tx.type);
                const parsedNotes = parseTransactionNotes(tx.notes);
                const receiptNotes = parsedNotes.data;
                const proofUrl = tx.payment_proof ? backendAssetUrl(tx.payment_proof) : '';
                return (
                  <div key={tx.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Badge label={tx.type} status={tx.type} />
                        <Badge label={tx.status} status={tx.status} />
                      </div>
                      {[
                        ['User',         tx.user?.phone || 'N/A', '#fff'],
                        ['Amount NSL',   tx.amount_NSL, '#60a5fa'],
                        ['Amount USDT',  tx.amount_usdt, '#10b981'],
                        ['Balance NSL',  tx.user?.balance_NSL, 'rgba(255,255,255,0.6)'],
                        ['Balance USDT', tx.user?.balance_usdt, 'rgba(255,255,255,0.6)'],
                      ].map(([label, value, color]) => (
                        <p key={label} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                          {label}: <span style={{ fontWeight: 700, color }}>{value}</span>
                        </p>
                      ))}
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(tx.created_at).toLocaleString()}</p>
                      {tx.type === 'recharge' && (tx.reference_id || proofUrl || receiptNotes.sender_number || receiptNotes.receiver_number) && (
                        <div style={{ marginTop: '0.35rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.42)', fontWeight: 800 }}>Receipt proof</p>
                          {tx.reference_id && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)' }}>Reference: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800 }}>{tx.reference_id}</span></p>}
                          {tx.deposit_network && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)' }}>Network: <span style={{ color: '#fff', fontWeight: 800 }}>{tx.deposit_network}</span></p>}
                          {(receiptNotes.sender_number || receiptNotes.receiver_number) && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)' }}>Number: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800 }}>{receiptNotes.sender_number || receiptNotes.receiver_number}</span></p>}
                          {receiptNotes.timestamp_receipt && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)' }}>Receipt time: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800 }}>{receiptNotes.timestamp_receipt}</span></p>}
                          {proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer" style={{ width: 'fit-content', marginTop: '0.2rem', fontSize: '0.74rem', color: '#a78bfa', fontWeight: 800 }}>Open receipt image</a>}
                        </div>
                      )}
                      {tx.notes && !parsedNotes.isJson && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Note: {tx.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApprove(tx.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => handleReject(tx.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Deposit Review */}
          {activeTab === 'deposits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{mobileDeposits.length} pending mobile money deposits</p>
                <button onClick={fetchData} style={{ padding: '0.4rem 0.875rem', borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Refresh</button>
              </div>
              {mobileDeposits.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No pending mobile money deposits
                </div>
              ) : mobileDeposits.map((d) => {
                const isAfricell = d.payment_method === 'africell';
                const methodLabel = isAfricell ? 'Africell' : 'Orange Money';
                const methodColor = isAfricell ? { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' } : { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' };
                let notes = {};
                try { notes = JSON.parse(d.notes || '{}'); } catch {}
                return (
                  <div key={d.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 20, fontSize: '0.62rem', fontWeight: 800, background: methodColor.bg, border: `1px solid ${methodColor.border}`, color: methodColor.color, letterSpacing: '0.04em', width: 'fit-content' }}>{methodLabel}</span>
                      {[
                        ['User',       d.user?.username || `#${d.user_id}`, '#fff'],
                        ['Phone',      d.user?.phone, 'rgba(255,255,255,0.7)'],
                        ['Amount NSL', parseFloat(d.amount_NSL || 0).toLocaleString() + ' NSL', '#60a5fa'],
                      ].map(([label, value, color]) => value ? (
                        <p key={label} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                          {label}: <span style={{ fontWeight: 700, color }}>{value}</span>
                        </p>
                      ) : null)}
                      {d.reference_id && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>Ref: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{d.reference_id}</span></p>}
                      {notes.sender_number && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)' }}>From: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{notes.sender_number}</span></p>}
                      {d.payment_proof && <a href={backendAssetUrl(d.payment_proof)} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 700 }}>View Receipt</a>}
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={() => { setSelectedDeposit(d); setDepositReviewNSL(''); setDepositReviewNotes(''); setDepositReviewModal(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1.1rem', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <CheckCircle size={14} /> Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* KYC Review */}
          {activeTab === 'kyc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{kycSubmissions.length} pending KYC submissions</p>
                <button onClick={fetchData} style={{ padding: '0.4rem 0.875rem', borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Refresh</button>
              </div>
              {kycSubmissions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No pending KYC submissions
                </div>
              ) : kycSubmissions.map((u) => {
                const docs = [
                  { key: 'kyc_id_front', label: 'ID Front' },
                  { key: 'kyc_id_back',  label: 'ID Back' },
                  { key: 'kyc_selfie',   label: 'Selfie' },
                  { key: 'kyc_additional', label: 'Additional' },
                ].filter(d => u[d.key]);
                return (
                  <div key={u.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{u.username}</p>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{u.phone}{u.email ? ` · ${u.email}` : ''}</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>Submitted {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button onClick={() => handleKYCApprove(u.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={() => { setSelectedKYCUser(u); setKycRejectReason(''); setKycRejectModal(true); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                    {docs.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
                        {docs.map(d => (
                          <a key={d.key} href={backendAssetUrl(u[d.key])} target="_blank" rel="noreferrer"
                            style={{ display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
                            <img src={backendAssetUrl(u[d.key])} alt={d.label}
                              style={{ width: '100%', height: 90, objectFit: 'cover', background: 'rgba(255,255,255,0.05)', display: 'block' }} />
                            <div style={{ padding: '0.35rem 0.5rem', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <FileCheck size={11} style={{ color: '#14b8a6', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#14b8a6' }}>{d.label}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(167,139,250,0.12)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Phone', 'Username', 'NSL Balance', 'USDT Balance', 'Status', 'VIP', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.875rem 1rem', color: '#fff', whiteSpace: 'nowrap' }}>{u.phone}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#fff', fontWeight: 600 }}>{u.username}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#60a5fa', fontWeight: 700 }}>{u.balance_NSL?.toFixed(2)}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#10b981', fontWeight: 700 }}>{u.balance_usdt?.toFixed(2)}</td>
                        <td style={{ padding: '0.875rem 1rem' }}><Badge label={u.status} status={u.status} /></td>
                        <td style={{ padding: '0.875rem 1rem', color: 'rgba(255,255,255,0.6)' }}>{u.vip_level}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button onClick={() => { setSelectedUser(u); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: 8, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <Wallet size={11} /> Add
                            </button>
                            {u.status === 'active' ? (
                              <button onClick={() => handleSuspend(u.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: 8, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <UserX size={11} /> Suspend
                              </button>
                            ) : u.status === 'frozen' ? (
                              <button onClick={() => handleActivate(u.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <UserCheck size={11} /> Activate
                              </button>
                            ) : (
                              <button onClick={() => handleApproveUser(u.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <UserCheck size={11} /> Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              {/* Currently Earning */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.75rem' }}>
                  Currently Earning <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>— active VIP subscriptions</span>
                </h2>
                {paymentLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>Loading…</div>
                ) : paymentStatus.earning.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No active VIP subscriptions</div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(167,139,250,0.12)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['User', 'KYC', 'Plan', 'Price (NSL)', 'Purchased', 'Expires', 'Days Left', 'Total Earned (NSL)'].map(h => (
                              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paymentStatus.earning.map(row => (
                            <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                <p style={{ color: '#fff', fontWeight: 600 }}>{row.user?.username || '—'}</p>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{row.user?.phone}</p>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 8, background: row.user?.kyc_verified ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)', color: row.user?.kyc_verified ? '#10b981' : '#f87171' }}>
                                  {row.user?.kyc_verified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: '#a78bfa', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.product?.name}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#60a5fa', fontWeight: 700 }}>{row.product?.price_NSL?.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(row.purchase_date).toLocaleDateString()}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#f59e0b', fontWeight: 800, textAlign: 'center' }}>{row.days_remaining}d</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 800 }}>{row.total_earned_NSL?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Ready to Pay / Matured */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem' }}>
                  Ready to Pay <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>— subscriptions matured, payout due</span>
                </h2>
                {paymentLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>Loading…</div>
                ) : paymentStatus.matured.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No matured subscriptions</div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(248,113,113,0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['User', 'KYC', 'Plan', 'Price (NSL)', 'Purchased', 'Expired', 'Total Earned (NSL)'].map(h => (
                              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paymentStatus.matured.map(row => (
                            <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                <p style={{ color: '#fff', fontWeight: 600 }}>{row.user?.username || '—'}</p>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{row.user?.phone}</p>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 8, background: row.user?.kyc_verified ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)', color: row.user?.kyc_verified ? '#10b981' : '#f87171' }}>
                                  {row.user?.kyc_verified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: '#a78bfa', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.product?.name}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#60a5fa', fontWeight: 700 }}>{row.product?.price_NSL?.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(row.purchase_date).toLocaleDateString()}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#f59e0b', fontWeight: 800 }}>{row.total_earned_NSL?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* VIP Payments History Ledger */}
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
                Payment History <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>— all VIP purchases</span>
              </h2>
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search phone / username…"
                    value={ledgerSearch}
                    onChange={e => setLedgerSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchLedger(1)}
                    style={{ paddingLeft: '2.1rem', ...inputStyle, width: 220 }}
                  />
                </div>
                <input
                  type="month"
                  value={ledgerMonth}
                  onChange={e => { setLedgerMonth(e.target.value); fetchLedger(1, e.target.value, ledgerSearch); }}
                  style={{ ...inputStyle, width: 160 }}
                />
                <button
                  onClick={() => fetchLedger(1)}
                  style={{ padding: '0.65rem 1.1rem', borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Search
                </button>
                {(ledgerMonth || ledgerSearch) && (
                  <button
                    onClick={() => { setLedgerMonth(''); setLedgerSearch(''); fetchLedger(1, '', ''); }}
                    style={{ padding: '0.65rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{ledgerTotal} records</span>
              </div>

              {/* Table */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(167,139,250,0.12)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['User', 'VIP Plan', 'Price (NSL)', 'Price (USDT)', 'Purchase Date', 'Expiry', 'Status', 'Reviews Done', 'Total Earned (NSL)'].map(h => (
                          <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No VIP purchase records found</td></tr>
                      ) : ledger.map((row) => {
                        const isActive = row.is_active && new Date(row.expires_at) > new Date();
                        return (
                          <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                              <p style={{ color: '#fff', fontWeight: 600 }}>{row.user?.username || '—'}</p>
                              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{row.user?.phone}</p>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', color: '#a78bfa', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.product?.name}</td>
                            <td style={{ padding: '0.875rem 1rem', color: '#60a5fa', fontWeight: 700 }}>{row.product?.price_NSL?.toFixed(2)}</td>
                            <td style={{ padding: '0.875rem 1rem', color: '#10b981', fontWeight: 700 }}>{row.product?.price_usdt?.toFixed(2)}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{new Date(row.purchase_date).toLocaleDateString()}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <Badge label={isActive ? 'active' : 'expired'} status={isActive ? 'active' : 'rejected'} />
                            </td>
                            <td style={{ padding: '0.875rem 1rem', color: '#fff', fontWeight: 700, textAlign: 'center' }}>{row.review_count}</td>
                            <td style={{ padding: '0.875rem 1rem', color: '#f59e0b', fontWeight: 800 }}>{row.total_earned_NSL?.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {ledgerPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button
                    onClick={() => { const p = ledgerPage - 1; setLedgerPage(p); fetchLedger(p); }}
                    disabled={ledgerPage <= 1}
                    style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0.875rem', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: ledgerPage <= 1 ? 'rgba(255,255,255,0.2)' : '#fff', cursor: ledgerPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Page {ledgerPage} of {ledgerPages}</span>
                  <button
                    onClick={() => { const p = ledgerPage + 1; setLedgerPage(p); fetchLedger(p); }}
                    disabled={ledgerPage >= ledgerPages}
                    style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0.875rem', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: ledgerPage >= ledgerPages ? 'rgba(255,255,255,0.2)' : '#fff', cursor: ledgerPage >= ledgerPages ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Cash-Out Eligibility */}
            <div style={{ marginTop: '1.75rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.25rem' }}>
                Cash-Out Eligibility
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>
                Thresholds: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{cashoutData.thresholds?.min_nsl} NSL</strong> earned &bull; <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{cashoutData.thresholds?.min_referrals}</strong> qualifying referrals &bull; KYC verified
              </p>
              {cashoutLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>Loading…</div>
              ) : cashoutData.users?.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>No users found</div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(52,211,153,0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          {['User', 'Total Earned (NSL)', 'Qual. Referrals', 'KYC', 'Eligible'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cashoutData.users?.map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: u.conditions.all_ok ? 'rgba(52,211,153,0.06)' : 'transparent' }}>
                            <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                              <p style={{ color: '#fff', fontWeight: 600 }}>{u.username || '—'}</p>
                              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>{u.phone}</p>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: u.conditions.earned_ok ? '#10b981' : '#f87171', fontWeight: 800 }}>{u.total_earned_NSL?.toFixed(2)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: u.conditions.referrals_ok ? '#10b981' : '#f87171', fontWeight: 800 }}>{u.qualifying_referrals}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 8, background: u.kyc_verified ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)', color: u.kyc_verified ? '#10b981' : '#f87171' }}>
                                {u.kyc_verified ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              {u.conditions.all_ok
                                ? <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: 8, background: 'rgba(52,211,153,0.2)', color: '#34d399' }}>Eligible</span>
                                : <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>Not yet</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Activity Log */}
          {activeTab === 'activity' && user.role === 'superadmin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {activityLog.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  No activity recorded
                </div>
              ) : activityLog.map((act) => (
                <div key={act.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Badge label={act.type} status={act.type} />
                    <Badge label={act.status} status={act.status} />
                  </div>
                  {[
                    ['Finance User', act.approver?.phone || act.approver?.username || 'N/A', '#a78bfa'],
                    ['Target User',  act.user?.phone || act.user?.username || 'N/A', '#fff'],
                    ['Amount NSL',   act.amount_NSL, '#60a5fa'],
                    ['Amount USDT',  act.amount_usdt, '#10b981'],
                  ].map(([label, value, color]) => (
                    <p key={label} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                      {label}: <span style={{ fontWeight: 700, color }}>{value}</span>
                    </p>
                  ))}
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{new Date(act.completed_at).toLocaleString()}</p>
                  {act.notes && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.4rem 0.625rem' }}>Note: {act.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
