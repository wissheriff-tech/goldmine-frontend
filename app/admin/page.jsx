'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import { Users, DollarSign, Trash2, Edit, Plus, Shield, X, Key, Search, CheckCircle, XCircle, Package, FileCheck, MessageCircle, Send } from 'lucide-react';

const TABS = ['Pending', 'All Users', 'Deposits', 'Withdrawals', 'Products', 'KYC', 'Chat'];

export default function AdminPanel() {
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState('Pending');
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [products, setProducts] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [selectedKYCUser, setSelectedKYCUser] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycRejectReason, setKycRejectReason] = useState('');
  const [withdrawalAction, setWithdrawalAction] = useState({ reason: '' });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [editForm, setEditForm] = useState({ vip_level: 'none', role: 'user' });
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);

  // Chat state
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReply, setChatReply] = useState('');
  const [chatFilter, setChatFilter] = useState('open');
  const [chatLoading, setChatLoading] = useState(false);
  const chatPollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const router = useRouter();

  const [createForm, setCreateForm] = useState({ username: '', phone: '', password: '', role: 'user', status: 'active' });
  const [balanceForm, setBalanceForm] = useState({ balance_NSL: 0, balance_usdt: 0, reason: '' });
  const [passwordForm, setPasswordForm] = useState({ new_password: '', confirm_password: '' });
  const [depositAction, setDepositAction] = useState({ approved_amount: '', notes: '', reason: '' });

  const NSL_RATE = parseInt(process.env.NEXT_PUBLIC_NSL_TO_USDT || 23);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'superadmin') { toast.error('Access denied'); router.push('/dashboard'); return; }
    fetchAll();
  }, [user, router]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [usersRes, depositsRes, productsRes, withdrawalsRes, kycRes, chatsRes] = await Promise.all([
        api.get('/admin/users?limit=200'),
        api.get('/deposit/pending'),
        api.get('/products'),
        api.get('/finance/transactions?type=withdrawal&status=pending&limit=100'),
        api.get('/admin/kyc/pending'),
        api.get('/chat/all?limit=50'),
      ]);
      setUsers(usersRes.data.users || []);
      setDeposits(depositsRes.data.data || []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []));
      setWithdrawals(withdrawalsRes.data.transactions || []);
      setKycSubmissions(kycRes.data.data || []);
      setChats(chatsRes.data.chats || []);
    } catch { toast.error('Failed to load data'); }
    finally { setIsLoading(false); }
  };

  // ── User actions ──────────────────────────────────────────────
  const approveUser = async (id) => {
    await api.patch(`/admin/users/${id}/status`, { status: 'active' });
    toast.success('User approved'); fetchAll();
  };

  const rejectUser = async (id) => {
    await api.patch(`/admin/users/${id}/status`, { status: 'frozen' });
    toast.success('User rejected'); fetchAll();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await api.patch(`/admin/users/${id}/status`, { status: newStatus });
    toast.success('Status updated'); fetchAll();
  };

  const handleUpdateVIP = async (id, vip_level) => {
    await api.patch(`/admin/users/${id}/vip`, { vip_level });
    toast.success('VIP updated'); fetchAll(); setShowEditModal(false);
  };

  const handleUpdateRole = async (id, role) => {
    await api.patch(`/admin/users/${id}/role`, { role });
    toast.success('Role updated'); fetchAll(); setShowEditModal(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', createForm);
      toast.success('User created'); setShowCreateModal(false);
      setCreateForm({ username: '', phone: '', password: '', role: 'user', status: 'active' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${selectedUser.id}/balance`, balanceForm);
      toast.success('Balance updated'); setShowBalanceModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) return toast.error('Passwords do not match');
    try {
      await api.patch(`/admin/users/${selectedUser.id}/reset-password`, { new_password: passwordForm.new_password });
      toast.success('Password reset'); setShowPasswordModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteUser = async (id, username) => {
    if (!confirm(`Delete user ${username}?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted'); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Deposit actions ───────────────────────────────────────────
  const approveDeposit = async () => {
    try {
      await api.patch(`/deposit/${selectedDeposit.id}/approve`, {
        approved_amount: depositAction.approved_amount || selectedDeposit.user_submitted_amount,
        notes: depositAction.notes,
      });
      toast.success('Deposit approved & balance credited'); setShowDepositModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectDeposit = async () => {
    if (!depositAction.reason) return toast.error('Rejection reason required');
    try {
      await api.patch(`/deposit/${selectedDeposit.id}/reject`, { reason: depositAction.reason });
      toast.success('Deposit rejected'); setShowDepositModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Withdrawal actions ────────────────────────────────────────
  const approveWithdrawal = async (id) => {
    try {
      await api.patch(`/finance/transactions/${id}/approve`, { reason: 'Approved by admin' });
      toast.success('Withdrawal approved'); fetchAll();
      setShowWithdrawalModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectWithdrawal = async (id) => {
    if (!withdrawalAction.reason) return toast.error('Rejection reason required');
    try {
      await api.patch(`/finance/transactions/${id}/reject`, { reason: withdrawalAction.reason });
      toast.success('Withdrawal rejected'); fetchAll();
      setShowWithdrawalModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── KYC actions ──────────────────────────────────────────────
  const approveKYC = async (userId) => {
    try {
      await api.patch(`/admin/kyc/${userId}/approve`);
      toast.success('KYC approved'); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectKYC = async () => {
    if (!kycRejectReason) return toast.error('Rejection reason required');
    try {
      await api.patch(`/admin/kyc/${selectedKYCUser.id}/reject`, { reason: kycRejectReason });
      toast.success('KYC rejected'); setShowKYCModal(false); setKycRejectReason(''); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Chat actions ─────────────────────────────────────────────
  const fetchChats = useCallback(async (status = chatFilter) => {
    try {
      const { data } = await api.get(`/chat/all?limit=50&status=${status}`);
      setChats(data.chats || []);
    } catch {}
  }, [chatFilter]);

  const openChat = useCallback(async (chat) => {
    setActiveChat(chat);
    setChatLoading(true);
    try {
      const { data } = await api.get(`/chat/${chat.id}`);
      setChatMessages(data.messages || []);
      // Auto-assign if unassigned
      if (!chat.admin_id) {
        await api.post(`/chat/${chat.id}/assign`);
        await fetchChats();
      }
    } catch {}
    finally { setChatLoading(false); }
  }, [fetchChats]);

  // Poll active chat messages every 3s
  useEffect(() => {
    if (activeChat) {
      chatPollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/chat/${activeChat.id}`);
          setChatMessages(data.messages || []);
        } catch {}
      }, 3000);
      return () => clearInterval(chatPollRef.current);
    }
  }, [activeChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatReply = async (e) => {
    e.preventDefault();
    if (!chatReply.trim() || !activeChat) return;
    const text = chatReply.trim();
    setChatReply('');
    try {
      await api.post(`/chat/${activeChat.id}/messages`, { message: text });
      const { data } = await api.get(`/chat/${activeChat.id}`);
      setChatMessages(data.messages || []);
    } catch { toast.error('Failed to send message'); }
  };

  const closeChatSession = async (chatId) => {
    try {
      await api.post(`/chat/${chatId}/close`);
      toast.success('Chat closed');
      if (activeChat?.id === chatId) { setActiveChat(null); setChatMessages([]); }
      fetchChats();
    } catch { toast.error('Failed to close chat'); }
  };

  // ── Seed products ─────────────────────────────────────────────
  const seedProducts = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post('/admin/seed-products');
      toast.success(`Products seeded: ${data.created} created, ${data.updated} updated`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Seed failed'); }
    finally { setSeeding(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const pendingUsers = users.filter(u => u.status === 'pending');
  const filteredUsers = searchQuery
    ? users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery))
    : users;

  const statusBadge = (s) => ({
    active: 'bg-green-100 text-green-800',
    pending: 'bg-orange-100 text-orange-800',
    frozen: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-800');

  if (isLoading) return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" /> Super Admin Panel
          </h1>
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">Dashboard</button>
            <button onClick={async () => { await logout(); router.push('/login'); }} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'text-blue-600' },
            { label: 'Pending Approval', value: pendingUsers.length, color: 'text-orange-600', alert: pendingUsers.length > 0 },
            { label: 'Pending Deposits', value: deposits.length, color: 'text-purple-600', alert: deposits.length > 0 },
            { label: 'Pending Withdrawals', value: withdrawals.length, color: 'text-red-600', alert: withdrawals.length > 0 },
            { label: 'Products', value: products.length, color: 'text-green-600', alert: products.length === 0 },
            { label: 'Pending KYC', value: kycSubmissions.length, color: 'text-teal-600', alert: kycSubmissions.length > 0 },
            { label: 'Open Chats', value: chats.filter(c => c.status === 'open').length, color: 'text-blue-500', alert: chats.filter(c => c.status === 'open').length > 0 },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl p-4 shadow-sm border ${s.alert ? 'border-orange-200' : 'border-gray-100'}`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
              {t === 'Pending' && pendingUsers.length > 0 && <span className="ml-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>}
              {t === 'Deposits' && deposits.length > 0 && <span className="ml-1.5 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{deposits.length}</span>}
              {t === 'Withdrawals' && withdrawals.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{withdrawals.length}</span>}
              {t === 'KYC' && kycSubmissions.length > 0 && <span className="ml-1.5 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">{kycSubmissions.length}</span>}
              {t === 'Chat' && chats.filter(c => c.status === 'open').length > 0 && <span className="ml-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{chats.filter(c => c.status === 'open').length}</span>}
            </button>
          ))}
        </div>

        {/* ── PENDING USERS TAB ── */}
        {tab === 'Pending' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Users Awaiting Approval ({pendingUsers.length})</h2>
              <p className="text-sm text-gray-500 mt-0.5">New signups waiting to be activated</p>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending users — all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingUsers.map(u => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{u.username}</p>
                      <p className="text-sm text-gray-500">{u.phone} {u.email && `· ${u.email}`}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Referral: {u.referred_by || 'none'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveUser(u.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => rejectUser(u.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL USERS TAB ── */}
        {tab === 'All Users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search username or phone…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <button onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg">
                <Plus className="w-4 h-4" /> New User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  {['Username','Phone','Role','Status','VIP','NSL','USDT','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                      <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{u.role}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(u.status)}`}>{u.status}</span></td>
                      <td className="px-4 py-3 text-gray-600">{u.vip_level}</td>
                      <td className="px-4 py-3 text-gray-900 font-mono">{parseFloat(u.balance_NSL||0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900 font-mono">{parseFloat(u.balance_usdt||0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedUser(u); setEditForm({ vip_level: u.vip_level || 'none', role: u.role || 'user' }); setShowEditModal(true); }} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setSelectedUser(u); setBalanceForm({ balance_NSL: u.balance_NSL, balance_usdt: u.balance_usdt, reason: '' }); setShowBalanceModal(true); }} title="Balance" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><DollarSign className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setSelectedUser(u); setPasswordForm({ new_password: '', confirm_password: '' }); setShowPasswordModal(true); }} title="Reset password" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"><Key className="w-3.5 h-3.5" /></button>
                          {u.status === 'pending' && <button onClick={() => approveUser(u.id)} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-3.5 h-3.5" /></button>}
                          {u.status !== 'superadmin' && u.role !== 'superadmin' && (
                            <button onClick={() => handleUpdateStatus(u.id, u.status === 'active' ? 'frozen' : 'active')} title={u.status === 'active' ? 'Freeze' : 'Activate'} className={`p-1.5 rounded ${u.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}><Shield className="w-3.5 h-3.5" /></button>
                          )}
                          {u.role !== 'superadmin' && <button onClick={() => handleDeleteUser(u.id, u.username)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DEPOSITS TAB ── */}
        {tab === 'Deposits' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Pending Deposit Proofs ({deposits.length})</h2>
              <p className="text-sm text-gray-500 mt-0.5">Review and approve user deposit receipts</p>
            </div>
            {deposits.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending deposits</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {deposits.map(d => (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{d.user?.username || `User #${d.user_id}`}</p>
                      <p className="text-sm text-gray-600">${parseFloat(d.user_submitted_amount).toFixed(2)} USDT · {d.user_submitted_currency}</p>
                      {d.user_submitted_txid && <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-xs">TxID: {d.user_submitted_txid}</p>}
                      <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','')}/${d.receipt_image}`} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        View Receipt
                      </a>
                      <button onClick={() => { setSelectedDeposit(d); setDepositAction({ approved_amount: d.user_submitted_amount, notes: '', reason: '' }); setShowDepositModal(true); }}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WITHDRAWALS TAB ── */}
        {tab === 'Withdrawals' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Pending Withdrawal Requests ({withdrawals.length})</h2>
              <p className="text-sm text-gray-500 mt-0.5">Approve to deduct balance and process; reject to cancel</p>
            </div>
            {withdrawals.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending withdrawals</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {withdrawals.map(w => {
                  const u = w.user || {};
                  return (
                    <div key={w.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">{u.username || `User #${w.user_id}`}</p>
                          <p className="text-sm text-gray-600">{parseFloat(w.amount_NSL || 0).toLocaleString()} NSL → ${parseFloat(w.amount_usdt || 0).toFixed(2)} USDT</p>
                          {w.withdrawal_address && <p className="text-xs font-mono text-gray-400 truncate max-w-xs">{w.withdrawal_address}</p>}
                          {w.withdrawal_network && <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{w.withdrawal_network}</span>}
                          <p className="text-xs text-gray-400">{new Date(w.createdAt || w.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => approveWithdrawal(w.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => { setSelectedWithdrawal(w); setWithdrawalAction({ reason: '' }); setShowWithdrawalModal(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'Products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Investment Plans</h2>
                <p className="text-sm text-gray-500">{products.length} plans in database</p>
              </div>
              {products.length === 0 && (
                <button onClick={seedProducts} disabled={seeding}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  <Package className="w-4 h-4" />
                  {seeding ? 'Seeding…' : 'Seed All VIP Plans'}
                </button>
              )}
            </div>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">No products yet</p>
                <p className="text-sm text-gray-400 mb-6">Click "Seed All VIP Plans" to populate VIP0–VIP9</p>
                <button onClick={seedProducts} disabled={seeding}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  {seeding ? 'Seeding…' : 'Seed All VIP Plans (VIP0–VIP9)'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-purple-700">{p.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-mono font-medium">{parseFloat(p.price_NSL).toLocaleString()} NSL</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Price (USDT)</span><span className="font-mono font-medium">${parseFloat(p.price_usdt).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Daily Income</span><span className="font-mono font-medium text-green-600">{parseFloat(p.daily_income_NSL).toLocaleString()} NSL</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{p.validity_days} days</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">ROI</span><span>{Math.ceil(p.price_NSL / p.daily_income_NSL)} days</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ── KYC TAB ── */}
        {tab === 'KYC' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Pending KYC Submissions ({kycSubmissions.length})</h2>
              <p className="text-sm text-gray-500 mt-0.5">Review identity documents submitted by users</p>
            </div>
            {kycSubmissions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FileCheck className="w-10 h-10 mx-auto mb-2 text-teal-300" />
                <p>No pending KYC submissions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {kycSubmissions.map(u => {
                  const docs = [
                    { key: 'kyc_id_front', label: 'ID Front' },
                    { key: 'kyc_id_back', label: 'ID Back' },
                    { key: 'kyc_selfie', label: 'Selfie' },
                    { key: 'kyc_additional', label: 'Additional' },
                  ].filter(d => u[d.key]);
                  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
                  return (
                    <div key={u.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <p className="font-semibold text-gray-900">{u.username}</p>
                          <p className="text-sm text-gray-500">{u.phone}{u.email && ` · ${u.email}`}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {docs.map(d => (
                              <a key={d.key} href={`${base}${u[d.key]}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium rounded-lg border border-teal-200 transition-colors">
                                <FileCheck className="w-3 h-3" /> {d.label}
                              </a>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => approveKYC(u.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => { setSelectedKYCUser(u); setKycRejectReason(''); setShowKYCModal(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === 'Chat' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 580 }}>
            <div className="flex h-full">

              {/* Left: chat list */}
              <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 text-sm mb-2">Support Chats</h2>
                  <div className="flex gap-1">
                    {['open','assigned','closed'].map(s => (
                      <button key={s} onClick={() => { setChatFilter(s); fetchChats(s); }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${chatFilter === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {chats.filter(c => c.status === chatFilter).length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-10">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No {chatFilter} chats
                    </div>
                  ) : (
                    chats.filter(c => c.status === chatFilter).map(c => (
                      <button key={c.id} onClick={() => openChat(c)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeChat?.id === c.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-gray-900 text-sm truncate">{c.user?.username || `User #${c.user_id}`}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.priority === 'high' ? 'bg-red-100 text-red-700' : c.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{c.admin ? `→ ${c.admin.username}` : 'Unassigned'}</span>
                          <span className="text-xs text-gray-400">{new Date(c.last_message_at || c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right: conversation */}
              <div className="flex-1 flex flex-col">
                {!activeChat ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Select a chat to view</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{activeChat.user?.username}</p>
                        <p className="text-xs text-gray-500">{activeChat.subject} · {activeChat.status}</p>
                      </div>
                      {activeChat.status !== 'closed' && (
                        <button onClick={() => closeChatSession(activeChat.id)}
                          className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium">
                          Close chat
                        </button>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatLoading ? (
                        <div className="text-center text-gray-400 text-sm pt-8">Loading...</div>
                      ) : chatMessages.map(msg => {
                        const isAdmin = ['admin','superadmin'].includes(msg.sender?.role);
                        return (
                          <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                              {!isAdmin && <p className="text-xs font-semibold text-blue-600 mb-0.5">{msg.sender?.username}</p>}
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply input */}
                    {activeChat.status !== 'closed' && (
                      <form onSubmit={sendChatReply} className="px-4 py-3 border-t border-gray-100 flex gap-2">
                        <input
                          value={chatReply}
                          onChange={e => setChatReply(e.target.value)}
                          placeholder="Type a reply..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        />
                        <button type="submit" disabled={!chatReply.trim()}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ── CREATE USER MODAL ── */}
      {showCreateModal && (
        <Modal title="Create New User" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {[['Username','text','username'],['Phone','tel','phone'],['Password','password','password']].map(([label, type, field]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type={type} value={createForm[field]} onChange={e => setCreateForm({...createForm, [field]: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" required />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {['user','admin','finance','verificator','approval'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg">Create User</button>
          </form>
        </Modal>
      )}

      {/* ── EDIT USER MODAL ── */}
      {showEditModal && selectedUser && (
        <Modal title={`Edit: ${selectedUser.username}`} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">VIP Level</label>
              <select value={editForm.vip_level} onChange={e => setEditForm(f => ({...f, vip_level: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {['none','VIP0','VIP1','VIP2','VIP3','VIP4','VIP5','VIP6','VIP7','VIP8','VIP9'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={editForm.role} onChange={e => setEditForm(f => ({...f, role: e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {['user','admin','finance','verificator','approval','superadmin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={async () => {
              if (editForm.vip_level !== selectedUser.vip_level) await handleUpdateVIP(selectedUser.id, editForm.vip_level);
              if (editForm.role !== selectedUser.role) await handleUpdateRole(selectedUser.id, editForm.role);
              if (editForm.vip_level === selectedUser.vip_level && editForm.role === selectedUser.role) toast('No changes to save');
            }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* ── BALANCE MODAL ── */}
      {showBalanceModal && selectedUser && (
        <Modal title={`Balance: ${selectedUser.username}`} onClose={() => setShowBalanceModal(false)}>
          <form onSubmit={handleAdjustBalance} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              1 USDT = {NSL_RATE} NSL
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NSL Balance</label>
              <input type="number" step="0.01" value={balanceForm.balance_NSL}
                onChange={e => { const nsl = parseFloat(e.target.value)||0; setBalanceForm({...balanceForm, balance_NSL: nsl, balance_usdt: parseFloat((nsl/NSL_RATE).toFixed(4))}); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">USDT Balance</label>
              <input type="number" step="0.0001" value={balanceForm.balance_usdt}
                onChange={e => { const usdt = parseFloat(e.target.value)||0; setBalanceForm({...balanceForm, balance_usdt: usdt, balance_NSL: parseFloat((usdt*NSL_RATE).toFixed(4))}); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea value={balanceForm.reason} onChange={e => setBalanceForm({...balanceForm, reason: e.target.value})}
                rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none" required />
            </div>
            <button type="submit" className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg">Update Balance</button>
          </form>
        </Modal>
      )}

      {/* ── PASSWORD RESET MODAL ── */}
      {showPasswordModal && selectedUser && (
        <Modal title={`Reset Password: ${selectedUser.username}`} onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {[['New Password','new_password'],['Confirm Password','confirm_password']].map(([label, field]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="password" value={passwordForm[field]} onChange={e => setPasswordForm({...passwordForm, [field]: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" required minLength={6} />
              </div>
            ))}
            {passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}
            <button type="submit" disabled={passwordForm.new_password !== passwordForm.confirm_password}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg">Reset Password</button>
          </form>
        </Modal>
      )}

      {/* ── DEPOSIT REVIEW MODAL ── */}
      {showDepositModal && selectedDeposit && (
        <Modal title="Review Deposit" onClose={() => setShowDepositModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-medium">{selectedDeposit.user?.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="font-mono font-medium">${parseFloat(selectedDeposit.user_submitted_amount).toFixed(2)} USDT</span></div>
              {selectedDeposit.user_submitted_txid && <div className="flex justify-between"><span className="text-gray-500">TxID</span><span className="font-mono text-xs truncate max-w-[180px]">{selectedDeposit.user_submitted_txid}</span></div>}
              {selectedDeposit.user_notes && <div className="flex justify-between"><span className="text-gray-500">Notes</span><span>{selectedDeposit.user_notes}</span></div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Approve Amount (USDT)</label>
              <input type="number" step="0.01" value={depositAction.approved_amount}
                onChange={e => setDepositAction({...depositAction, approved_amount: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              <p className="text-xs text-gray-400 mt-1">= {((depositAction.approved_amount || 0) * NSL_RATE * 0.9).toFixed(0)} NSL credited (after 10% fee)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Notes (optional)</label>
              <input type="text" value={depositAction.notes} onChange={e => setDepositAction({...depositAction, notes: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
            </div>
            <button onClick={approveDeposit} className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve & Credit Balance
            </button>
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1 text-red-600">Reject Reason</label>
              <input type="text" value={depositAction.reason} onChange={e => setDepositAction({...depositAction, reason: e.target.value})}
                placeholder="Required for rejection" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-2" />
              <button onClick={rejectDeposit} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── KYC REJECT MODAL ── */}
      {showKYCModal && selectedKYCUser && (
        <Modal title={`Reject KYC: ${selectedKYCUser.username}`} onClose={() => setShowKYCModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-medium">{selectedKYCUser.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedKYCUser.phone}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-red-600">Rejection Reason</label>
              <textarea rows={3} value={kycRejectReason} onChange={e => setKycRejectReason(e.target.value)}
                placeholder="e.g. Documents are blurry, ID appears expired, selfie doesn't match ID…"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
            </div>
            <button onClick={rejectKYC}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Confirm Rejection
            </button>
          </div>
        </Modal>
      )}

      {/* ── WITHDRAWAL REJECT MODAL ── */}
      {showWithdrawalModal && selectedWithdrawal && (
        <Modal title="Reject Withdrawal" onClose={() => setShowWithdrawalModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-medium">{selectedWithdrawal.user?.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-mono">{parseFloat(selectedWithdrawal.amount_NSL||0).toLocaleString()} NSL</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-mono text-xs truncate max-w-[180px]">{selectedWithdrawal.withdrawal_address}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-red-600">Rejection Reason</label>
              <textarea rows={3} value={withdrawalAction.reason}
                onChange={e => setWithdrawalAction({ reason: e.target.value })}
                placeholder="Explain why this withdrawal is rejected..."
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
            </div>
            <button onClick={() => rejectWithdrawal(selectedWithdrawal.id)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Confirm Rejection
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
