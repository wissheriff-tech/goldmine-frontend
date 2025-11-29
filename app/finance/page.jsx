'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Users, DollarSign, CheckCircle, XCircle, Wallet, UserCheck, UserX, Activity, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function FinancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({
    amount_NSL: '',
    amount_usdt: '',
    reason: ''
  });

  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'finance')) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transactions') {
        const { data } = await api.get('/finance/transactions?status=pending');
        setTransactions(data.transactions);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/finance/users');
        setUsers(data.users);
      } else if (activeTab === 'activity' && user.role === 'superadmin') {
        const { data } = await api.get('/finance/activity-log');
        setActivityLog(data.activities);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      await api.patch(`/finance/transactions/${transactionId}/approve`);
      toast.success('Transaction approved successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await api.patch(`/finance/transactions/${transactionId}/reject`, { reason });
      toast.success('Transaction rejected successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/finance/users/${selectedUser._id}/add-currency`, currencyForm);
      toast.success('Currency added successfully!');
      setShowAddCurrencyModal(false);
      setCurrencyForm({ amount_NSL: '', amount_usdt: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add currency');
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt('Enter suspension reason (optional):');
    try {
      await api.patch(`/finance/users/${userId}/suspend`, { reason });
      toast.success('User suspended successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await api.patch(`/finance/users/${userId}/activate`);
      toast.success('User activated successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.patch(`/finance/users/${userId}/approve`);
      toast.success('User approved and activated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const openAddCurrencyModal = (userObj) => {
    setSelectedUser(userObj);
    setShowAddCurrencyModal(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Management</h1>
          <p className="text-gray-600">Manage transactions and user accounts</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Pending Transactions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </div>
          </button>
          {user.role === 'superadmin' && (
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'activity'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Activity Log</span>
              </div>
            </button>
          )}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">No pending transactions</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          transaction.type === 'recharge'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        User: <span className="font-bold">{transaction.user_id?.phone || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount NSL: <span className="font-bold text-blue-600">{transaction.amount_NSL}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount USDT: <span className="font-bold text-green-600">{transaction.amount_usdt}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        User Balance NSL: <span className="font-bold">{transaction.user_id?.balance_NSL}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        User Balance USDT: <span className="font-bold">{transaction.user_id?.balance_usdt}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-gray-600 italic">Note: {transaction.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveTransaction(transaction._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(transaction._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Balance NSL</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Balance USDT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">VIP Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userObj) => (
                    <tr key={userObj._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">{userObj.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium">{userObj.username}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-bold">{userObj.balance_NSL?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-bold">{userObj.balance_usdt?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          userObj.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : userObj.status === 'frozen'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {userObj.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{userObj.vip_level}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openAddCurrencyModal(userObj)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-all flex items-center space-x-1"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>Add Currency</span>
                          </button>
                          {userObj.status === 'active' ? (
                            <button
                              onClick={() => handleSuspendUser(userObj._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-all flex items-center space-x-1"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          ) : userObj.status === 'frozen' ? (
                            <button
                              onClick={() => handleActivateUser(userObj._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-all flex items-center space-x-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Activate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveUser(userObj._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-all flex items-center space-x-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Approve</span>
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

        {/* Activity Log Tab (Superadmin Only) */}
        {activeTab === 'activity' && user.role === 'superadmin' && (
          <div className="space-y-4">
            {activityLog.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">No activity recorded</p>
              </div>
            ) : (
              activityLog.map((activity) => (
                <div key={activity._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activity.type === 'recharge'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {activity.type.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activity.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {activity.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Finance User: <span className="font-bold">{activity.approved_by?.phone || activity.approved_by?.username || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Target User: <span className="font-bold">{activity.user_id?.phone || activity.user_id?.username || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount NSL: <span className="font-bold text-blue-600">{activity.amount_NSL}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount USDT: <span className="font-bold text-green-600">{activity.amount_usdt}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.completed_at).toLocaleString()}
                    </p>
                    {activity.notes && (
                      <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                        Note: {activity.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Currency Modal */}
        {showAddCurrencyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">Add Currency</h3>
                <p className="text-blue-100 text-sm mt-1">
                  User: {selectedUser?.phone} ({selectedUser?.username})
                </p>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleAddCurrency} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount NSL
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currencyForm.amount_NSL}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, amount_NSL: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount USDT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currencyForm.amount_usdt}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, amount_usdt: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={currencyForm.reason}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, reason: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for adding currency..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Current Balance:</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    NSL: <span className="font-bold text-blue-600">{selectedUser?.balance_NSL?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    USDT: <span className="font-bold text-green-600">{selectedUser?.balance_usdt?.toFixed(2)}</span>
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCurrencyModal(false);
                      setCurrencyForm({ amount_NSL: '', amount_usdt: '', reason: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Add Currency
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
