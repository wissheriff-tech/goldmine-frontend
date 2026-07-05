'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import api, { backendAssetUrl } from '@/utils/api';
import { API_ROUTES, APP_ROUTES } from '@/utils/navigation';
import { Users, DollarSign, Trash2, Edit, Plus, Shield, ShieldCheck, X, Key, Search, CheckCircle, XCircle, Package, FileCheck, MessageSquare, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Clock, RefreshCw, MoreHorizontal } from 'lucide-react';

const esc = (str) => String(str ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
);

const TABS = ['Pending', 'All Users', 'Roles', 'Deposits', 'Withdrawals', 'Products', 'KYC', 'Analytics', 'Profit', 'Payments', 'Settings', 'Testimonials', 'Activity Log', 'Audit Log'];

const ASSIGNABLE_ROLES = [
  { value: 'admin',       label: 'Admin',             color: 'blue' },
  { value: 'finance',     label: 'Finance Admin',     color: 'green' },
  { value: 'ambassador',  label: 'Ambassador',        color: 'purple' },
  { value: 'verificator', label: 'Verificator',       color: 'orange' },
  { value: 'approval',    label: 'Approval',          color: 'teal' },
];

const ROLE_BADGE_COLORS = {
  admin:       'bg-blue-100 text-blue-800',
  finance:     'bg-green-100 text-green-800',
  ambassador:  'bg-purple-100 text-purple-800',
  verificator: 'bg-orange-100 text-orange-800',
  approval:    'bg-teal-100 text-teal-800',
  superadmin:  'bg-red-100 text-red-800',
  user:        'bg-gray-100 text-gray-600',
};

const TESTIMONIAL_COUNTRIES = [
  { country: 'Sierra Leone', flag: '🇸🇱', currency_code: 'NSL', currency_symbol: 'NSL' },
  { country: 'Liberia', flag: '🇱🇷', currency_code: 'LRD', currency_symbol: 'L$' },
  { country: 'Togo', flag: '🇹🇬', currency_code: 'XOF', currency_symbol: 'CFA' },
  { country: 'Ghana', flag: '🇬🇭', currency_code: 'GHS', currency_symbol: 'GH₵' },
  { country: 'Guinea', flag: '🇬🇳', currency_code: 'GNF', currency_symbol: 'FG' },
  { country: 'Nigeria', flag: '🇳🇬', currency_code: 'NGN', currency_symbol: '₦' },
  { country: 'Senegal', flag: '🇸🇳', currency_code: 'XOF', currency_symbol: 'CFA' },
];

const DEFAULT_TESTIMONIAL_COUNTRY = TESTIMONIAL_COUNTRIES[0];
const TESTIMONIAL_COUNTRY_BY_NAME = new Map(TESTIMONIAL_COUNTRIES.map(country => [country.country, country]));

const getTestimonialCountry = (country) => TESTIMONIAL_COUNTRY_BY_NAME.get(country) || DEFAULT_TESTIMONIAL_COUNTRY;
const createTestimonialForm = (country = DEFAULT_TESTIMONIAL_COUNTRY.country) => {
  const meta = getTestimonialCountry(country);
  return { name: '', country: meta.country, flag: meta.flag, phone: '', type: 'withdrawal', amount_nsl: '' };
};

const formatTestimonialAmount = (entry) => {
  if (entry.amount_display) return entry.amount_display;
  const meta = getTestimonialCountry(entry.country);
  const amount = parseFloat(entry.amount_nsl || 0).toLocaleString();
  if (meta.currency_symbol === meta.currency_code) return `${amount} ${meta.currency_code}`;
  const prefix = ['L$', '₦'].includes(meta.currency_symbol) ? meta.currency_symbol : `${meta.currency_symbol} `;
  return `${prefix}${amount} ${meta.currency_code}`;
};

