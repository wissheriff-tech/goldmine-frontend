'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
// --- MODIFIED: Added RefreshCw to imports ---
import { Users, DollarSign, Trash2, Edit, Plus, Shield, Eye, X, Key, Search, List, RefreshCw } from 'lucide-react';

export default function AdminPanel() {
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const router = useRouter();

  // Form states
  const [createForm, setCreateForm] = useState({
    username: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active'
  });

  const [balanceForm, setBalanceForm] = useState({
    balance_NSL: 0,
    balance_usdt: 0,
    reason: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: ''
  });

  const CONVERSION_RATE = 25; // 1 USDT = 25 NSL

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'superadmin') {
      toast.error('Access denied. Super admin only.');
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users?limit=100');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', createForm);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      setCreateForm({ username: '', phone: '', password: '', role: 'user', status: 'active' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId, phone) => {
    if (!confirm(`Are you sure you want to delete user ${phone}?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateVIP = async (userId, vipLevel) => {
    try {
      await api.patch(`/admin/users/${userId}/vip`, { vip_level: vipLevel });
      toast.success('VIP level updated successfully!');
      fetchUsers();
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update VIP level');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully!');
      fetchUsers();
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${selectedUser._id}/balance`, balanceForm);
      toast.success('Balance updated successfully!');
      setShowBalanceModal(false);
      setBalanceForm({ balance_NSL: 0, balance_usdt: 0, reason: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setBalanceForm({
      balance_NSL: user.balance_NSL,
      balance_usdt: user.balance_usdt,
      reason: ''
    });
    setShowBalanceModal(true);
  };

  const handleNSLChange = (value) => {
    const nsl = parseFloat(value) || 0;
    const usdt = (nsl / CONVERSION_RATE).toFixed(2);
    setBalanceForm({
      ...balanceForm,
      balance_NSL: nsl,
      balance_usdt: parseFloat(usdt)
    });
  };

  const handleUSDTChange = (value) => {
    const usdt = parseFloat(value) || 0;
    const nsl = (usdt * CONVERSION_RATE).toFixed(2);
    setBalanceForm({
      ...balanceForm,
      balance_usdt: usdt,
      balance_NSL: parseFloat(nsl)
    });
  };

  const openPasswordModal = (userObj) => {
    setSelectedUser(userObj);
    setPasswordForm({ new_password: '', confirm_password: '' });
    setShowPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match!');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    try {
      await api.patch(`/admin/users/${selectedUser._id}/reset-password`, {
        new_password: passwordForm.new_password
      });
      toast.success('Password reset successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = users.filter(u =>
      u.username?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query)
    );

    setFilteredUsers(results);

    if (results.length === 0) {
      toast.error('No users found matching your search');
    } else {
      toast.success(`Found ${results.length} user(s)`);
    }
  };

  const handleToggleSearchMode = () => {
    setSearchMode(!searchMode);
    setSearchQuery('');
    setFilteredUsers([]);
  };

  // --- MODIFIED: Added handleResetLimits function ---
  const handleResetLimits = async () => {
    try {
      await api.post('/admin/reset-limits');
      toast.success('Rate limits reset successfully!');
    } catch (error) {
      toast.error('Failed to reset rate limits');
    }
  };
  // --------------------------------------------------

  const displayUsers = searchMode && filteredUsers.length > 0 ? filteredUsers : users;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Super Admin Panel
          </h1>
          <div className="flex gap-4">
            {/* --- MODIFIED: Added Reset Limits Button --- */}
            <button
              onClick={handleResetLimits}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2"
              title="Clear 429 Errors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Limits
            </button>
            {/* ------------------------------------------- */}
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Frozen Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'frozen').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username or phone number..."
                className="form-input flex-1"
                disabled={!searchMode}
              />
              <button
                onClick={handleSearch}
                disabled={!searchMode}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  searchMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            <button
              onClick={handleToggleSearchMode}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                searchMode
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {searchMode ? (
                <>
                  <List className="w-5 h-5" />
                  Show All Users
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Mode
                </>
              )}
            </button>
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New User
          </button>
        </div>

        {/* Users Table */}
        <div className="card overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {searchMode && filteredUsers.length > 0
                ? `Search Results (${filteredUsers.length})`
                : `All Users (${users.length})`}
            </h2>
            {searchMode && filteredUsers.length > 0 && (
              <span className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} total users
              </span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Username</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">VIP Level</th>
                <th className="text-left py-3 px-4">NSL Balance</th>
                <th className="text-left py-3 px-4">USDT Balance</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{u.username}</td>
                  <td className="py-3 px-4">{u.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' :
                      u.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{u.vip_level}</td>
                  <td className="py-3 px-4">{u.balance_NSL?.toFixed(2)}</td>
                  <td className="py-3 px-4">{u.balance_usdt?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openBalanceModal(u)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Adjust Balance"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPasswordModal(u)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(u._id, u.status === 'active' ? 'frozen' : 'active')}
                        className={`p-1 rounded ${
                          u.status === 'active'
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.phone)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New User</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value.toLowerCase()})}
                  className="form-input"
                  placeholder="e.g., makemoney001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  className="form-input"
                  placeholder="+232-00-000-000."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="form-input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                  <option value="verificator">Verificator</option>
                  <option value="approval">Approval</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit User: {selectedUser.phone}</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">VIP Level</label>
                <select
                  defaultValue={selectedUser.vip_level}
                  onChange={(e) => handleUpdateVIP(selectedUser._id, e.target.value)}
                  className="form-input"
                >
                  <option value="none">None</option>
                  <option value="VIP1">VIP1</option>
                  <option value="VIP2">VIP2</option>
                  <option value="VIP3">VIP3</option>
                  <option value="VIP4">VIP4</option>
                  <option value="VIP5">VIP5</option>
                  <option value="VIP6">VIP6</option>
                  <option value="VIP7">VIP7</option>
                  <option value="VIP8">VIP8</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleUpdateRole(selectedUser._id, e.target.value)}
                  className="form-input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                  <option value="verificator">Verificator</option>
                  <option value="approval">Approval</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Adjust Balance: {selectedUser.phone}</h3>
              <button onClick={() => setShowBalanceModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              {/* Live Conversion Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-blue-900 mb-1">💱 Live Conversion Rate:</p>
                <p className="text-blue-800">1 USDT = {CONVERSION_RATE} NSL</p>
                <p className="text-blue-800">{balanceForm.balance_NSL.toFixed(2)} NSL = {balanceForm.balance_usdt.toFixed(2)} USDT</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">NSL Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceForm.balance_NSL}
                  onChange={(e) => handleNSLChange(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">= {balanceForm.balance_usdt.toFixed(2)} USDT</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">USDT Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceForm.balance_usdt}
                  onChange={(e) => handleUSDTChange(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">= {balanceForm.balance_NSL.toFixed(2)} NSL</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={balanceForm.reason}
                  onChange={(e) => setBalanceForm({...balanceForm, reason: e.target.value})}
                  className="form-input"
                  rows="3"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Update Balance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Reset Password</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-900">User Information:</p>
              <p className="text-sm text-purple-800">Username: {selectedUser.username}</p>
              <p className="text-sm text-purple-800">Phone: {selectedUser.phone}</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  className="form-input"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              {passwordForm.new_password && passwordForm.confirm_password &&
               passwordForm.new_password !== passwordForm.confirm_password && (
                <div className="text-red-600 text-sm">
                  ⚠️ Passwords do not match!
                </div>
              )}

              {passwordForm.new_password && passwordForm.confirm_password &&
               passwordForm.new_password === passwordForm.confirm_password && (
                <div className="text-green-600 text-sm">
                  ✅ Passwords match!
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Warning:</strong> This will immediately change the user's password.
                  The user will need to use the new password for their next login.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full bg-purple-600 hover:bg-purple-700"
                disabled={passwordForm.new_password !== passwordForm.confirm_password}
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 