export default function AdminPanel() {
  const { user, logout, isInitializing } = useAuthStore();
  const [tab, setTab] = useState('Pending');
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [mobileDeposits, setMobileDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [products, setProducts] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [selectedKYCUser, setSelectedKYCUser] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycRejectReason, setKycRejectReason] = useState('');
  const [withdrawalAction, setWithdrawalAction] = useState({ reason: '', notes: '' });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalMethodFilter, setWithdrawalMethodFilter] = useState('All');
  const [depositMethodFilter, setDepositMethodFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneForm, setPhoneForm] = useState({ phone: '' });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ title: '', message: '', priority: 'high' });
  const [messageSaving, setMessageSaving] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [editForm, setEditForm] = useState({ vip_level: 'none', role: 'user', ambassador_region: '', ambassador_sector: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepositIds, setSelectedDepositIds] = useState(new Set());
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState(new Set());
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', target: 'all' });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showAddVIPModal, setShowAddVIPModal] = useState(false);
  const [showEditVIPModal, setShowEditVIPModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [vipForm, setVipForm] = useState({ name: '', price_NSL: '', daily_income_NSL: '', tax_income_NSL: '', validity_days: '7', description: '' });
  const [vipSaving, setVipSaving] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Cron trigger state
  const [cronRunning, setCronRunning] = useState('');
  const [cronResult, setCronResult] = useState(null);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({ orange_money_number: '', africell_number: '', binance_wallet_address: '', binance_network: 'TRC20 (USDT)' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Agent codes state
  const [agentCodes, setAgentCodes] = useState({ orange_money: [], africell: [] });
  const [agentCodesLoading, setAgentCodesLoading] = useState(false);
  const [newAgentCode, setNewAgentCode] = useState({ orange_money: { code: '', label: '' }, africell: { code: '', label: '' } });
  const [agentCodeAdding, setAgentCodeAdding] = useState('');

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState({
    referral_l1_pct: 3, referral_l2_pct: 2, referral_l3_pct: 1,
    recharge_fee_pct: 5, withdrawal_fee_pct: 10,
    exchange_rate_nsl_per_usdt: 23.99,
    dur_short: 3, dur_week: 7, dur_month: 30, dur_promo: 14, dur_promo_label: 'Promo',
    daily_checkin_reward_NSL: 5, explore_vip_reward_NSL: 10,
    first_deposit_bonus_NSL: 100, vip_tax_daily_count: 3,
    show_checkin_reward: '1',
    whatsapp_group_link: '', telegram_group_link: '', whatsapp_support_number: '',
  });
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, openUp: false });
  const [platformSaving, setPlatformSaving] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [testimonialCountryFilter, setTestimonialCountryFilter] = useState(DEFAULT_TESTIMONIAL_COUNTRY.country);
  const [testimonialForm, setTestimonialForm] = useState(() => createTestimonialForm());
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [activityFeedVisible, setActivityFeedVisible] = useState(true);
  const [activityFeedToggling, setActivityFeedToggling] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('');

  // Activity log state (per-user dropdown view)
  const [activityUsers, setActivityUsers] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityExpanded, setActivityExpanded] = useState({});
  const [activityUserLogs, setActivityUserLogs] = useState({});
  const [activityUserLoading, setActivityUserLoading] = useState({});

  // Profit & payouts state
  const [profit, setProfit] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const PAYOUTS_PAGE_SIZE = 20;

  // Payment status state
  const [paymentStatus,  setPaymentStatus]  = useState({ earning: [], matured: [] });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Cashout eligibility state
  const [cashoutData,    setCashoutData]    = useState({ users: [], thresholds: { min_nsl: 150, min_referrals: 5 } });
  const [cashoutLoading, setCashoutLoading] = useState(false);

  // Role management state
  const [roleSearch, setRoleSearch] = useState('');
  const [roleAssignTarget, setRoleAssignTarget] = useState(null);
  const [roleAssignForm, setRoleAssignForm] = useState({ role: 'admin', ambassador_region: '', ambassador_sector: '' });
  const [roleAssigning, setRoleAssigning] = useState(false);

  // User list sub-tab state
  const [userSubTab, setUserSubTab] = useState('users');
  const [userPage, setUserPage] = useState(1);

  const router = useRouter();

  const [createForm, setCreateForm] = useState({ username: '', phone: '', password: '', role: 'user', status: 'active', ambassador_region: '', ambassador_sector: '' });
  const [balanceForm, setBalanceForm] = useState({ action: 'add', currency: 'NSL', amount: '', reason: '' });
  const [passwordForm, setPasswordForm] = useState({ new_password: '', confirm_password: '' });
  const [myPasswordForm, setMyPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [myPasswordSaving, setMyPasswordSaving] = useState(false);
  const [myUsernameForm, setMyUsernameForm] = useState({ username: '' });
  const [myUsernameSaving, setMyUsernameSaving] = useState(false);
  const [myPhoneForm, setMyPhoneForm] = useState({ phone: '' });
  const [myPhoneSaving, setMyPhoneSaving] = useState(false);
  const [myEmailForm, setMyEmailForm] = useState({ email: '' });
  const [myEmailSaving, setMyEmailSaving] = useState(false);
  const [depositAction, setDepositAction] = useState({ approved_amount: '', notes: '', reason: '', admin_reference: '' });

  const NSL_RATE = parseFloat(platformSettings.exchange_rate_nsl_per_usdt || 23.99);
  const RECHARGE_FEE_PCT = parseFloat(platformSettings.recharge_fee_pct || 5);

  const allDeposits = useMemo(() => {
    const crypto = deposits.map(d => ({ ...d, _type: 'crypto' }));
    const mobile = mobileDeposits.map(d => {
      const _notes = (() => { try { return JSON.parse(d.notes || '{}'); } catch { return {}; } })();
      return { ...d, _type: 'mobile', _notes };
    });
    return [...crypto, ...mobile].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }, [deposits, mobileDeposits]);

  const filteredDeposits = useMemo(() => {
    if (depositMethodFilter === 'All') return allDeposits;
    return allDeposits.filter(d => {
      if (depositMethodFilter === 'Crypto') return d._type === 'crypto';
      if (depositMethodFilter === 'Orange Money') return d.payment_method === 'orange_money';
      if (depositMethodFilter === 'Africell') return d.payment_method === 'africell';
      return true;
    });
  }, [allDeposits, depositMethodFilter]);

  const filteredWithdrawals = useMemo(() => {
    if (withdrawalMethodFilter === 'All') return withdrawals;
    return withdrawals.filter(w => {
      if (withdrawalMethodFilter === 'Crypto') return !w.payment_method || (w.payment_method !== 'orange_money' && w.payment_method !== 'africell');
      if (withdrawalMethodFilter === 'Orange Money') return w.payment_method === 'orange_money';
      if (withdrawalMethodFilter === 'Africell') return w.payment_method === 'africell';
      return true;
    });
  }, [withdrawals, withdrawalMethodFilter]);
  const selectedTestimonialCountry = getTestimonialCountry(testimonialForm.country);
  const testimonialCountryCounts = useMemo(() => {
    return testimonials.reduce((counts, entry) => {
      counts[entry.country] = (counts[entry.country] || 0) + 1;
      return counts;
    }, {});
  }, [testimonials]);
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(entry => entry.country === testimonialCountryFilter);
  }, [testimonials, testimonialCountryFilter]);

  useEffect(() => { setTestimonialPage(1); }, [testimonialCountryFilter]);
  useEffect(() => { setUserPage(1); }, [userSubTab, searchQuery]);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push(APP_ROUTES.login); return; }
    if (user.role !== 'superadmin') { toast.error('Access denied'); router.push(APP_ROUTES.dashboard); return; }
    fetchAll();
  }, [user, isInitializing, router]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [usersRes, depositsRes, mobileDepositsRes, productsRes, withdrawalsRes, kycRes, approvedWRes] = await Promise.all([
        api.get('/admin/users?limit=200'),
        api.get('/deposit/pending'),
        api.get('/admin/mobile-deposits/pending'),
        api.get('/admin/products'),
        api.get('/finance/transactions?type=withdrawal&status=pending&limit=100'),
        api.get('/admin/kyc/pending'),
        api.get('/finance/transactions?type=withdrawal&status=approved&limit=100'),
      ]);
      setUsers(usersRes.data.users || []);
      setDeposits(depositsRes.data.data || []);
      setMobileDeposits(mobileDepositsRes.data.data || []);
      setProducts(productsRes.data.products || []);
      setWithdrawals(withdrawalsRes.data.transactions || []);
      setKycSubmissions(kycRes.data.data || []);
      setApprovedWithdrawals(approvedWRes.data.transactions || []);
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
    await api.patch(`/admin/users/${id}/role`, {
      role,
      ambassador_region: editForm.ambassador_region,
      ambassador_sector: editForm.ambassador_sector,
    });
    toast.success('Role updated'); fetchAll(); setShowEditModal(false);
  };

  const handleAssignRole = async () => {
    if (!roleAssignTarget) return;
    setRoleAssigning(true);
    try {
      await api.patch(`/admin/users/${roleAssignTarget.id}/role`, {
        role: roleAssignForm.role,
        ambassador_region: roleAssignForm.role === 'ambassador' ? roleAssignForm.ambassador_region : null,
        ambassador_sector: roleAssignForm.role === 'ambassador' ? roleAssignForm.ambassador_sector : null,
      });
      toast.success(`${roleAssignTarget.username} is now ${roleAssignForm.role}`);
      setRoleAssignTarget(null);
      setRoleAssignForm({ role: 'admin', ambassador_region: '', ambassador_sector: '' });
      setRoleSearch('');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign role'); }
    finally { setRoleAssigning(false); }
  };

  const handleRemoveRole = async (u) => {
    if (!confirm(`Remove ${u.username}'s ${u.role} role? They will become a regular user.`)) return;
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: 'user', ambassador_region: null, ambassador_sector: null });
      toast.success(`${u.username} is now a regular user`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', createForm);
      toast.success('User created'); setShowCreateModal(false);
      setCreateForm({ username: '', phone: '', password: '', role: 'user', status: 'active', ambassador_region: '', ambassador_sector: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${selectedUser.id}/balance`, balanceForm);
      toast.success(balanceForm.action === 'add' ? 'Money added' : 'Money deducted');
      setShowBalanceModal(false);
      setBalanceForm({ action: 'add', currency: 'NSL', amount: '', reason: '' });
      fetchAll();
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

  const handleChangePhone = async (e) => {
    e.preventDefault();
    if (!phoneForm.phone.trim()) return toast.error('Phone number required');
    try {
      await api.patch(`/admin/users/${selectedUser.id}/phone`, { phone: phoneForm.phone.trim() });
      toast.success('Phone number updated'); setShowPhoneModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageForm.title.trim()) return toast.error('Message title required');
    if (!messageForm.message.trim()) return toast.error('Message body required');

    setMessageSaving(true);
    try {
      await api.post(API_ROUTES.notifications.adminMessage, {
        user_id: selectedUser.id,
        title: messageForm.title.trim(),
        message: messageForm.message.trim(),
        priority: messageForm.priority,
      });
      toast.success('Special message sent');
      setShowMessageModal(false);
      setMessageForm({ title: '', message: '', priority: 'high' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setMessageSaving(false);
    }
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
      if (selectedDeposit._type === 'mobile') {
        await api.patch(`/admin/transaction/${selectedDeposit.id}/approve`, {
          approved_NSL: depositAction.approved_amount || selectedDeposit.amount_NSL,
          notes: depositAction.notes,
          verified_reference: depositAction.admin_reference || null,
        });
      } else {
        await api.patch(`/deposit/${selectedDeposit.id}/approve`, {
          approved_amount: depositAction.approved_amount || selectedDeposit.user_submitted_amount,
          notes: depositAction.notes,
        });
      }
      toast.success('Deposit approved & balance credited');
      setShowDepositModal(false);
      setDepositAction({ approved_amount: '', notes: '', reason: '', admin_reference: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectDeposit = async () => {
    if (!depositAction.reason) return toast.error('Rejection reason required');
    try {
      if (selectedDeposit._type === 'mobile') {
        await api.patch(`/admin/transaction/${selectedDeposit.id}/reject`, { reason: depositAction.reason });
      } else {
        await api.patch(`/deposit/${selectedDeposit.id}/reject`, { reason: depositAction.reason });
      }
      toast.success('Deposit rejected');
      setShowDepositModal(false);
      setDepositAction({ approved_amount: '', notes: '', reason: '', admin_reference: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Withdrawal actions ────────────────────────────────────────
  const approveWithdrawal = async (id) => {
    try {
      await api.patch(`/finance/transactions/${id}/approve`, { notes: withdrawalAction.notes || 'Approved by admin' });
      toast.success('Withdrawal approved'); fetchAll();
      setShowWithdrawalModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectWithdrawal = async (id) => {
    if (!withdrawalAction.reason) return toast.error('Rejection reason required');
    try {
      await api.patch(`/finance/transactions/${id}/reject`, { reason: withdrawalAction.reason });
      toast.success('Withdrawal rejected — balance refunded'); fetchAll();
      setShowWithdrawalModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Bulk approve ─────────────────────────────────────────────
  const bulkApprove = async (ids) => {
    if (ids.size === 0) return toast.error('Select at least one transaction');
    setBulkApproving(true);
    try {
      const { data } = await api.post('/admin/transactions/bulk-approve', { ids: Array.from(ids) });
      toast.success(`Approved ${data.approved.length}${data.skipped.length ? `, skipped ${data.skipped.length}` : ''}`);
      setSelectedDepositIds(new Set());
      setSelectedWithdrawalIds(new Set());
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk approve failed'); }
    finally { setBulkApproving(false); }
  };

  const markAsPaid = async (id) => {
    setMarkingPaid(id);
    try {
      await api.patch(`/admin/transaction/${id}/mark-paid`);
      toast.success('Withdrawal marked as paid');
      setApprovedWithdrawals(prev => prev.filter(w => w.id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to mark as paid'); }
    finally { setMarkingPaid(null); }
  };

  const sendBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error('Title and message are required'); return;
    }
    setBroadcastSending(true);
    try {
      const { data } = await api.post('/admin/broadcast-notification', broadcastForm);
      toast.success(`Sent to ${data.sent} users`);
      setBroadcastForm({ title: '', message: '', target: 'all' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send broadcast'); }
    finally { setBroadcastSending(false); }
  };

  // ── KYC actions ──────────────────────────────────────────────
  const approveKYC = async (userId) => {
    try {
      await api.patch(`/admin/kyc/${userId}/approve`, {});
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

  const toggleKYC = async (u) => {
    try {
      if (u.kyc_verified) {
        await api.patch(`/admin/kyc/${u.id}/reject`, { reason: 'Revoked by admin' });
        toast.success(`KYC revoked for ${u.username}`);
      } else {
        await api.patch(`/admin/kyc/${u.id}/approve`, {});
        toast.success(`KYC approved for ${u.username}`);
      }
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ── Cron trigger ─────────────────────────────────────────────
  const triggerCron = async (job) => {
    setCronRunning(job);
    setCronResult(null);
    try {
      const { data } = await api.post('/cron/trigger', { job });
      setCronResult({ job, ok: true, result: data.result });
      toast.success(`${job} completed`);
    } catch (err) {
      setCronResult({ job, ok: false, message: err.response?.data?.message || 'Failed' });
      toast.error(`${job} failed`);
    } finally {
      setCronRunning('');
    }
  };

  // ── Analytics ────────────────────────────────────────────────
  useEffect(() => {
    if (tab === 'Analytics' && !analytics) {
      setAnalyticsLoading(true);
      api.get('/analytics/admin/dashboard')
        .then(({ data }) => setAnalytics(data))
        .catch(() => toast.error('Failed to load analytics'))
        .finally(() => setAnalyticsLoading(false));
    }
    if (tab === 'Settings') {
      api.get('/admin/payment-settings')
        .then(({ data }) => setPaymentSettings(s => ({ ...s, ...data.data })))
        .catch(() => {});
      api.get('/admin/platform-settings')
        .then(({ data }) => setPlatformSettings(s => ({ ...s, ...data.settings })))
        .catch(() => {});
      setAgentCodesLoading(true);
      api.get('/admin/agent-codes')
        .then(({ data }) => setAgentCodes(data.data))
        .catch(() => {})
        .finally(() => setAgentCodesLoading(false));
    }
    if (tab === 'Testimonials') {
      setTestimonialsLoading(true);
      api.get('/testimonials/all')
        .then(({ data }) => setTestimonials(data.testimonials || []))
        .catch(() => toast.error('Failed to load testimonials'))
        .finally(() => setTestimonialsLoading(false));
      api.get('/testimonials/settings')
        .then(({ data }) => setActivityFeedVisible(data.activity_feed_visible !== false))
        .catch(() => {});
    }
    if (tab === 'Audit Log') {
      setAuditPage(1);
      setAuditLoading(true);
      api.get('/admin/audit-logs', { params: { page: 1, limit: 50 } })
        .then(({ data }) => { setAuditLogs(data.data || []); setAuditTotal(data.total || 0); })
        .catch(() => toast.error('Failed to load audit logs'))
        .finally(() => setAuditLoading(false));
    }
    if (tab === 'Activity Log') {
      setActivityPage(1);
      setActivitySearch('');
      setActivityExpanded({});
      setActivityUserLogs({});
      setActivityLoading(true);
      api.get('/admin/activity-log', { params: { page: 1, limit: 30 } })
        .then(({ data }) => { setActivityUsers(data.data || []); setActivityTotal(data.total || 0); })
        .catch(() => toast.error('Failed to load activity log'))
        .finally(() => setActivityLoading(false));
    }
    if (tab === 'Profit') {
      setProfitLoading(true);
      api.get('/admin/net-profit')
        .then(({ data }) => setProfit(data))
        .catch(() => toast.error('Failed to load profit data'))
        .finally(() => setProfitLoading(false));
      fetchPayouts(1);
    }
    if (tab === 'Payments') {
      setPaymentLoading(true);
      setCashoutLoading(true);
      api.get('/admin/payment-status')
        .then(({ data }) => setPaymentStatus(data))
        .catch(() => toast.error('Failed to load payment status'))
        .finally(() => setPaymentLoading(false));
      api.get('/admin/cashout-eligibility')
        .then(({ data }) => setCashoutData(data))
        .catch(() => {})
        .finally(() => setCashoutLoading(false));
      api.get('/admin/platform-settings')
        .then(({ data }) => setPlatformSettings(s => ({ ...s, ...data.settings })))
        .catch(() => {});
    }
  }, [tab, analytics]);

  const fetchPayouts = async (page) => {
    setPayoutsLoading(true);
    try {
      const skip = (page - 1) * PAYOUTS_PAGE_SIZE;
      const { data } = await api.get(`/admin/payouts?limit=${PAYOUTS_PAGE_SIZE}&skip=${skip}`);
      setPayouts(data.payouts || []);
      setPayoutsTotal(data.total || 0);
      setPayoutsPage(page);
    } catch { toast.error('Failed to load payouts'); }
    finally { setPayoutsLoading(false); }
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

  const openAddVIP = () => {
    const nums = products.map(p => { const m = p.name.match(/\d+/); return m ? parseInt(m[0]) : -1; }).filter(n => n >= 0);
    const nextNum = nums.length ? Math.max(...nums) + 1 : 0;
    const last = products.reduce((a, b) => (parseFloat(a.price_NSL) > parseFloat(b.price_NSL) ? a : b), products[0] || {});
    const lastPrice = parseFloat(last?.price_NSL || 0);
    const lastDailyPct = lastPrice > 0 ? (parseFloat(last.daily_income_NSL) / lastPrice * 100) : 3;
    const nextDailyPct = Math.min(12, lastDailyPct + 0.5);
    const suggestedPrice = lastPrice > 0 ? Math.round(lastPrice * 2.5 / 100000) * 100000 : 500;
    const suggestedIncome = Math.round(suggestedPrice * nextDailyPct / 100);
    setVipForm({
      name: `VIP${nextNum}`,
      price_NSL: String(suggestedPrice),
      daily_income_NSL: String(suggestedIncome),
      validity_days: '7',
      description: `VIP${nextNum} premium investment plan with enhanced daily returns.`,
    });
    setShowAddVIPModal(true);
  };

  const openEditVIP = (p) => {
    setEditingProduct(p);
    setVipForm({
      name: p.name,
      price_NSL: String(parseFloat(p.price_NSL)),
      daily_income_NSL: String(parseFloat(p.daily_income_NSL)),
      tax_income_NSL: String(parseFloat(p.tax_income_NSL) || 0),
      validity_days: String(p.validity_days || 7),
      description: p.description || '',
      active: p.active !== false,
    });
    setShowEditVIPModal(true);
  };

  const saveNewVIP = async () => {
    setVipSaving(true);
    try {
      const priceNSL = parseFloat(vipForm.price_NSL);
      const dailyIncome = parseFloat(vipForm.daily_income_NSL);
      await api.post('/admin/products', {
        name: vipForm.name,
        price_NSL: priceNSL,
        daily_income_NSL: dailyIncome,
        tax_income_NSL: parseFloat(vipForm.tax_income_NSL) || 0,
        validity_days: parseInt(vipForm.validity_days) || 7,
        description: vipForm.description,
      });
      toast.success(`${vipForm.name} created`);
      setShowAddVIPModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create VIP'); }
    finally { setVipSaving(false); }
  };

  const saveEditVIP = async () => {
    setVipSaving(true);
    try {
      const priceNSL = parseFloat(vipForm.price_NSL);
      const dailyIncome = parseFloat(vipForm.daily_income_NSL);
      await api.patch(`/admin/products/${editingProduct.id}`, {
        price_NSL: priceNSL,
        daily_income_NSL: dailyIncome,
        tax_income_NSL: parseFloat(vipForm.tax_income_NSL) || 0,
        validity_days: parseInt(vipForm.validity_days) || 7,
        description: vipForm.description,
        active: vipForm.active,
      });
      toast.success(`${editingProduct.name} updated`);
      setShowEditVIPModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update VIP'); }
    finally { setVipSaving(false); }
  };

  const toggleVIP = async (p) => {
    try {
      const { data } = await api.patch(`/admin/products/${p.id}/toggle`, {});
      toast.success(data.message);
      setProducts(prev => prev.map(x => x.id === p.id ? data.product : x));
    } catch (err) { toast.error(err.response?.data?.message || 'Toggle failed'); }
  };

  const deleteVIP = async (p) => {
    if (!confirm(`Deactivate ${p.name}? Users with this plan keep their current period but cannot repurchase.`)) return;
    try {
      const { data } = await api.delete(`/admin/products/${p.id}`);
      toast.success(data.message);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: false } : x));
    } catch (err) { toast.error(err.response?.data?.message || 'Deactivate failed'); }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const pendingUsers = users.filter(u => u.status === 'pending');
  const superadminUser = useMemo(() => users.find(u => u.role === 'superadmin'), [users]);
  const filteredUsers = useMemo(() => {
    let list = userSubTab === 'finance' ? users.filter(u => u.role === 'finance') : users.filter(u => u.role === 'user');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => u.username?.toLowerCase().includes(q) || u.phone?.includes(searchQuery) || u.referral_code?.toLowerCase().includes(q));
    }
    return list;
  }, [users, userSubTab, searchQuery]);

  const statusBadge = (s) => ({
    active: 'bg-green-100 text-green-800',
    pending: 'bg-orange-100 text-orange-800',
    frozen: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-800');

  if (isLoading) return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;

  return (
    <div className="ocean-light-surfaces min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-base md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="hidden sm:inline">Super Admin Panel</span>
            <span className="sm:hidden">Admin</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard')} className="text-xs md:text-sm text-gray-600 hover:text-gray-900 px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100">Dashboard</button>
            <button onClick={async () => { await logout(); router.push('/login'); }} className="text-xs md:text-sm text-gray-600 hover:text-gray-900 px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'text-blue-600' },
            { label: 'Pending Approval', value: pendingUsers.length, color: 'text-orange-600', alert: pendingUsers.length > 0 },
            { label: 'Pending Deposits', value: deposits.length + mobileDeposits.length, color: 'text-purple-600', alert: deposits.length + mobileDeposits.length > 0 },
            { label: 'Pending Withdrawals', value: withdrawals.length, color: 'text-red-600', alert: withdrawals.length > 0 },
            { label: 'Products', value: products.length, color: 'text-green-600', alert: products.length === 0 },
            { label: 'Pending KYC', value: kycSubmissions.length, color: 'text-teal-600', alert: kycSubmissions.length > 0 },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl p-4 shadow-sm border ${s.alert ? 'border-orange-200' : 'border-gray-100'}`}>
              <p className="text-xs text-gray-900 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-hide mb-6">
          <div className="flex gap-1 bg-gray-200 p-1 rounded-xl w-max min-w-full">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
              {t === 'Pending' && pendingUsers.length > 0 && <span className="ml-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>}
              {t === 'Deposits' && (deposits.length + mobileDeposits.length) > 0 && <span className="ml-1.5 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{deposits.length + mobileDeposits.length}</span>}
              {t === 'Withdrawals' && withdrawals.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{withdrawals.length}</span>}
              {t === 'KYC' && kycSubmissions.length > 0 && <span className="ml-1.5 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">{kycSubmissions.length}</span>}
            </button>
          ))}
          </div>
        </div>

        {/* ── PENDING USERS TAB ── */}
        {tab === 'Pending' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Users Awaiting Approval ({pendingUsers.length})</h2>
              <p className="text-sm text-gray-900 mt-0.5">New signups waiting to be activated</p>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-900">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending users — all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingUsers.map(u => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{u.username}</p>
                      <p className="text-sm text-gray-900">{u.phone} {u.email && `· ${u.email}`}</p>
                      <p className="text-xs text-gray-900 mt-0.5">Referral: {u.referred_by || 'none'}</p>
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
          <div className="space-y-4">
            {/* Sub-tab selector */}
            <div className="flex items-center gap-2">
              {[
                { key: 'superadmin', label: 'Superadmin', count: users.filter(u => u.role === 'superadmin').length },
                { key: 'finance', label: 'Finance', count: users.filter(u => u.role === 'finance').length },
                { key: 'users', label: 'Users', count: users.filter(u => u.role === 'user').length },
              ].map(({ key, label, count }) => (
                <button key={key} onClick={() => setUserSubTab(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${userSubTab === key ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
                  {label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${userSubTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900'}`}>{count}</span>
                </button>
              ))}
              <button onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg ml-auto">
                <Plus className="w-4 h-4" /> New User
              </button>
            </div>

            {/* Superadmin sub-tab — info card */}
            {userSubTab === 'superadmin' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" /> Superadmin Account
                </h3>
                {superadminUser ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['Username', superadminUser.username],
                        ['Phone', superadminUser.phone || '—'],
                        ['Status', superadminUser.status],
                        ['VIP Level', superadminUser.vip_level || 'none'],
                        ['NSL Balance', `${parseFloat(superadminUser.balance_NSL || 0).toFixed(2)} NSL`],
                        ['USDT Balance', `${parseFloat(superadminUser.balance_usdt || 0).toFixed(2)} USDT`],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-900 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setSelectedUser(superadminUser); setPasswordForm({ new_password: '', confirm_password: '' }); setShowPasswordModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium">
                        <Key className="w-3.5 h-3.5" /> Reset Password
                      </button>
                      <button onClick={() => { setSelectedUser(superadminUser); setPhoneForm({ phone: superadminUser.phone || '' }); setShowPhoneModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium">
                        <span className="text-xs font-bold">#</span> Edit Phone
                      </button>
                      <button onClick={() => { setSelectedUser(superadminUser); setBalanceForm({ action: 'add', currency: 'NSL', amount: '', reason: '' }); setShowBalanceModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium">
                        <DollarSign className="w-3.5 h-3.5" /> Adjust Balance
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 text-sm">No superadmin account found.</p>
                )}
              </div>
            )}

            {/* Finance / Users sub-tabs — searchable paginated table */}
            {(userSubTab === 'finance' || userSubTab === 'users') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900" />
                    <input type="text" placeholder="Search username or phone…" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <span className="text-sm text-gray-900">
                    {filteredUsers.length} {userSubTab === 'finance' ? 'finance' : 'general'} user{filteredUsers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 5));
                  const safePage = Math.min(userPage, totalPages);
                  const pageUsers = filteredUsers.slice((safePage - 1) * 5, safePage * 5);
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 text-xs text-gray-900 uppercase tracking-wide">
                            {['Username','Phone','Status','VIP','NSL','USDT','Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-gray-50">
                            {pageUsers.map(u => (
                              <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                                <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(u.status)}`}>{u.status}</span></td>
                                <td className="px-4 py-3 text-gray-600">{u.vip_level}</td>
                                <td className="px-4 py-3 text-gray-900 font-mono">{parseFloat(u.balance_NSL||0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-900 font-mono">{parseFloat(u.balance_usdt||0).toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        if (openActionMenu === u.id) { setOpenActionMenu(null); return; }
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const openUp = rect.bottom + 320 > window.innerHeight;
                                        setMenuPos({ top: openUp ? rect.top : rect.bottom + 4, right: window.innerWidth - rect.right, openUp });
                                        setOpenActionMenu(u.id);
                                      }}
                                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    {openActionMenu === u.id && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenu(null)} />
                                        <div
                                          className="fixed z-50 bg-white shadow-lg border border-gray-100 rounded-xl py-1 w-48 text-sm"
                                          style={{ top: menuPos.openUp ? 'auto' : menuPos.top, bottom: menuPos.openUp ? window.innerHeight - menuPos.top : 'auto', right: menuPos.right }}
                                        >
                                          <button onClick={() => { setOpenActionMenu(null); setSelectedUser(u); setEditForm({ vip_level: u.vip_level || 'none', role: u.role || 'user', ambassador_region: u.ambassador_region || '', ambassador_sector: u.ambassador_sector || '' }); setShowEditModal(true); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"><Edit className="w-3.5 h-3.5 text-blue-500" /> Edit user</button>
                                          <button onClick={() => { setOpenActionMenu(null); setSelectedUser(u); setBalanceForm({ action: 'add', currency: 'NSL', amount: '', reason: '' }); setShowBalanceModal(true); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"><DollarSign className="w-3.5 h-3.5 text-green-500" /> Adjust balance</button>
                                          <button onClick={() => { setOpenActionMenu(null); setSelectedUser(u); setPasswordForm({ new_password: '', confirm_password: '' }); setShowPasswordModal(true); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"><Key className="w-3.5 h-3.5 text-purple-500" /> Reset password</button>
                                          <button onClick={() => { setOpenActionMenu(null); setSelectedUser(u); setPhoneForm({ phone: u.phone || '' }); setShowPhoneModal(true); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"><span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-bold text-blue-500">#</span> Change phone</button>
                                          <button onClick={() => { setOpenActionMenu(null); setSelectedUser(u); setMessageForm({ title: '', message: '', priority: 'high' }); setShowMessageModal(true); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"><MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Send message</button>
                                          <button onClick={() => { setOpenActionMenu(null); toggleKYC(u); }} className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${u.kyc_verified ? 'text-teal-700' : 'text-gray-700'}`}>{u.kyc_verified ? <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> : <Shield className="w-3.5 h-3.5 text-gray-400" />} {u.kyc_verified ? 'Revoke KYC' : 'Approve KYC'}</button>
                                          <button onClick={() => { setOpenActionMenu(null); handleUpdateStatus(u.id, u.status === 'active' ? 'frozen' : 'active'); }} className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${u.status === 'active' ? 'text-orange-600' : 'text-green-600'}`}><Shield className="w-3.5 h-3.5" /> {u.status === 'active' ? 'Freeze account' : 'Activate account'}</button>
                                          {u.status === 'pending' && <button onClick={() => { setOpenActionMenu(null); approveUser(u.id); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-green-700"><CheckCircle className="w-3.5 h-3.5" /> Approve user</button>}
                                          <div className="border-t border-gray-100 my-1" />
                                          <button onClick={() => { setOpenActionMenu(null); handleDeleteUser(u.id, u.username); }} className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-red-600"><Trash2 className="w-3.5 h-3.5" /> Delete user</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredUsers.length === 0 && (
                        <div className="py-10 text-center text-gray-900 text-sm">No {userSubTab === 'finance' ? 'finance' : 'general'} users found</div>
                      )}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                          <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            ← Prev
                          </button>
                          <span className="text-xs text-gray-900">Page {safePage} of {totalPages}</span>
                          <button onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── DEPOSITS TAB ── */}
        {tab === 'Deposits' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-semibold text-gray-900">Pending Deposit Requests ({filteredDeposits.length}{depositMethodFilter !== 'All' ? ` of ${allDeposits.length}` : ''})</h2>
                  <p className="text-sm text-gray-900 mt-0.5">Verify receipt and approve to credit user balance, or reject with a reason.</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDepositIds.size > 0 && (
                    <button onClick={() => bulkApprove(selectedDepositIds)} disabled={bulkApproving}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                      {bulkApproving ? 'Approving…' : `Approve ${selectedDepositIds.size} selected`}
                    </button>
                  )}
                  <button onClick={fetchAll} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {[
                  { key: 'All', count: allDeposits.length },
                  { key: 'Crypto', count: deposits.length },
                  { key: 'Orange Money', count: mobileDeposits.filter(d => d.payment_method === 'orange_money').length },
                  { key: 'Africell', count: mobileDeposits.filter(d => d.payment_method === 'africell').length },
                ].map(({ key, count }) => (
                  <button key={key} onClick={() => setDepositMethodFilter(key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      depositMethodFilter === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {key} ({count})
                  </button>
                ))}
              </div>
            </div>
            {filteredDeposits.length === 0 ? (
              <div className="py-12 text-center text-gray-900">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending deposits{depositMethodFilter !== 'All' ? ` for ${depositMethodFilter}` : ''}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredDeposits.map(d => {
                  const isCrypto = d._type === 'crypto';
                  const isAfricell = d.payment_method === 'africell';
                  const methodLabel = isCrypto ? 'Crypto (USDT)' : isAfricell ? 'Africell' : 'Orange Money';
                  const methodBadge = isCrypto ? 'bg-purple-100 text-purple-700' : isAfricell ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';
                  const u = d.user || {};
                  const feeMultiplier = 1 - RECHARGE_FEE_PCT / 100;
                  return (
                    <div key={`${d._type}-${d.id}`} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                      <input type="checkbox" className="mt-1 shrink-0 w-4 h-4 accent-indigo-600"
                        checked={selectedDepositIds.has(d.id)}
                        onChange={e => setSelectedDepositIds(prev => { const s = new Set(prev); e.target.checked ? s.add(d.id) : s.delete(d.id); return s; })} />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${methodBadge}`}>{methodLabel}</span>
                          <p className="font-semibold text-gray-900">{u.username || `User #${d.user_id}`}</p>
                          {u.phone && <span className="text-xs text-gray-900">{u.phone}</span>}
                        </div>
                        {isCrypto ? (
                          <>
                            <p className="text-sm font-mono text-gray-700">${parseFloat(d.user_submitted_amount || 0).toFixed(2)} USDT → {((parseFloat(d.user_submitted_amount || 0)) * NSL_RATE * feeMultiplier).toFixed(0)} NSL after {RECHARGE_FEE_PCT}% fee</p>
                            {d.user_submitted_txid && <p className="text-xs font-mono text-gray-900 truncate max-w-xs">TxID: {d.user_submitted_txid}</p>}
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-mono text-gray-700">{parseFloat(d.amount_NSL || 0).toLocaleString()} NSL → {(parseFloat(d.amount_NSL || 0) * feeMultiplier).toFixed(0)} NSL after {RECHARGE_FEE_PCT}% fee</p>
                            {d.reference_id && <p className="text-xs font-mono text-gray-900">Ref: {d.reference_id}</p>}
                            {d._notes?.sender_number && <p className="text-xs text-gray-900">From: {d._notes.sender_number}</p>}
                          </>
                        )}
                        <p className="text-xs text-gray-900">{new Date(d.created_at || d.createdAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => {
                        setSelectedDeposit(d);
                        setDepositAction({
                          approved_amount: isCrypto ? d.user_submitted_amount : (d._notes?.amount_SLE || d.amount_NSL),
                          notes: '', reason: '', admin_reference: ''
                        });
                        setShowDepositModal(true);
                      }} className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg">
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── WITHDRAWALS TAB ── */}
        {tab === 'Withdrawals' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-semibold text-gray-900">Pending Withdrawal Requests ({filteredWithdrawals.length}{withdrawalMethodFilter !== 'All' ? ` of ${withdrawals.length}` : ''})</h2>
                  <p className="text-sm text-gray-900 mt-0.5">Balance is already deducted at submission — approve to process payout, reject to refund the user.</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedWithdrawalIds.size > 0 && (
                    <button onClick={() => bulkApprove(selectedWithdrawalIds)} disabled={bulkApproving}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                      {bulkApproving ? 'Approving…' : `Approve ${selectedWithdrawalIds.size} selected`}
                    </button>
                  )}
                  <button onClick={fetchAll} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {[
                  { key: 'All', count: withdrawals.length },
                  { key: 'Crypto', count: withdrawals.filter(w => !w.payment_method || (w.payment_method !== 'orange_money' && w.payment_method !== 'africell')).length },
                  { key: 'Orange Money', count: withdrawals.filter(w => w.payment_method === 'orange_money').length },
                  { key: 'Africell', count: withdrawals.filter(w => w.payment_method === 'africell').length },
                ].map(({ key, count }) => (
                  <button key={key} onClick={() => setWithdrawalMethodFilter(key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      withdrawalMethodFilter === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {key} ({count})
                  </button>
                ))}
              </div>
            </div>
            {approvedWithdrawals.length > 0 && (
              <div className="mb-4 border border-green-200 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Approved — Awaiting Payment ({approvedWithdrawals.length})</p>
                    <p className="text-xs text-green-600">Mark each as paid once you&apos;ve sent the payout</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {approvedWithdrawals.map(w => {
                    const u = w.user || {};
                    const isCrypto = !w.payment_method || (w.payment_method !== 'orange_money' && w.payment_method !== 'africell');
                    return (
                      <div key={w.id} className="px-5 py-3 flex items-center justify-between gap-4 bg-white hover:bg-green-50/30">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{u.username || `User #${w.user_id}`} {u.phone && <span className="text-xs text-gray-500 ml-1">{u.phone}</span>}</p>
                          <p className="text-sm font-mono text-gray-700">{parseFloat(w.amount_NSL || 0).toLocaleString()} NSL → ${parseFloat(w.amount_usdt || 0).toFixed(2)} USDT</p>
                          {isCrypto && w.withdrawal_address && <p className="text-xs font-mono text-gray-500 truncate max-w-xs">{w.withdrawal_address} {w.withdrawal_network && <span className="ml-1 text-purple-600">{w.withdrawal_network}</span>}</p>}
                          {!isCrypto && <p className="text-xs text-gray-500">Phone: {w.withdrawal_address}</p>}
                        </div>
                        <button onClick={() => markAsPaid(w.id)} disabled={markingPaid === w.id}
                          className="shrink-0 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                          {markingPaid === w.id ? 'Marking…' : 'Mark Paid'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {filteredWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-gray-900">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                <p>No pending withdrawals{withdrawalMethodFilter !== 'All' ? ` for ${withdrawalMethodFilter}` : ''}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredWithdrawals.map(w => {
                  const u = w.user || {};
                  const isCrypto = !w.payment_method || (w.payment_method !== 'orange_money' && w.payment_method !== 'africell');
                  const isAfricell = w.payment_method === 'africell';
                  const methodLabel = isCrypto ? 'Crypto (USDT)' : isAfricell ? 'Africell' : 'Orange Money';
                  const methodBadge = isCrypto ? 'bg-purple-100 text-purple-700' : isAfricell ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';
                  return (
                    <div key={w.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <input type="checkbox" className="mt-1 shrink-0 w-4 h-4 accent-indigo-600"
                          checked={selectedWithdrawalIds.has(w.id)}
                          onChange={e => setSelectedWithdrawalIds(prev => { const s = new Set(prev); e.target.checked ? s.add(w.id) : s.delete(w.id); return s; })} />
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${methodBadge}`}>{methodLabel}</span>
                            <p className="font-semibold text-gray-900">{u.username || `User #${w.user_id}`}</p>
                            {u.phone && <span className="text-xs text-gray-900">{u.phone}</span>}
                          </div>
                          <p className="text-sm font-mono text-gray-700">{parseFloat(w.amount_NSL || 0).toLocaleString()} NSL → ${parseFloat(w.amount_usdt || 0).toFixed(2)} USDT</p>
                          {isCrypto ? (
                            <div className="space-y-0.5">
                              {w.withdrawal_address && <p className="text-xs font-mono text-gray-900 truncate max-w-xs">{w.withdrawal_address}</p>}
                              {w.withdrawal_network && <span className="inline-block text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded">{w.withdrawal_network}</span>}
                            </div>
                          ) : (
                            <p className="text-sm"><span className="text-gray-900 text-xs">Phone: </span><span className="font-mono text-gray-700">{w.withdrawal_address}</span></p>
                          )}
                          {w.reference_id && <p className="text-xs text-gray-900">Ref: {w.reference_id}</p>}
                          <p className="text-xs text-gray-900">{new Date(w.createdAt || w.timestamp).toLocaleString()}</p>
                        </div>
                        <button onClick={() => { setSelectedWithdrawal(w); setWithdrawalAction({ reason: '', notes: '' }); setShowWithdrawalModal(true); }}
                          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg">
                          Review
                        </button>
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
                <p className="text-sm text-gray-900">{products.length} plans in database</p>
              </div>
              <div className="flex gap-2">
                {products.length === 0 && (
                  <button onClick={seedProducts} disabled={seeding}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm">
                    <Package className="w-4 h-4" />
                    {seeding ? 'Seeding…' : 'Seed VIP0–VIP9'}
                  </button>
                )}
                <button onClick={openAddVIP}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors text-sm">
                  <Plus className="w-4 h-4" /> New VIP
                </button>
              </div>
            </div>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-900" />
                <p className="text-gray-900 font-medium">No products yet</p>
                <p className="text-sm text-gray-900 mb-6">Click &quot;Seed All VIP Plans&quot; to populate VIP0–VIP9</p>
                <button onClick={seedProducts} disabled={seeding}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  {seeding ? 'Seeding…' : 'Seed All VIP Plans (VIP0–VIP9)'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-opacity ${p.active ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                    <div className={`px-5 py-3 flex items-center justify-between ${p.active ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-400'}`}>
                      <span className="font-bold text-lg text-white">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleVIP(p)}
                          title={p.active ? 'Deactivate plan' : 'Activate plan'}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${p.active ? 'bg-green-400/20 text-green-100 border-green-400/40 hover:bg-red-400/30 hover:text-red-100 hover:border-red-400/40' : 'bg-gray-400/30 text-gray-100 border-gray-300/40 hover:bg-green-400/30 hover:text-green-100 hover:border-green-400/40'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => openEditVIP(p)} title="Edit plan" className="text-white/70 hover:text-white transition-colors p-1"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteVIP(p)} title="Deactivate plan" className="text-white/50 hover:text-red-300 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="p-5 space-y-2.5 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Price</span>
                        <span className="font-bold text-gray-900 font-mono">{parseFloat(p.price_NSL).toLocaleString()} NSL</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Price (USDT)</span>
                        <span className="font-bold text-gray-900 font-mono">${parseFloat(p.price_usdt).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 font-medium">Duration</span>
                        <span className="font-bold text-gray-900">{p.validity_days} days</span>
                      </div>
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
              <p className="text-sm text-gray-900 mt-0.5">Review identity documents submitted by users</p>
            </div>
            {kycSubmissions.length === 0 ? (
              <div className="py-12 text-center text-gray-900">
                <FileCheck className="w-10 h-10 mx-auto mb-2 text-teal-300" />
                <p>No pending KYC submissions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {kycSubmissions.map(u => {
                  const docs = [
                    { key: 'kyc_id_front', label: 'Document' },
                    { key: 'kyc_id_back', label: 'ID Back' },
                    { key: 'kyc_selfie', label: 'Selfie' },
                    { key: 'kyc_additional', label: 'Additional' },
                  ].filter(d => u[d.key]);
                  const docUrl = (raw) => backendAssetUrl(raw);
                  return (
                    <div key={u.id} className="px-6 py-5 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{u.username}</p>
                          <p className="text-sm text-gray-900">{u.phone}{u.email && ` · ${u.email}`}</p>
                          <p className="text-xs text-gray-900 mt-0.5">Submitted {new Date(u.created_at).toLocaleDateString()}</p>
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
                      {/* Inline document thumbnails */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {docs.map(d => (
                          <a key={d.key} href={docUrl(u[d.key])} target="_blank" rel="noopener noreferrer"
                            className="group block rounded-lg overflow-hidden border border-gray-200 hover:border-teal-400 transition-colors">
                            <img src={docUrl(u[d.key])} alt={d.label}
                              className="w-full h-20 object-cover bg-gray-100 group-hover:opacity-90 transition-opacity" />
                            <div className="px-2 py-1 bg-teal-50 flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-teal-600 shrink-0" />
                              <span className="text-teal-700 text-xs font-medium truncate">{d.label}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'Analytics' && (
          <div className="space-y-6">
            {analyticsLoading || !analytics ? (
              <div className="flex items-center justify-center h-48 text-gray-900">
                {analyticsLoading ? 'Loading analytics…' : 'No data yet'}
              </div>
            ) : (
              <>
                {/* ── Financial Summary ── */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">Total Deposits (Recharges)</p>
                      <p className="text-3xl font-bold">${(analytics.revenue.total.total_USDT||0).toFixed(2)}</p>
                      <p className="text-purple-200 text-sm mt-1">{(analytics.revenue.total.total_NSL||0).toLocaleString()} NSL</p>
                      <p className="text-purple-300 text-xs mt-2">This month: ${(analytics.revenue.this_month.total_USDT||0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">Total Withdrawals (Paid Out)</p>
                      <p className="text-3xl font-bold text-red-300">${(analytics.withdrawals.approved?.total_USDT||0).toFixed(2)}</p>
                      <p className="text-purple-200 text-sm mt-1">{(analytics.withdrawals.approved?.total_NSL||0).toLocaleString()} NSL</p>
                      <p className="text-purple-300 text-xs mt-2">Pending: ${(analytics.withdrawals.pending.total_USDT||0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-purple-200 text-xs uppercase tracking-wide mb-1">Net Platform Revenue</p>
                      <p className={`text-3xl font-bold ${((analytics.revenue.total.total_USDT||0) - (analytics.withdrawals.approved?.total_USDT||0)) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        ${((analytics.revenue.total.total_USDT||0) - (analytics.withdrawals.approved?.total_USDT||0)).toFixed(2)}
                      </p>
                      <p className="text-purple-200 text-sm mt-1">
                        {((analytics.revenue.total.total_NSL||0) - (analytics.withdrawals.approved?.total_NSL||0)).toLocaleString()} NSL
                      </p>
                      <p className="text-purple-300 text-xs mt-2">Deposits minus paid withdrawals</p>
                    </div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users',      value: analytics.users.total,                          sub: `${analytics.users.new_today} new today`,    color: 'text-blue-600' },
                    { label: 'Active Users',     value: analytics.users.active,                         sub: `${analytics.users.pending} pending`,         color: 'text-green-600' },
                    { label: 'Revenue (USDT)',   value: `$${(analytics.revenue.total.total_USDT||0).toFixed(2)}`, sub: `This month: $${(analytics.revenue.this_month.total_USDT||0).toFixed(2)}`, color: 'text-purple-600' },
                    { label: 'Revenue Growth',  value: analytics.revenue.growth_rate,                  sub: 'vs last month',                              color: parseFloat(analytics.revenue.growth_rate) >= 0 ? 'text-green-600' : 'text-red-500' },
                    { label: 'Transactions',    value: analytics.transactions.total,                   sub: `${analytics.transactions.pending} pending`,   color: 'text-orange-600' },
                    { label: 'Pending Withdrawals', value: analytics.withdrawals.pending.count,        sub: `$${(analytics.withdrawals.pending.total_USDT||0).toFixed(2)} USDT`, color: 'text-red-600' },
                    { label: 'Referrals',       value: analytics.referrals.total_count,               sub: `${(analytics.referrals.total_payouts||0).toLocaleString()} NSL paid`, color: 'text-cyan-600' },
                    { label: 'New This Month',  value: analytics.users.new_this_month,                sub: 'registered users',                            color: 'text-indigo-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-900 mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-900 mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User growth chart */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm mb-4">User Growth (30 days)</h3>
                    {analytics.charts.user_growth.length === 0 ? (
                      <p className="text-gray-900 text-sm text-center py-6">No data yet</p>
                    ) : (() => {
                      const data = analytics.charts.user_growth;
                      const max = Math.max(...data.map(d => d.count), 1);
                      return (
                        <div className="flex items-end gap-1 h-28">
                          {data.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count} users`}>
                              <div className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                                style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Revenue trend chart */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm mb-4">Revenue Trend — USDT (30 days)</h3>
                    {analytics.charts.revenue_trend.length === 0 ? (
                      <p className="text-gray-900 text-sm text-center py-6">No deposits yet</p>
                    ) : (() => {
                      const data = analytics.charts.revenue_trend;
                      const max = Math.max(...data.map(d => d.USDT || 0), 1);
                      return (
                        <div className="flex items-end gap-1 h-28">
                          {data.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: $${(d.USDT||0).toFixed(2)}`}>
                              <div className="w-full bg-purple-500 rounded-t-sm transition-all hover:bg-purple-600"
                                style={{ height: `${Math.max(((d.USDT||0) / max) * 100, 4)}%` }} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VIP distribution */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm mb-4">VIP Distribution</h3>
                    <div className="space-y-2">
                      {analytics.users.vip_distribution.map(v => (
                        <div key={v.vip_level} className="flex items-center gap-3">
                          <span className="text-xs text-gray-900 w-12">{v.vip_level || 'None'}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.min((v.count / (analytics.users.total||1)) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-6 text-right">{v.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction by type */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm mb-4">Transactions by Type</h3>
                    <div className="space-y-2">
                      {analytics.transactions.by_type.map(t => {
                        const colors = { recharge:'bg-green-500', withdrawal:'bg-red-500', income:'bg-blue-500', purchase:'bg-purple-500', renewal:'bg-orange-500' };
                        return (
                          <div key={t.type} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${colors[t.type]||'bg-gray-400'}`} />
                              <span className="text-sm capitalize text-gray-700">{t.type}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-900">{t.count}</span>
                              <span className="text-xs text-gray-900 ml-1.5">{(t.total_NSL||0).toLocaleString()} NSL</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top products */}
                {analytics.products.sales.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">Top Products by Sales</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-xs text-gray-900 uppercase tracking-wide">
                        <th className="px-5 py-2.5 text-left">Product</th>
                        <th className="px-5 py-2.5 text-right">Sales</th>
                        <th className="px-5 py-2.5 text-right">Revenue (NSL)</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {analytics.products.sales.map(p => (
                          <tr key={p.product_name} className="hover:bg-gray-50">
                            <td className="px-5 py-2.5 font-medium text-purple-700">{p.product_name}</td>
                            <td className="px-5 py-2.5 text-right text-gray-700">{p.sales_count}</td>
                            <td className="px-5 py-2.5 text-right font-mono text-gray-900">{(p.revenue||0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── Income Distribution Controls ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-1">Income Distribution</h3>
                  <p className="text-sm text-gray-900 mb-4">
                    Runs automatically every day at midnight. Use these buttons to trigger manually (e.g. after a system fix or to catch up).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {[
                      { job: 'daily-income',  label: 'Run Daily Income',  color: 'bg-green-600 hover:bg-green-500',  desc: 'Credits each active VIP product\'s daily NSL to user balances' },
                      { job: 'auto-renewal',  label: 'Run Auto-Renewal',  color: 'bg-blue-600 hover:bg-blue-500',    desc: 'Renews or deactivates expired products, recalculates VIP levels' },
                      { job: 'cleanup',       label: 'Run Cleanup',       color: 'bg-gray-600 hover:bg-gray-500',    desc: 'Purges expired sessions and old notifications' },
                    ].map(({ job, label, color, desc }) => (
                      <button key={job} onClick={() => triggerCron(job)} disabled={!!cronRunning}
                        className={`${color} disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-3 transition-colors flex flex-col items-start gap-1`}>
                        <span className="flex items-center gap-2">
                          {cronRunning === job
                            ? <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : null}
                          {label}
                        </span>
                        <span className="text-xs font-normal opacity-75">{desc}</span>
                      </button>
                    ))}
                  </div>
                  {cronResult && (
                    <div className={`rounded-xl px-4 py-3 text-sm font-mono ${cronResult.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                      <p className="font-semibold mb-1">{cronResult.job} — {cronResult.ok ? 'Success' : 'Failed'}</p>
                      {cronResult.ok ? (
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(cronResult.result, null, 2)}</pre>
                      ) : (
                        <p className="text-xs">{cronResult.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PROFIT TAB ── */}
        {tab === 'Profit' && (
          <div className="space-y-6">
            {/* Summary cards */}
            {profitLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-28" />)}
              </div>
            ) : profit ? (
              <>
                {/* All-time cards */}
                <div>
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">All Time</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-900 font-medium">Revenue In</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{profit.all_time.revenue_in.toLocaleString()}</p>
                      <p className="text-xs text-gray-900 mt-1">NSL deposited &amp; earned</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-xs text-gray-900 font-medium">Revenue Out</p>
                      </div>
                      <p className="text-2xl font-bold text-red-500">{profit.all_time.revenue_out.toLocaleString()}</p>
                      <p className="text-xs text-gray-900 mt-1">NSL paid out &amp; withdrawn</p>
                    </div>
                    <div className={`rounded-xl p-5 shadow-sm border ${profit.all_time.net_profit >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profit.all_time.net_profit >= 0 ? 'bg-purple-100' : 'bg-red-100'}`}>
                          {profit.all_time.net_profit >= 0
                            ? <TrendingUp className="w-4 h-4 text-purple-600" />
                            : <TrendingDown className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-900 font-medium">Net Profit</p>
                      </div>
                      <p className={`text-2xl font-bold ${profit.all_time.net_profit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                        {profit.all_time.net_profit >= 0 ? '+' : ''}{profit.all_time.net_profit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-900 mt-1">NSL net position</p>
                    </div>
                  </div>
                </div>

                {/* This month cards */}
                <div>
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">This Month</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-900 mb-1">Revenue In</p>
                      <p className="text-xl font-bold text-green-600">{profit.this_month.revenue_in.toLocaleString()} <span className="text-sm font-normal text-gray-900">NSL</span></p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-900 mb-1">Revenue Out</p>
                      <p className="text-xl font-bold text-red-500">{profit.this_month.revenue_out.toLocaleString()} <span className="text-sm font-normal text-gray-900">NSL</span></p>
                    </div>
                    <div className={`rounded-xl p-5 shadow-sm border ${profit.this_month.net_profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs text-gray-900 mb-1">Net Profit</p>
                      <p className={`text-xl font-bold ${profit.this_month.net_profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {profit.this_month.net_profit >= 0 ? '+' : ''}{profit.this_month.net_profit.toLocaleString()} <span className="text-sm font-normal text-gray-900">NSL</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Today's activity */}
                {profit.today && (
                  <div>
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Today</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Deposits', value: profit.today.deposits, color: 'text-green-600' },
                        { label: 'Purchases', value: profit.today.purchases, color: 'text-green-600' },
                        { label: 'Renewals', value: profit.today.renewals, color: 'text-green-600' },
                        { label: 'Income Paid', value: profit.today.income_paid, color: 'text-red-500' },
                        { label: 'Referral Bonuses', value: profit.today.referral_bonus, color: 'text-red-500' },
                        { label: 'Withdrawals', value: profit.today.withdrawals, color: 'text-red-500' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">{label}</p>
                          <p className={`text-lg font-bold ${color}`}>{(value || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">NSL</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revenue breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-green-700 mb-3">Revenue IN — All Time</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Recharges', value: profit.all_time.breakdown_in?.recharge },
                        { label: 'Purchases', value: profit.all_time.breakdown_in?.purchase },
                        { label: 'Renewals', value: profit.all_time.breakdown_in?.renewal },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-semibold text-green-600">{(value || 0).toLocaleString()} NSL</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-red-600 mb-3">Revenue OUT — All Time</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Income Paid', value: profit.all_time.breakdown_out?.income },
                        { label: 'Withdrawals', value: profit.all_time.breakdown_out?.withdrawal },
                        { label: 'Referral Bonuses', value: profit.all_time.breakdown_out?.referral_bonus },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-semibold text-red-500">{(value || 0).toLocaleString()} NSL</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active subscriptions */}
                {profit.active_products != null && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">{profit.active_products.toLocaleString()} Active Subscriptions</p>
                      <p className="text-xs text-blue-700">VIP plans currently generating daily income</p>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {/* User Payouts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Active Product Holders</h2>
                  <p className="text-xs text-gray-900 mt-0.5">{payoutsTotal} users with active VIP plans — sorted by expiry date</p>
                </div>
                <button onClick={() => fetchPayouts(payoutsPage)} disabled={payoutsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${payoutsLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {payoutsLoading && payouts.length === 0 ? (
                <div className="p-6 space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : payouts.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-900 text-sm">No active product holders</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-900 uppercase tracking-wide">
                          <th className="px-4 py-3 text-left">User</th>
                          <th className="px-4 py-3 text-left">Plan</th>
                          <th className="px-4 py-3 text-left">Expires</th>
                          <th className="px-4 py-3 text-right">Total Payout</th>
                          <th className="px-4 py-3 text-right">Remaining to Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {payouts.map(p => {
                          const expiresSoon = p.days_remaining <= 3;
                          const expired = p.days_remaining === 0;
                          return (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{p.user?.username || '—'}</p>
                                <p className="text-xs text-gray-900">{p.user?.phone || ''}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{p.product_name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${expired ? 'text-red-400' : expiresSoon ? 'text-orange-400' : 'text-gray-900'}`} />
                                  <div>
                                    <p className={`text-xs font-medium ${expired ? 'text-red-500' : expiresSoon ? 'text-orange-500' : 'text-gray-600'}`}>
                                      {expired ? 'Expired' : `${p.days_remaining}d left`}
                                    </p>
                                    <p className="text-xs text-gray-900">{new Date(p.expires_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-gray-700">
                                {parseFloat(p.total_payout_NSL).toLocaleString()} NSL
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-mono font-semibold ${p.remaining_NSL > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {parseFloat(p.remaining_NSL).toLocaleString()} NSL
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {payoutsTotal > PAYOUTS_PAGE_SIZE && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-900">
                        Showing {((payoutsPage - 1) * PAYOUTS_PAGE_SIZE) + 1}–{Math.min(payoutsPage * PAYOUTS_PAGE_SIZE, payoutsTotal)} of {payoutsTotal}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => fetchPayouts(payoutsPage - 1)} disabled={payoutsPage === 1 || payoutsLoading}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                          Previous
                        </button>
                        <button onClick={() => fetchPayouts(payoutsPage + 1)} disabled={payoutsPage * PAYOUTS_PAGE_SIZE >= payoutsTotal || payoutsLoading}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab === 'Payments' && (
          <div className="space-y-8">
            {/* Reward settings card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 max-w-lg">
              <h2 className="font-semibold text-gray-900">Reward & Tax Settings</h2>
              <p className="text-sm text-gray-500">These amounts are only visible to you. Users do not see the NSL reward or tax count.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Check-in Reward (NSL)</label>
                  <input type="number" min="0" step="0.01"
                    value={platformSettings.daily_checkin_reward_NSL}
                    onChange={e => setPlatformSettings(s => ({ ...s, daily_checkin_reward_NSL: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIP Tax Reviews Per Day</label>
                  <input type="number" min="1" step="1"
                    value={platformSettings.vip_tax_daily_count}
                    onChange={e => setPlatformSettings(s => ({ ...s, vip_tax_daily_count: parseInt(e.target.value) || 3 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Show reward amount in check-in</p>
                    <p className="text-xs text-gray-500">{platformSettings.show_checkin_reward === '1' ? 'Users can see the NSL amount' : 'Hidden from users'}</p>
                  </div>
                  <button type="button"
                    onClick={() => setPlatformSettings(s => ({ ...s, show_checkin_reward: s.show_checkin_reward === '1' ? '0' : '1' }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${platformSettings.show_checkin_reward === '1' ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${platformSettings.show_checkin_reward === '1' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <button
                disabled={platformSaving}
                onClick={async () => {
                  setPlatformSaving(true);
                  try {
                    await api.put('/admin/platform-settings', platformSettings);
                    toast.success('Settings saved');
                  } catch { toast.error('Failed to save settings'); }
                  finally { setPlatformSaving(false); }
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                {platformSaving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>

            {/* Currently Earning */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Currently Earning</h2>
              <p className="text-sm text-gray-500 mb-3">Active VIP subscriptions — money not yet matured</p>
              {paymentLoading ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
              ) : paymentStatus.earning.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">No active VIP subscriptions</div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['User', 'KYC', 'Plan', 'Price (NSL)', 'Purchased', 'Expires', 'Days Left', 'Total Earned (NSL)'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paymentStatus.earning.map(row => (
                          <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">{row.user?.username || '—'}</p>
                              <p className="text-xs text-gray-400">{row.user?.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.user?.kyc_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                {row.user?.kyc_verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-purple-600 whitespace-nowrap">{row.product?.name}</td>
                            <td className="px-4 py-3 font-semibold text-blue-600">{row.product?.price_NSL?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(row.purchase_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 text-center font-bold text-amber-600">{row.days_remaining}d</td>
                            <td className="px-4 py-3 font-bold text-green-600">{row.total_earned_NSL?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Ready to Pay */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Ready to Pay</h2>
              <p className="text-sm text-gray-500 mb-3">Matured VIP subscriptions — earnings ready for payout</p>
              {paymentLoading ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
              ) : paymentStatus.matured.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">No matured subscriptions</div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-red-50 border-b border-gray-100">
                          {['User', 'KYC', 'Plan', 'Price (NSL)', 'Purchased', 'Expired', 'Total Earned (NSL)'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paymentStatus.matured.map(row => (
                          <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">{row.user?.username || '—'}</p>
                              <p className="text-xs text-gray-400">{row.user?.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.user?.kyc_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                {row.user?.kyc_verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-purple-600 whitespace-nowrap">{row.product?.name}</td>
                            <td className="px-4 py-3 font-semibold text-blue-600">{row.product?.price_NSL?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(row.purchase_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-red-400 text-xs whitespace-nowrap">{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 font-bold text-amber-600">{row.total_earned_NSL?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Cash-Out Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 max-w-lg">
              <h2 className="font-semibold text-gray-900">Cash-Out Conditions</h2>
              <p className="text-sm text-gray-500">Users must meet ALL three conditions before they can withdraw.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum NSL Earned from System</label>
                  <input type="number" min="0" step="1"
                    value={platformSettings.cashout_min_nsl ?? 150}
                    onChange={e => setPlatformSettings(s => ({ ...s, cashout_min_nsl: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                  <p className="text-xs text-gray-400 mt-1">Condition 1: user total income NSL must reach this amount</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Qualifying Referrals</label>
                  <input type="number" min="0" step="1"
                    value={platformSettings.cashout_min_referrals ?? 5}
                    onChange={e => setPlatformSettings(s => ({ ...s, cashout_min_referrals: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                  <p className="text-xs text-gray-400 mt-1">Condition 2: invited users who have recharged AND bought VIP</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                  Condition 3: KYC must be verified (always required)
                </div>
              </div>
              <button
                disabled={platformSaving}
                onClick={async () => {
                  setPlatformSaving(true);
                  try {
                    await api.put('/admin/platform-settings', platformSettings);
                    toast.success('Cash-out settings saved');
                    setCashoutLoading(true);
                    const { data } = await api.get('/admin/cashout-eligibility');
                    setCashoutData(data);
                  } catch { toast.error('Failed to save settings'); }
                  finally { setPlatformSaving(false); setCashoutLoading(false); }
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                {platformSaving ? 'Saving…' : 'Save Cash-Out Settings'}
              </button>
            </div>

            {/* Cash-Out Eligibility */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Cash-Out Eligibility</h2>
              <p className="text-sm text-gray-500 mb-3">
                Thresholds: <strong>{cashoutData.thresholds?.min_nsl} NSL</strong> earned &bull; <strong>{cashoutData.thresholds?.min_referrals}</strong> qualifying referrals &bull; KYC verified
              </p>
              {cashoutLoading ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
              ) : cashoutData.users?.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">No users found</div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['User', 'Total Earned (NSL)', 'Qual. Referrals', 'KYC', 'Eligible'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cashoutData.users?.map(u => (
                          <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 ${u.conditions.all_ok ? 'bg-green-50/40' : ''}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">{u.username || '—'}</p>
                              <p className="text-xs text-gray-400">{u.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${u.conditions.earned_ok ? 'text-green-600' : 'text-red-500'}`}>
                                {u.total_earned_NSL?.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${u.conditions.referrals_ok ? 'text-green-600' : 'text-red-500'}`}>
                                {u.qualifying_referrals}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.kyc_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                {u.kyc_verified ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {u.conditions.all_ok
                                ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Eligible</span>
                                : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Not yet</span>
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

        {tab === 'Settings' && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Payment Methods</h2>
              <p className="text-gray-900 text-sm">Configure the numbers and addresses users send money to when making deposits.</p>

              {/* Agent Codes — per provider */}
              {agentCodesLoading ? (
                <p className="text-gray-900 text-sm">Loading agent codes…</p>
              ) : (
                [
                  { provider: 'orange_money', label: 'Orange Money', dotBg: 'bg-orange-500', ring: 'focus:border-orange-400', activeBadge: 'bg-orange-100 text-orange-700', letter: 'O' },
                  { provider: 'africell',     label: 'Africell',     dotBg: 'bg-blue-600',   ring: 'focus:border-blue-400',   activeBadge: 'bg-blue-100 text-blue-700',   letter: 'A' },
                ].map(({ provider, label, dotBg, ring, activeBadge, letter }) => (
                  <div key={provider} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    {/* Section header */}
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full ${dotBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{letter}</span>
                      <span className="text-sm font-semibold text-gray-800">{label} Agent Codes</span>
                    </div>

                    {/* Existing codes */}
                    {(agentCodes[provider] || []).length === 0 ? (
                      <p className="text-gray-900 text-xs">No agent codes yet. Add one below.</p>
                    ) : (
                      <div className="space-y-2">
                        {(agentCodes[provider] || []).map(entry => (
                          <div key={entry.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                            {/* Top row: code + status badge */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono text-sm font-semibold text-gray-900 truncate">{entry.code}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${entry.active ? activeBadge : 'bg-gray-100 text-gray-900'}`}>
                                {entry.active ? 'Active' : 'Hidden'}
                              </span>
                            </div>
                            {/* Bottom row: optional label + action buttons */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-900 truncate">{entry.label || '—'}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.patch(`/admin/agent-codes/${entry.id}/toggle`, { provider });
                                      const { data } = await api.get('/admin/agent-codes');
                                      setAgentCodes(data.data);
                                    } catch { toast.error('Failed to toggle'); }
                                  }}
                                  className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-md font-medium transition-colors">
                                  {entry.active ? 'Hide' : 'Show'}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Delete this agent code?')) return;
                                    try {
                                      await api.delete(`/admin/agent-codes/${entry.id}`, { data: { provider } });
                                      const { data } = await api.get('/admin/agent-codes');
                                      setAgentCodes(data.data);
                                      toast.success('Deleted');
                                    } catch { toast.error('Failed to delete'); }
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 bg-white border border-red-100 hover:border-red-300 px-2.5 py-1 rounded-md font-medium transition-colors">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new code form — fully stacked */}
                    <div className="pt-1 border-t border-gray-100 space-y-2">
                      <input
                        type="tel"
                        placeholder="Phone / agent code"
                        value={newAgentCode[provider].code}
                        onChange={e => setNewAgentCode(s => ({ ...s, [provider]: { ...s[provider], code: e.target.value } }))}
                        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ${ring} focus:outline-none font-mono`}
                      />
                      <input
                        type="text"
                        placeholder="Label (optional)"
                        value={newAgentCode[provider].label}
                        onChange={e => setNewAgentCode(s => ({ ...s, [provider]: { ...s[provider], label: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                      <button
                        disabled={agentCodeAdding === provider || !newAgentCode[provider].code.trim()}
                        onClick={async () => {
                          setAgentCodeAdding(provider);
                          try {
                            await api.post('/admin/agent-codes', { provider, ...newAgentCode[provider] });
                            setNewAgentCode(s => ({ ...s, [provider]: { code: '', label: '' } }));
                            const { data } = await api.get('/admin/agent-codes');
                            setAgentCodes(data.data);
                            toast.success('Agent code added');
                          } catch { toast.error('Failed to add'); }
                          finally { setAgentCodeAdding(''); }
                        }}
                        className="w-full py-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                        {agentCodeAdding === provider ? 'Adding…' : '+ Add'}
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Binance Wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">B</span>
                    Binance USDT Wallet Address
                  </span>
                </label>
                <input type="text" value={paymentSettings.binance_wallet_address || ''}
                  onChange={e => setPaymentSettings(s => ({ ...s, binance_wallet_address: e.target.value }))}
                  placeholder="e.g. TRx... (TRC20)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 font-mono" />
              </div>

              {/* Binance Network */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network / Chain</label>
                <input type="text" value={paymentSettings.binance_network || ''}
                  onChange={e => setPaymentSettings(s => ({ ...s, binance_network: e.target.value }))}
                  placeholder="e.g. TRC20 (USDT)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              <button
                disabled={settingsSaving}
                onClick={async () => {
                  setSettingsSaving(true);
                  try {
                    await api.put('/admin/payment-settings', paymentSettings);
                    toast.success('Payment settings saved');
                  } catch {
                    toast.error('Failed to save settings');
                  } finally {
                    setSettingsSaving(false);
                  }
                }}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                {settingsSaving ? 'Saving…' : 'Save Payment Settings'}
              </button>
            </div>

            {/* ── Platform Settings ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900">Platform Rules</h2>
                <p className="text-gray-900 text-sm mt-0.5">Referral commissions, fees, and investment duration options</p>
              </div>

              {/* Referral percentages */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Referral Commission (%)</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['Level 1 (Direct)', 'referral_l1_pct'], ['Level 2', 'referral_l2_pct'], ['Level 3', 'referral_l3_pct']].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-900 mb-1">{label}</label>
                      <div className="relative">
                        <input type="number" min="0" max="100" step="0.1"
                          value={platformSettings[key]}
                          onChange={e => setPlatformSettings(s => ({ ...s, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 pr-7" />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-900 text-xs">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-900 mt-1.5">Paid to each referral level when a user makes an investment purchase</p>
              </div>

              {/* Fee percentages */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Transaction Fees (%)</p>
                <div className="grid grid-cols-2 gap-3">
                  {[['Recharge Fee', 'recharge_fee_pct'], ['Withdrawal Fee', 'withdrawal_fee_pct']].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-900 mb-1">{label}</label>
                      <div className="relative">
                        <input type="number" min="0" max="100" step="0.1"
                          value={platformSettings[key]}
                          onChange={e => setPlatformSettings(s => ({ ...s, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 pr-7" />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-900 text-xs">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-900 mt-1.5">Super admin accounts are always exempt from fees</p>
              </div>

              {/* Exchange rate */}
              <div>
                <p className="text-sm font-semibold text-black mb-2">Exchange Rate</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-black mb-1">NSL per 1 USDT</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={platformSettings.exchange_rate_nsl_per_usdt}
                      onChange={e => setPlatformSettings(s => ({ ...s, exchange_rate_nsl_per_usdt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-black">Live conversion</p>
                    <p className="text-sm text-black mt-1">1 USDT = {NSL_RATE.toFixed(2)} NSL</p>
                    <p className="text-xs text-black mt-1">100 NSL = ${(100 / NSL_RATE).toFixed(2)} USDT</p>
                  </div>
                </div>
                <p className="text-xs text-black mt-1.5">Changing this updates deposit, withdrawal, and product dollar previews.</p>
              </div>

              {/* Duration options */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-black mb-2">Investment Duration Options (days)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-green-200 bg-green-50 rounded-xl p-3">
                    <p className="text-sm font-bold text-black mb-2">Default durations</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[['3 Days', 'dur_short'], ['1 Week', 'dur_week']].map(([label, key]) => (
                        <div key={key}>
                          <label className="block text-xs text-black mb-1">{label}</label>
                          <input type="number" min="1" max="365"
                            value={platformSettings[key]}
                            onChange={e => setPlatformSettings(s => ({ ...s, [key]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-purple-200 bg-purple-50 rounded-xl p-3">
                    <p className="text-sm font-bold text-black mb-2">Invitation-only durations</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[['1 Month', 'dur_month'], ['Promo Days', 'dur_promo']].map(([label, key]) => (
                        <div key={key}>
                          <label className="block text-xs text-black mb-1">{label}</label>
                          <input type="number" min="1" max="365"
                            value={platformSettings[key]}
                            onChange={e => setPlatformSettings(s => ({ ...s, [key]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-black mb-1">Promo Label (shown to users)</label>
                      <input type="text"
                        value={platformSettings.dur_promo_label}
                        onChange={e => setPlatformSettings(s => ({ ...s, dur_promo_label: e.target.value }))}
                        placeholder="e.g. Flash Sale"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-black mt-1.5">3 days and 1 week are default. 1 month and promo are invitation-only. Changes take effect immediately on the next user session.</p>
              </div>

              {/* Task Rewards */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Task Rewards</h3>
                  <p className="text-xs text-gray-500 mt-0.5">NSL amounts users earn for completing daily tasks and first deposit</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-black mb-1">Daily Check-In Reward (NSL)</label>
                    <div className="flex gap-2 items-center">
                      <input type="number" min="0"
                        value={platformSettings.daily_checkin_reward_NSL}
                        onChange={e => setPlatformSettings(s => ({ ...s, daily_checkin_reward_NSL: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-black whitespace-nowrap">
                        <input type="checkbox"
                          checked={platformSettings.show_checkin_reward === '1'}
                          onChange={e => setPlatformSettings(s => ({ ...s, show_checkin_reward: e.target.checked ? '1' : '0' }))}
                          className="w-4 h-4 accent-purple-600" />
                        Show amount
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Explore VIP Reward (NSL)</label>
                    <input type="number" min="0"
                      value={platformSettings.explore_vip_reward_NSL}
                      onChange={e => setPlatformSettings(s => ({ ...s, explore_vip_reward_NSL: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">First Deposit Bonus (NSL)</label>
                    <input type="number" min="0"
                      value={platformSettings.first_deposit_bonus_NSL}
                      onChange={e => setPlatformSettings(s => ({ ...s, first_deposit_bonus_NSL: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                    <p className="text-xs text-gray-500 mt-0.5">Auto-applied on first deposit within 1h of registration</p>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">VIP Tax Reviews per Day</label>
                    <input type="number" min="1" max="10"
                      value={platformSettings.vip_tax_daily_count}
                      onChange={e => setPlatformSettings(s => ({ ...s, vip_tax_daily_count: parseInt(e.target.value) || 3 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                    <p className="text-xs text-gray-500 mt-0.5">Max reviews per subscription per calendar day</p>
                  </div>
                </div>
              </div>

              <button
                disabled={platformSaving}
                onClick={async () => {
                  setPlatformSaving(true);
                  try {
                    await api.put('/admin/platform-settings', platformSettings);
                    toast.success('Platform settings saved');
                  } catch {
                    toast.error('Failed to save platform settings');
                  } finally {
                    setPlatformSaving(false);
                  }
                }}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                {platformSaving ? 'Saving…' : 'Save Platform Settings'}
              </button>
            </div>

            {/* Community Group Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Community Group Links</h2>
                <p className="text-sm text-gray-500 mt-0.5">Set the join links for your WhatsApp and Telegram groups. Users will see clickable buttons on the Contact page.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Group Link</label>
                  <input
                    type="url"
                    value={platformSettings.whatsapp_group_link || ''}
                    onChange={e => setPlatformSettings(s => ({ ...s, whatsapp_group_link: e.target.value }))}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Group Link</label>
                  <input
                    type="url"
                    value={platformSettings.telegram_group_link || ''}
                    onChange={e => setPlatformSettings(s => ({ ...s, telegram_group_link: e.target.value }))}
                    placeholder="https://t.me/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Support Number</label>
                  <p className="text-xs text-gray-400 mb-1">International format without + or spaces. Shown as a floating chat button on all pages.</p>
                  <input
                    type="tel"
                    value={platformSettings.whatsapp_support_number || ''}
                    onChange={e => setPlatformSettings(s => ({ ...s, whatsapp_support_number: e.target.value.replace(/[^\d]/g, '') }))}
                    placeholder="23288XXXXXXX"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400 font-mono"
                  />
                </div>
                <button
                  onClick={async () => {
                    setPlatformSaving(true);
                    try {
                      await api.put('/admin/platform-settings', {
                        whatsapp_group_link: platformSettings.whatsapp_group_link,
                        telegram_group_link: platformSettings.telegram_group_link,
                        whatsapp_support_number: platformSettings.whatsapp_support_number,
                      });
                      toast.success('Community links saved');
                    } catch {
                      toast.error('Failed to save community links');
                    } finally {
                      setPlatformSaving(false);
                    }
                  }}
                  disabled={platformSaving}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {platformSaving ? 'Saving…' : 'Save Community Links'}
                </button>
              </div>
            </div>

            {/* Change My Email */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Change My Email</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update the superadmin account email address.</p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const newEmail = myEmailForm.email.trim();
                if (!newEmail) { toast.error('Email cannot be empty'); return; }
                setMyEmailSaving(true);
                try {
                  await api.put('/user/profile', { email: newEmail });
                  toast.success('Email changed successfully');
                  setMyEmailForm({ email: '' });
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to change email');
                } finally {
                  setMyEmailSaving(false);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
                  <input
                    type="email"
                    value={myEmailForm.email}
                    onChange={e => setMyEmailForm({ email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={myEmailSaving || !myEmailForm.email.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {myEmailSaving ? 'Saving…' : 'Change Email'}
                </button>
              </form>
            </div>

            {/* Change My Phone */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Change My Phone Number</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update the superadmin account phone number.</p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const newPhone = myPhoneForm.phone.trim();
                if (!newPhone) { toast.error('Phone cannot be empty'); return; }
                setMyPhoneSaving(true);
                try {
                  await api.put('/user/profile', { phone: newPhone });
                  toast.success('Phone number changed successfully');
                  setMyPhoneForm({ phone: '' });
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to change phone number');
                } finally {
                  setMyPhoneSaving(false);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Phone Number</label>
                  <input
                    type="tel"
                    value={myPhoneForm.phone}
                    onChange={e => setMyPhoneForm({ phone: e.target.value })}
                    placeholder="+232XXXXXXXX"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={myPhoneSaving || !myPhoneForm.phone.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {myPhoneSaving ? 'Saving…' : 'Change Phone Number'}
                </button>
              </form>
            </div>

            {/* Change My Username */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Change My Username</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update the superadmin login username.</p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const newUsername = myUsernameForm.username.trim();
                if (!newUsername) { toast.error('Username cannot be empty'); return; }
                setMyUsernameSaving(true);
                try {
                  await api.put('/user/profile', { username: newUsername });
                  toast.success('Username changed successfully');
                  setMyUsernameForm({ username: '' });
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to change username');
                } finally {
                  setMyUsernameSaving(false);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Username</label>
                  <input
                    type="text"
                    value={myUsernameForm.username}
                    onChange={e => setMyUsernameForm({ username: e.target.value })}
                    placeholder="Enter new username"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={myUsernameSaving || !myUsernameForm.username.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {myUsernameSaving ? 'Saving…' : 'Change Username'}
                </button>
              </form>
            </div>

            {/* Change My Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Change My Password</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update the superadmin account password. Requires your current password.</p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (myPasswordForm.new_password !== myPasswordForm.confirm_password) { toast.error('Passwords do not match'); return; }
                if (myPasswordForm.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                setMyPasswordSaving(true);
                try {
                  await api.post('/auth/change-password', { oldPassword: myPasswordForm.old_password, newPassword: myPasswordForm.new_password });
                  toast.success('Password changed successfully');
                  setMyPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to change password');
                } finally {
                  setMyPasswordSaving(false);
                }
              }} className="space-y-3">
                {[
                  { label: 'Current Password', field: 'old_password', placeholder: 'Enter current password' },
                  { label: 'New Password', field: 'new_password', placeholder: 'Min. 8 characters' },
                  { label: 'Confirm New Password', field: 'confirm_password', placeholder: 'Re-enter new password' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="password"
                      value={myPasswordForm[field]}
                      onChange={e => setMyPasswordForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                ))}
                {myPasswordForm.new_password && myPasswordForm.confirm_password && myPasswordForm.new_password !== myPasswordForm.confirm_password && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                <button
                  type="submit"
                  disabled={myPasswordSaving || !myPasswordForm.old_password || !myPasswordForm.new_password || myPasswordForm.new_password !== myPasswordForm.confirm_password}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {myPasswordSaving ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Broadcast Notification */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900">Broadcast Notification</h2>
                <p className="text-sm text-gray-500 mt-0.5">Send a push notification to all users or only active users.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. System maintenance at midnight"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={broadcastForm.message}
                    onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write your message here…"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                  <select
                    value={broadcastForm.target}
                    onChange={e => setBroadcastForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 bg-white">
                    <option value="all">All Users</option>
                    <option value="active">Active Users Only</option>
                  </select>
                </div>
                <button
                  disabled={broadcastSending || !broadcastForm.title.trim() || !broadcastForm.message.trim()}
                  onClick={sendBroadcast}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                  {broadcastSending ? 'Sending…' : 'Send Broadcast'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS TAB ── */}
        {tab === 'Testimonials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Country Activity Feed</h2>
                <p className="text-sm text-gray-900">Anonymous activity cards shown on user dashboards. Toggle individual entries or disable the entire feed.</p>
              </div>
              <button onClick={() => { setTestimonialForm(createTestimonialForm(testimonialCountryFilter)); setShowAddTestimonialModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg">
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            </div>

            {/* Global ON/OFF toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${activityFeedVisible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div>
                <p className={`font-semibold text-sm ${activityFeedVisible ? 'text-green-800' : 'text-red-800'}`}>
                  Country Activity Feed — {activityFeedVisible ? 'VISIBLE TO USERS' : 'HIDDEN FROM USERS'}
                </p>
                <p className={`text-xs mt-0.5 ${activityFeedVisible ? 'text-green-600' : 'text-red-600'}`}>
                  {activityFeedVisible
                    ? 'Users can see the activity section and floating notifications on their dashboard.'
                    : 'The activity section and notifications are completely hidden from all users.'}
                </p>
              </div>
              <button
                disabled={activityFeedToggling}
                onClick={async () => {
                  setActivityFeedToggling(true);
                  try {
                    const next = !activityFeedVisible;
                    await api.patch('/testimonials/settings', { activity_feed_visible: next });
                    setActivityFeedVisible(next);
                    toast.success(`Activity feed ${next ? 'enabled' : 'disabled'} for all users`);
                  } catch {
                    toast.error('Failed to update setting');
                  } finally {
                    setActivityFeedToggling(false);
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${activityFeedVisible ? 'bg-green-500' : 'bg-gray-300'} ${activityFeedToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${activityFeedVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by country</label>
              <select
                value={testimonialCountryFilter}
                onChange={e => setTestimonialCountryFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
              >
                {TESTIMONIAL_COUNTRIES.map(country => (
                  <option key={country.country} value={country.country}>
                    {country.flag} {country.country} ({testimonialCountryCounts[country.country] || 0})
                  </option>
                ))}
              </select>
            </div>
            {testimonialsLoading ? (
              <div className="text-center py-12 text-gray-900">Loading…</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / 5));
                  const safePage = Math.min(testimonialPage, totalPages);
                  const pageItems = filteredTestimonials.slice((safePage - 1) * 5, safePage * 5);
                  return (
                    <>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                        {filteredTestimonials.length > 0
                          ? <>Page <span className="font-semibold text-gray-900">{safePage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> · Showing <span className="font-semibold text-gray-900">{(safePage - 1) * 5 + 1}–{Math.min(safePage * 5, filteredTestimonials.length)}</span> of <span className="font-semibold text-gray-900">{filteredTestimonials.length}</span> {testimonialCountryFilter} entries in <span className="font-semibold">{getTestimonialCountry(testimonialCountryFilter).currency_code}</span>.</>
                          : <>0 entries for {testimonialCountryFilter}</>
                        }
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 text-xs text-gray-900 uppercase tracking-wide">
                            {['Flag','Name','Country','Phone','Type','Amount','Visible','Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-gray-50">
                            {pageItems.map(t => (
                              <tr key={t.id} className={`hover:bg-gray-50 ${!t.visible ? 'opacity-40' : ''}`}>
                                <td className="px-4 py-3 text-xl">{t.flag}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  <div>{t.country}</div>
                                  <div className="text-xs text-gray-900">{t.currency_name || getTestimonialCountry(t.country).currency_code}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-900 font-mono text-xs whitespace-nowrap">{t.phone}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'withdrawal' ? 'bg-green-100 text-green-700' : t.type === 'deposit' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">{formatTestimonialAmount(t)}</td>
                                <td className="px-4 py-3">
                                  <button onClick={async () => {
                                    try { const { data } = await api.patch(`/testimonials/${t.id}/toggle`, {}); setTestimonials(prev => prev.map(x => x.id === t.id ? data.testimonial : x)); }
                                    catch { toast.error('Toggle failed'); }
                                  }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${t.visible ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${t.visible ? 'translate-x-5' : 'translate-x-1'}`} />
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <button onClick={async () => {
                                    if (!confirm(`Delete "${t.name}"?`)) return;
                                    try { await api.delete(`/testimonials/${t.id}`); setTestimonials(prev => prev.filter(x => x.id !== t.id)); toast.success('Deleted'); }
                                    catch { toast.error('Delete failed'); }
                                  }} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredTestimonials.length === 0 && (
                        <div className="py-10 text-center text-gray-900 text-sm">No entries for {testimonialCountryFilter}</div>
                      )}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                          <button onClick={() => setTestimonialPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            ← Prev
                          </button>
                          <span className="text-xs text-gray-900">Page {safePage} of {totalPages}</span>
                          <button onClick={() => setTestimonialPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── AUDIT LOG TAB ── */}
        {tab === 'Activity Log' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Activity Log</h2>
              <p className="text-sm text-gray-500">All user activity in the system — login, deposits, withdrawals, and more. Click a user to expand their actions.</p>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or phone…"
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setActivityLoading(true);
                    setActivityExpanded({});
                    setActivityUserLogs({});
                    api.get('/admin/activity-log', { params: { page: 1, limit: 30, search: activitySearch } })
                      .then(({ data }) => { setActivityUsers(data.data || []); setActivityTotal(data.total || 0); setActivityPage(1); })
                      .catch(() => toast.error('Failed to search activity log'))
                      .finally(() => setActivityLoading(false));
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 flex-1 max-w-xs"
              />
              <button
                onClick={() => {
                  setActivityLoading(true);
                  setActivityExpanded({});
                  setActivityUserLogs({});
                  api.get('/admin/activity-log', { params: { page: 1, limit: 30, search: activitySearch } })
                    .then(({ data }) => { setActivityUsers(data.data || []); setActivityTotal(data.total || 0); setActivityPage(1); })
                    .catch(() => toast.error('Failed to search activity log'))
                    .finally(() => setActivityLoading(false));
                }}
                className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
              >
                Search
              </button>
            </div>

            {activityLoading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
            ) : activityUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No users found.</div>
            ) : (
              <>
                <div className="space-y-2">
                  {activityUsers.map(u => {
                    const isOpen = !!activityExpanded[u.id];
                    const logs = activityUserLogs[u.id] || [];
                    const isLoadingUser = !!activityUserLoading[u.id];

                    const toggleUser = () => {
                      const nowOpen = !isOpen;
                      setActivityExpanded(prev => ({ ...prev, [u.id]: nowOpen }));
                      if (nowOpen && !activityUserLogs[u.id]) {
                        setActivityUserLoading(prev => ({ ...prev, [u.id]: true }));
                        api.get('/admin/audit-logs', { params: { actor_id: u.id, limit: 50, page: 1 } })
                          .then(({ data }) => setActivityUserLogs(prev => ({ ...prev, [u.id]: data.data || [] })))
                          .catch(() => toast.error('Failed to load user activity'))
                          .finally(() => setActivityUserLoading(prev => ({ ...prev, [u.id]: false })));
                      }
                    };

                    const actionLabel = (action) => {
                      const labels = {
                        'user.login': 'Logged in',
                        'user.deposit_submit': 'Submitted deposit',
                        'user.recharge_request': 'Requested recharge',
                        'user.withdrawal_request': 'Requested withdrawal',
                        'user.change_password': 'Changed password',
                        'admin.user.role_update': 'Role changed',
                        'admin.user.status_update': 'Status changed',
                        'admin.user.balance_update': 'Balance updated',
                        'admin.deposit.approve': 'Deposit approved',
                        'admin.deposit.reject': 'Deposit rejected',
                        'admin.ambassador.add': 'Ambassador added',
                        'admin.transaction.approve': 'Transaction approved',
                        'admin.transaction.reject': 'Transaction rejected',
                        'admin.kyc.verify': 'KYC verified',
                        'admin.kyc.reject': 'KYC rejected',
                        'finance.transaction_approve': 'Approved transaction',
                        'finance.transaction_reject': 'Rejected transaction',
                        'finance.currency_add': 'Added currency',
                        'finance.user_suspend': 'Suspended user',
                        'finance.user_activate': 'Activated user',
                        'finance.user_approve': 'Approved user account',
                        'approval.user_approve': 'Approved user',
                        'approval.user_reject': 'Rejected user',
                      };
                      return labels[action] || action;
                    };

                    return (
                      <div key={u.id} className="rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={toggleUser}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                              {(u.username || u.phone || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{esc(u.username || u.phone)}</div>
                              <div className="text-xs text-gray-400">{esc(u.phone)} · <span className={`font-medium ${ROLE_BADGE_COLORS[u.role] || 'text-gray-500'}`}>{u.role}</span></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">{u.action_count} action{u.action_count !== 1 ? 's' : ''}</div>
                              {u.last_action_at && <div className="text-xs text-gray-400">{new Date(u.last_action_at).toLocaleDateString()}</div>}
                            </div>
                            <span className={`text-gray-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                            {isLoadingUser ? (
                              <div className="text-center py-4 text-gray-400 text-sm">Loading activity…</div>
                            ) : logs.length === 0 ? (
                              <div className="text-center py-4 text-gray-400 text-sm">No activity recorded yet.</div>
                            ) : (
                              <div className="space-y-1.5">
                                {logs.map(log => (
                                  <div key={log.id} className="flex items-start gap-3 text-sm">
                                    <span className="text-gray-400 font-mono text-xs whitespace-nowrap pt-0.5 w-32 shrink-0">
                                      {new Date(log.created_at).toLocaleString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {log.status}
                                    </span>
                                    <span className="text-gray-700">{actionLabel(log.action)}</span>
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                      <span className="text-gray-400 text-xs ml-auto shrink-0">
                                        {Object.entries(log.metadata)
                                          .filter(([k]) => !['method', 'source'].includes(k))
                                          .slice(0, 2)
                                          .map(([k, v]) => `${k}: ${v}`)
                                          .join(' · ')}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(activityTotal / 30));
                  return totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, activityPage - 1);
                          setActivityLoading(true);
                          setActivityExpanded({});
                          setActivityUserLogs({});
                          api.get('/admin/activity-log', { params: { page: newPage, limit: 30, search: activitySearch } })
                            .then(({ data }) => { setActivityUsers(data.data || []); setActivityTotal(data.total || 0); setActivityPage(newPage); })
                            .catch(() => toast.error('Failed to load activity log'))
                            .finally(() => setActivityLoading(false));
                        }}
                        disabled={activityPage === 1}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <span className="text-xs text-gray-500">Page {activityPage} of {totalPages} · {activityTotal} users</span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(totalPages, activityPage + 1);
                          setActivityLoading(true);
                          setActivityExpanded({});
                          setActivityUserLogs({});
                          api.get('/admin/activity-log', { params: { page: newPage, limit: 30, search: activitySearch } })
                            .then(({ data }) => { setActivityUsers(data.data || []); setActivityTotal(data.total || 0); setActivityPage(newPage); })
                            .catch(() => toast.error('Failed to load activity log'))
                            .finally(() => setActivityLoading(false));
                        }}
                        disabled={activityPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {tab === 'Audit Log' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Admin Audit Log</h2>
              <p className="text-sm text-gray-500">All administrative actions recorded in the system.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Filter by action…"
                value={auditActionFilter}
                onChange={e => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
              />
              <select
                value={auditStatusFilter}
                onChange={e => setAuditStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <button
                onClick={() => {
                  setAuditLoading(true);
                  const params = { page: auditPage, limit: 50 };
                  if (auditActionFilter) params.action = auditActionFilter;
                  if (auditStatusFilter) params.status = auditStatusFilter;
                  api.get('/admin/audit-logs', { params })
                    .then(({ data }) => { setAuditLogs(data.data || []); setAuditTotal(data.total || 0); })
                    .catch(() => toast.error('Failed to load audit logs'))
                    .finally(() => setAuditLoading(false));
                }}
                className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
              >
                Search
              </button>
            </div>

            {auditLoading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No audit log entries found.</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Time</th>
                        <th className="px-4 py-2.5 text-left">Actor</th>
                        <th className="px-4 py-2.5 text-left">Action</th>
                        <th className="px-4 py-2.5 text-left">Target</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                        <th className="px-4 py-2.5 text-left">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap font-mono text-xs">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-gray-800 font-medium">
                            {log.actor ? log.actor.username : `#${log.actor_user_id}`}
                            <span className="ml-1 text-xs text-gray-400">[{log.actor_role}]</span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 font-mono text-xs">{log.action}</td>
                          <td className="px-4 py-2.5 text-gray-600 text-xs">
                            {log.target_type && <span className="font-medium">{log.target_type}</span>}
                            {log.targetUser && <span className="ml-1">({log.targetUser.username})</span>}
                            {!log.targetUser && log.target_id && <span className="ml-1">#{log.target_id}</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{log.ip_address || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {(() => {
                  const totalPages = Math.max(1, Math.ceil(auditTotal / 50));
                  return totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, auditPage - 1);
                          setAuditPage(newPage);
                          setAuditLoading(true);
                          const params = { page: newPage, limit: 50 };
                          if (auditActionFilter) params.action = auditActionFilter;
                          if (auditStatusFilter) params.status = auditStatusFilter;
                          api.get('/admin/audit-logs', { params })
                            .then(({ data }) => { setAuditLogs(data.data || []); setAuditTotal(data.total || 0); })
                            .catch(() => toast.error('Failed to load audit logs'))
                            .finally(() => setAuditLoading(false));
                        }}
                        disabled={auditPage === 1}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <span className="text-xs text-gray-500">Page {auditPage} of {totalPages} · {auditTotal} entries</span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(totalPages, auditPage + 1);
                          setAuditPage(newPage);
                          setAuditLoading(true);
                          const params = { page: newPage, limit: 50 };
                          if (auditActionFilter) params.action = auditActionFilter;
                          if (auditStatusFilter) params.status = auditStatusFilter;
                          api.get('/admin/audit-logs', { params })
                            .then(({ data }) => { setAuditLogs(data.data || []); setAuditTotal(data.total || 0); })
                            .catch(() => toast.error('Failed to load audit logs'))
                            .finally(() => setAuditLoading(false));
                        }}
                        disabled={auditPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ── ROLES TAB ── */}
        {tab === 'Roles' && (() => {
          const staffRoles = ['admin', 'finance', 'ambassador', 'verificator', 'approval'];
          const staffUsers = users.filter(u => staffRoles.includes(u.role));
          const regularUsers = users.filter(u => u.role === 'user');
          const roleSearchLower = roleSearch.toLowerCase();
          const searchResults = roleSearch.length >= 2
            ? regularUsers.filter(u =>
                u.username?.toLowerCase().includes(roleSearchLower) ||
                u.phone?.includes(roleSearch)
              ).slice(0, 10)
            : [];

          return (
            <div className="space-y-6">
              {/* Current Staff */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" /> Current Staff ({staffUsers.length})
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">All users with an admin role. Click Remove to demote back to regular user.</p>
                </div>
                {staffUsers.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No staff assigned yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {staffUsers.map(u => (
                      <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">{u.username}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                              {ASSIGNABLE_ROLES.find(r => r.value === u.role)?.label || u.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{u.phone}</p>
                          {u.role === 'ambassador' && (u.ambassador_region || u.ambassador_sector) && (
                            <p className="text-xs text-purple-600 mt-0.5">{[u.ambassador_sector, u.ambassador_region].filter(Boolean).join(', ')}</p>
                          )}
                        </div>
                        <button onClick={() => handleRemoveRole(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg whitespace-nowrap shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Role */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Assign Role to User
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Search a regular user by username or phone, then assign them an admin role.</p>
                </div>
                <div className="p-6 space-y-4">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search user by username or phone…"
                      value={roleSearch}
                      onChange={e => { setRoleSearch(e.target.value); setRoleAssignTarget(null); }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Search results */}
                  {roleSearch.length >= 2 && !roleAssignTarget && (
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      {searchResults.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No matching regular users found.</p>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {searchResults.map(u => (
                            <button key={u.id} onClick={() => { setRoleAssignTarget(u); setRoleSearch(u.username); }}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-50 text-left transition-colors">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{u.username}</p>
                                <p className="text-xs text-gray-400">{u.phone}</p>
                              </div>
                              <span className="text-xs text-purple-600 font-medium">Select →</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected user + role picker */}
                  {roleAssignTarget && (
                    <div className="space-y-4 border border-purple-100 bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{roleAssignTarget.username}</p>
                          <p className="text-xs text-gray-500">{roleAssignTarget.phone}</p>
                        </div>
                        <button onClick={() => { setRoleAssignTarget(null); setRoleSearch(''); }}
                          className="p-1 rounded-full hover:bg-purple-100 text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Role selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Assign Role</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ASSIGNABLE_ROLES.map(r => (
                            <button key={r.value} onClick={() => setRoleAssignForm(f => ({ ...f, role: r.value }))}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                roleAssignForm.role === r.value
                                  ? 'border-purple-500 bg-purple-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                              }`}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ambassador fields */}
                      {roleAssignForm.role === 'ambassador' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                            <input
                              type="text"
                              placeholder="e.g. Western Area"
                              value={roleAssignForm.ambassador_region}
                              onChange={e => setRoleAssignForm(f => ({ ...f, ambassador_region: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sector</label>
                            <input
                              type="text"
                              placeholder="e.g. Freetown Central"
                              value={roleAssignForm.ambassador_sector}
                              onChange={e => setRoleAssignForm(f => ({ ...f, ambassador_sector: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        </div>
                      )}

                      <button onClick={handleAssignRole} disabled={roleAssigning}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
                        {roleAssigning ? 'Assigning…' : `Assign ${ASSIGNABLE_ROLES.find(r => r.value === roleAssignForm.role)?.label || roleAssignForm.role} role to ${roleAssignTarget.username}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Role summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {ASSIGNABLE_ROLES.map(r => {
                  const count = users.filter(u => u.role === r.value).length;
                  return (
                    <div key={r.value} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500 mt-1">{r.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ── ADD TESTIMONIAL MODAL ── */}
      {showAddTestimonialModal && (
        <Modal title="Add Testimonial Entry" onClose={() => setShowAddTestimonialModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={testimonialForm.name} onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" placeholder="e.g. Mohamed Bangura" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select value={testimonialForm.country} onChange={e => {
                  const meta = getTestimonialCountry(e.target.value);
                  setTestimonialForm(f => ({ ...f, country: meta.country, flag: meta.flag }));
                }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400">
                  {TESTIMONIAL_COUNTRIES.map(country => (
                    <option key={country.country} value={country.country}>
                      {country.flag} {country.country} ({country.currency_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Flag emoji</label>
                <input type="text" value={testimonialForm.flag} onChange={e => setTestimonialForm(f => ({ ...f, flag: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" placeholder="🇸🇱" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" value={testimonialForm.phone} onChange={e => setTestimonialForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" placeholder="+232 76 234567" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={testimonialForm.type} onChange={e => setTestimonialForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400">
                  <option value="withdrawal">Withdrawal (cashed out)</option>
                  <option value="deposit">Deposit</option>
                  <option value="earning">Daily Earning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount received ({selectedTestimonialCountry.currency_code})</label>
                <input type="number" value={testimonialForm.amount_nsl} onChange={e => setTestimonialForm(f => ({ ...f, amount_nsl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" placeholder={`${selectedTestimonialCountry.currency_symbol} amount`} />
              </div>
            </div>
            <button disabled={testimonialSaving || !testimonialForm.name || !testimonialForm.country || !testimonialForm.phone || !testimonialForm.amount_nsl}
              onClick={async () => {
                setTestimonialSaving(true);
                try {
                  const { data } = await api.post('/testimonials', testimonialForm);
                  setTestimonials(prev => [...prev, data.testimonial]);
                  setShowAddTestimonialModal(false);
                  toast.success('Testimonial added');
                } catch { toast.error('Failed to add'); }
                finally { setTestimonialSaving(false); }
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg">
              {testimonialSaving ? 'Saving…' : 'Add Testimonial'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── ADD VIP MODAL ── */}
      {showAddVIPModal && (
        <Modal title={`Add New VIP Plan`} onClose={() => setShowAddVIPModal(false)}>
          <VIPForm form={vipForm} setForm={setVipForm} nameEditable onSave={saveNewVIP} onCancel={() => setShowAddVIPModal(false)} saving={vipSaving} nslRate={NSL_RATE} />
        </Modal>
      )}

      {/* ── EDIT VIP MODAL ── */}
      {showEditVIPModal && editingProduct && (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setShowEditVIPModal(false)}>
          <VIPForm form={vipForm} setForm={setVipForm} nameEditable={false} onSave={saveEditVIP} onCancel={() => setShowEditVIPModal(false)} saving={vipSaving} nslRate={NSL_RATE} />
        </Modal>
      )}

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
                {['user','admin','finance','verificator','approval','ambassador'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {createForm.role === 'ambassador' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Region</label>
                  <input value={createForm.ambassador_region} onChange={e => setCreateForm({...createForm, ambassador_region: e.target.value})}
                    placeholder="e.g. Sierra Leone"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Sector</label>
                  <input value={createForm.ambassador_sector} onChange={e => setCreateForm({...createForm, ambassador_sector: e.target.value})}
                    placeholder="e.g. Western Area"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" required />
                </div>
              </div>
            )}
            <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg">Create User</button>
          </form>
        </Modal>
      )}

      {/* ── EDIT USER MODAL ── */}
      {showEditModal && selectedUser && (
        <Modal title={`Edit: ${esc(selectedUser.username)}`} onClose={() => setShowEditModal(false)}>
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
                {['user','admin','finance','verificator','approval','ambassador','superadmin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {editForm.role === 'ambassador' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Region</label>
                  <input value={editForm.ambassador_region} onChange={e => setEditForm(f => ({...f, ambassador_region: e.target.value}))}
                    placeholder="e.g. Sierra Leone"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Sector</label>
                  <input value={editForm.ambassador_sector} onChange={e => setEditForm(f => ({...f, ambassador_sector: e.target.value}))}
                    placeholder="e.g. Western Area"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400" />
                </div>
              </div>
            )}
            <button onClick={async () => {
              const ambassadorChanged = editForm.ambassador_region !== (selectedUser.ambassador_region || '') || editForm.ambassador_sector !== (selectedUser.ambassador_sector || '');
              if (editForm.vip_level !== selectedUser.vip_level) await handleUpdateVIP(selectedUser.id, editForm.vip_level);
              if (editForm.role !== selectedUser.role || ambassadorChanged) await handleUpdateRole(selectedUser.id, editForm.role);
              if (editForm.vip_level === selectedUser.vip_level && editForm.role === selectedUser.role && !ambassadorChanged) toast('No changes to save');
            }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* ── BALANCE MODAL ── */}
      {showBalanceModal && selectedUser && (
        <Modal title={`Money: ${esc(selectedUser.username)}`} onClose={() => setShowBalanceModal(false)}>
          <form onSubmit={handleAdjustBalance} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-black">
              <div className="font-semibold">Current balance</div>
              <div className="mt-1 grid grid-cols-2 gap-2 font-mono">
                <span>{parseFloat(selectedUser.balance_NSL || 0).toLocaleString()} NSL</span>
                <span>{parseFloat(selectedUser.balance_usdt || 0).toLocaleString()} USDT</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Action</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['add', 'Add Money'],
                  ['deduct', 'Deduct Money']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBalanceForm({ ...balanceForm, action: value })}
                    className={`py-2 rounded-lg border text-sm font-semibold ${balanceForm.action === value ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-black hover:bg-gray-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Currency</label>
              <select
                value={balanceForm.currency}
                onChange={e => setBalanceForm({ ...balanceForm, currency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400"
                required
              >
                <option value="NSL">NSL</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Amount</label>
              <input
                type="number"
                min="0"
                step={balanceForm.currency === 'USDT' ? '0.0001' : '0.01'}
                value={balanceForm.amount}
                onChange={e => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400"
                required
              />
              {balanceForm.currency === 'NSL' && balanceForm.amount && (
                <p className="mt-1 text-xs text-black">Approx. {(parseFloat(balanceForm.amount || 0) / NSL_RATE).toFixed(4)} USDT at 1 USDT = {NSL_RATE} NSL</p>
              )}
              {balanceForm.currency === 'USDT' && balanceForm.amount && (
                <p className="mt-1 text-xs text-black">Approx. {(parseFloat(balanceForm.amount || 0) * NSL_RATE).toLocaleString()} NSL at 1 USDT = {NSL_RATE} NSL</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Reason</label>
              <textarea value={balanceForm.reason} onChange={e => setBalanceForm({...balanceForm, reason: e.target.value})}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:border-purple-400 resize-none" required minLength={5} />
            </div>
            <button type="submit" className={`w-full py-2.5 text-white font-semibold rounded-lg ${balanceForm.action === 'deduct' ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
              {balanceForm.action === 'deduct' ? 'Deduct Money' : 'Add Money'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── PASSWORD RESET MODAL ── */}
      {showPasswordModal && selectedUser && (
        <Modal title={`Reset Password: ${esc(selectedUser.username)}`} onClose={() => setShowPasswordModal(false)}>
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

      {/* ── CHANGE PHONE MODAL ── */}
      {showPhoneModal && selectedUser && (
        <Modal title={`Change Phone: ${esc(selectedUser.username)}`} onClose={() => setShowPhoneModal(false)}>
          <form onSubmit={handleChangePhone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current phone</label>
              <p className="text-gray-900 text-sm font-mono">{selectedUser.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New phone number</label>
              <input type="tel" value={phoneForm.phone} onChange={e => setPhoneForm({ phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 font-mono" required placeholder="+232XXXXXXXX" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">Update Phone Number</button>
          </form>
        </Modal>
      )}

      {/* ── SPECIAL MESSAGE MODAL ── */}
      {showMessageModal && selectedUser && (
        <Modal title={`Message: ${esc(selectedUser.username)}`} onClose={() => setShowMessageModal(false)}>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800">
              <span className="font-semibold">Recipient:</span> {selectedUser.phone || selectedUser.username}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={messageForm.title}
                onChange={e => setMessageForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                placeholder="Account update"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows={4}
                value={messageForm.message}
                onChange={e => setMessageForm(f => ({ ...f, message: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
                placeholder="Write the message for this user"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={messageForm.priority}
                onChange={e => setMessageForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={messageSaving || !messageForm.title.trim() || !messageForm.message.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg"
            >
              {messageSaving ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── DEPOSIT REVIEW MODAL ── */}
      {showDepositModal && selectedDeposit && (() => {
        const isMobile = selectedDeposit._type === 'mobile';
        const notes = selectedDeposit._notes || {};
        const resolveUrl = (raw) => raw ? backendAssetUrl(raw) : null;
        const screenshotUrl = isMobile
          ? resolveUrl(selectedDeposit.payment_proof)
          : resolveUrl(selectedDeposit.receipt_image);
        const isAfricell = selectedDeposit.payment_method === 'africell';
        return (
          <Modal title={isMobile ? `Review ${isAfricell ? 'Africell' : 'Orange Money'} Deposit` : 'Review Crypto Deposit'} onClose={() => setShowDepositModal(false)}>
            <div className="space-y-4">
              {/* Receipt / Screenshot image */}
              {screenshotUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-900 px-3 py-1.5 border-b border-gray-100 font-medium">Receipt Screenshot</p>
                  <img src={screenshotUrl} alt="Receipt" className="w-full max-h-56 object-contain p-2" />
                  <a href={screenshotUrl} target="_blank" rel="noopener noreferrer"
                    className="block text-center text-xs text-blue-600 hover:text-blue-800 py-1.5 border-t border-gray-100">
                    Open full size ↗
                  </a>
                </div>
              )}

              {/* Deposit details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-900">User</span><span className="font-medium">{selectedDeposit.user?.username}</span></div>
                {selectedDeposit.user?.phone && <div className="flex justify-between"><span className="text-gray-900">Phone</span><span className="font-mono text-xs">{selectedDeposit.user.phone}</span></div>}
                {selectedDeposit.user?.balance_NSL !== undefined && <div className="flex justify-between"><span className="text-gray-900">Current Balance</span><span className="font-mono">{parseFloat(selectedDeposit.user.balance_NSL).toLocaleString()} NSL</span></div>}
                {isMobile ? (
                  <>
                    <div className="flex justify-between"><span className="text-gray-900">Amount</span><span className="font-mono font-bold text-gray-900">{parseFloat(selectedDeposit.amount_NSL).toLocaleString()} NSL</span></div>
                    {notes.amount_SLE && <div className="flex justify-between"><span className="text-gray-900">NSL Sent</span><span className="font-mono">{parseInt(notes.amount_SLE).toLocaleString()} NSL</span></div>}
                    {selectedDeposit.reference_id && <div className="flex justify-between"><span className="text-gray-900">Reference</span><span className="font-mono text-xs">{selectedDeposit.reference_id}</span></div>}
                    {notes.sender_number && <div className="flex justify-between"><span className="text-gray-900">Sender</span><span className="font-mono">{notes.sender_number}</span></div>}
                    {notes.receiver_number && <div className="flex justify-between"><span className="text-gray-900">Receiver</span><span className="font-mono">{notes.receiver_number}</span></div>}
                    {notes.timestamp_receipt && <div className="flex justify-between"><span className="text-gray-900">Time on Receipt</span><span className="text-xs">{notes.timestamp_receipt}</span></div>}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><span className="text-gray-900">Submitted</span><span className="font-mono font-medium">${parseFloat(selectedDeposit.user_submitted_amount).toFixed(2)} USDT</span></div>
                    {selectedDeposit.user_submitted_txid && <div className="flex justify-between"><span className="text-gray-900">TxID</span><span className="font-mono text-xs truncate max-w-[180px]">{selectedDeposit.user_submitted_txid}</span></div>}
                    {selectedDeposit.user_notes && <div className="flex justify-between"><span className="text-gray-900">Notes</span><span>{selectedDeposit.user_notes}</span></div>}
                  </>
                )}
              </div>

              {/* ── Reference Code Verification (mobile only) ── */}
              {isMobile && (() => {
                const userRef = (selectedDeposit.reference_id || '').trim().toLowerCase();
                const adminRef = (depositAction.admin_reference || '').trim().toLowerCase();
                const hasAdminRef = adminRef.length > 0;
                const matches = hasAdminRef && userRef && adminRef === userRef;
                const mismatch = hasAdminRef && userRef && adminRef !== userRef;
                return (
                  <div className={`rounded-xl p-4 space-y-3 border-2 ${matches ? 'border-green-400 bg-green-50' : mismatch ? 'border-red-400 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold ${matches ? 'bg-green-500' : mismatch ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {matches ? '✓' : mismatch ? '✗' : '!'}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${matches ? 'text-green-800' : mismatch ? 'text-red-800' : 'text-blue-800'}`}>
                          {matches ? 'Reference Code Verified ✓' : mismatch ? 'Reference Code Mismatch!' : 'Verify Reference Code'}
                        </p>
                        <p className={`text-xs mt-0.5 ${matches ? 'text-green-600' : mismatch ? 'text-red-600' : 'text-blue-600'}`}>
                          {matches
                            ? 'The code you received on your phone matches the user\'s receipt.'
                            : mismatch
                            ? 'The code does not match. Do NOT approve unless you have confirmed this manually.'
                            : 'Enter the reference code you received via SMS on your phone to verify this payment.'}
                        </p>
                      </div>
                    </div>
                    {userRef && (
                      <div className="bg-white rounded-lg px-3 py-2 text-xs font-mono text-gray-600 border border-gray-200">
                        <span className="text-gray-900">User submitted: </span>{selectedDeposit.reference_id}
                      </div>
                    )}
                    <input
                      type="text"
                      value={depositAction.admin_reference}
                      onChange={e => setDepositAction({...depositAction, admin_reference: e.target.value})}
                      placeholder="Paste the reference code from your SMS"
                      className={`w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none border-2 ${matches ? 'border-green-400 bg-green-50' : mismatch ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-white focus:border-blue-500'}`}
                    />
                  </div>
                );
              })()}

              {/* Approve amount field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isMobile ? 'Verified NSL Amount (from receipt)' : 'Verified USDT Amount (from receipt)'}
                </label>
                <input type="number" step={isMobile ? '1' : '0.01'} value={depositAction.approved_amount}
                  onChange={e => setDepositAction({...depositAction, approved_amount: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                <p className="text-xs text-gray-900 mt-1">
                  {isMobile
                    ? `= ${((parseFloat(depositAction.approved_amount) || 0) * (1 - RECHARGE_FEE_PCT / 100)).toFixed(0)} NSL credited after ${RECHARGE_FEE_PCT}% fee`
                    : `= ${((parseFloat(depositAction.approved_amount) || 0) * NSL_RATE * (1 - RECHARGE_FEE_PCT / 100)).toFixed(0)} NSL credited after ${RECHARGE_FEE_PCT}% fee`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes (optional)</label>
                <input type="text" value={depositAction.notes} onChange={e => setDepositAction({...depositAction, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
              </div>

              {/* Approve button — blocked if mobile and reference mismatch */}
              {isMobile && (() => {
                const userRef = (selectedDeposit.reference_id || '').trim().toLowerCase();
                const adminRef = (depositAction.admin_reference || '').trim().toLowerCase();
                const mismatch = adminRef.length > 0 && userRef && adminRef !== userRef;
                return (
                  <>
                    {mismatch && (
                      <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700 font-medium">
                        Reference code mismatch — payment cannot be approved. Ask the user to resubmit or verify manually before overriding.
                      </div>
                    )}
                    <button onClick={approveDeposit} disabled={mismatch}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve & Credit Balance
                    </button>
                  </>
                );
              })()}
              {!isMobile && (
                <button onClick={approveDeposit} className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Approve & Credit Balance
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-900">or reject</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-red-600">Rejection Reason <span className="text-red-400">(required)</span></label>
                <textarea rows={2} value={depositAction.reason} onChange={e => setDepositAction({...depositAction, reason: e.target.value})}
                  placeholder="e.g. Reference ID not found, amount mismatch, duplicate submission..."
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>
              <button onClick={rejectDeposit} className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject & Notify User
              </button>
            </div>
          </Modal>
        );
      })()}

      {/* ── KYC REJECT MODAL ── */}
      {showKYCModal && selectedKYCUser && (
        <Modal title={`Reject KYC: ${esc(selectedKYCUser.username)}`} onClose={() => setShowKYCModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-900">User</span><span className="font-medium">{selectedKYCUser.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-900">Phone</span><span>{selectedKYCUser.phone}</span></div>
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

      {/* ── WITHDRAWAL REVIEW MODAL ── */}
      {showWithdrawalModal && selectedWithdrawal && (() => {
        const w = selectedWithdrawal;
        const isCrypto = !w.payment_method || (w.payment_method !== 'orange_money' && w.payment_method !== 'africell');
        const isAfricell = w.payment_method === 'africell';
        const methodLabel = isCrypto ? 'Crypto (USDT)' : isAfricell ? 'Africell' : 'Orange Money';
        const methodBadge = isCrypto ? 'bg-purple-100 text-purple-700' : isAfricell ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';
        return (
          <Modal title="Review Withdrawal" onClose={() => setShowWithdrawalModal(false)}>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Method</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${methodBadge}`}>{methodLabel}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-900">User</span><span className="font-medium">{w.user?.username || `#${w.user_id}`}</span></div>
                {w.user?.phone && <div className="flex justify-between"><span className="text-gray-900">User Phone</span><span className="font-mono text-xs">{w.user.phone}</span></div>}
                <div className="flex justify-between"><span className="text-gray-900">Amount</span><span className="font-mono">{parseFloat(w.amount_NSL||0).toLocaleString()} NSL</span></div>
                <div className="flex justify-between"><span className="text-gray-900">≈ USDT</span><span className="font-mono">${parseFloat(w.amount_usdt||0).toFixed(2)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-900">{isCrypto ? 'Wallet' : 'Phone'}</span>
                  <span className="font-mono text-xs truncate max-w-[180px]">{w.withdrawal_address}</span>
                </div>
                {w.withdrawal_network && <div className="flex justify-between"><span className="text-gray-900">Network</span><span className="font-medium">{w.withdrawal_network}</span></div>}
                {w.reference_id && <div className="flex justify-between"><span className="text-gray-900">Ref ID</span><span className="font-mono text-xs">{w.reference_id}</span></div>}
                <div className="flex justify-between"><span className="text-gray-900">Submitted</span><span className="text-xs">{new Date(w.createdAt || w.timestamp).toLocaleString()}</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Approval Notes (optional)</label>
                <input type="text" value={withdrawalAction.notes}
                  onChange={e => setWithdrawalAction(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Sent via mobile app"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <button onClick={() => approveWithdrawal(w.id)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve & Process Payout
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-900">or reject</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-red-600">Rejection Reason <span className="text-red-400">(required)</span></label>
                <textarea rows={2} value={withdrawalAction.reason}
                  onChange={e => setWithdrawalAction(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this withdrawal is rejected..."
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>
              <button onClick={() => rejectWithdrawal(w.id)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject & Refund Balance
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function VIPForm({ form, setForm, nameEditable, onSave, onCancel, saving, nslRate }) {
  const price = parseFloat(form.price_NSL) || 0;
  const daily = parseFloat(form.daily_income_NSL) || 0;
  const days = parseInt(form.validity_days) || 7;
  const dailyPct = price > 0 ? ((daily / price) * 100) : 0;
  const totalReturn = daily * days;
  const netProfit = totalReturn - price;
  const isProfitable = netProfit >= 0;

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value) || 0;
    const updates = { price_NSL: e.target.value };
    // Keep same daily % when price changes — only if daily was already set
    if (daily > 0 && price > 0) {
      const currentPct = daily / price;
      updates.daily_income_NSL = Math.round(newPrice * currentPct);
    }
    setForm(f => ({ ...f, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">VIP Name</label>
        <input value={form.name} disabled={!nameEditable}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-purple-700 focus:outline-none focus:border-purple-400 disabled:bg-gray-50 disabled:text-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (NSL)</label>
          <input type="number" value={form.price_NSL} onChange={handlePriceChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
          <p className="text-xs text-gray-900 mt-0.5">${(price / nslRate).toFixed(2)} USDT</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Income (NSL)</label>
          <input type="number" value={form.daily_income_NSL} onChange={e => setForm(f => ({ ...f, daily_income_NSL: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
          <p className="text-xs text-gray-900 mt-0.5">{dailyPct.toFixed(2)}% of price/day</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Review Reward (NSL)</label>
        <input type="number" value={form.tax_income_NSL} onChange={e => setForm(f => ({ ...f, tax_income_NSL: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
        <p className="text-xs text-gray-900 mt-0.5">NSL earned per completed daily review</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
        <input type="number" value={form.validity_days} onChange={e => setForm(f => ({ ...f, validity_days: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
        <p className="text-xs text-gray-900 mt-0.5">User earns {daily > 0 ? `${daily.toLocaleString()} NSL × ${days} days = ${totalReturn.toLocaleString()} NSL` : '—'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none" />
      </div>
      {!nameEditable && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
          <div>
            <p className="text-sm font-medium text-gray-700">Plan Status</p>
            <p className="text-xs text-gray-900">{form.active ? 'Visible and purchasable by users' : 'Hidden from users'}</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}
      {price > 0 && daily > 0 && (
        <div className={`border rounded-xl p-4 space-y-2 text-sm ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Return ({days}d)</span>
            <span className="font-bold text-blue-700 font-mono">{totalReturn.toLocaleString()} NSL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Investment</span>
            <span className="font-mono text-gray-700">− {price.toLocaleString()} NSL</span>
          </div>
          <div className={`flex justify-between items-center pt-1 border-t ${isProfitable ? 'border-green-200' : 'border-red-200'}`}>
            <span className="font-semibold text-gray-800">Net Profit</span>
            <span className={`font-bold text-base font-mono ${isProfitable ? 'text-green-700' : 'text-red-600'}`}>
              {isProfitable ? '+' : ''}{netProfit.toLocaleString()} NSL
            </span>
          </div>
          {!isProfitable && (
            <p className="text-xs text-red-500 pt-1">Plan duration is shorter than break-even ({Math.ceil(price/daily)} days needed). Increase duration or daily income.</p>
          )}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.name || !form.price_NSL || !form.daily_income_NSL}
          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
          {saving ? 'Saving…' : 'Save VIP Plan'}
        </button>
      </div>
    </div>
  );
}
