'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, User, Wallet, Shield, AlertTriangle } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function AdminVerificationPanel() {
  const { user } = useAuthStore();
  const [pendingWallets, setPendingWallets] = useState([]);
  const [pendingAddresses, setPendingAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const canView = ['finance', 'superadmin'].includes(user?.role);

  useEffect(() => {
    if (canView) {
      fetchPendingVerifications();
    }
  }, [canView]);

  const fetchPendingVerifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/binance/wallet/pending');
      setPendingWallets(response.data.pendingWallets || []);
      setPendingAddresses(response.data.pendingAddresses || []);
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyWallet = async (userId, approved) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admin can verify wallets');
      return;
    }

    if (!approved && !rejectReason) {
      setRejectTarget({ type: 'wallet', userId });
      setShowRejectModal(true);
      return;
    }

    try {
      setProcessingId(userId);
      await api.post(`/binance/wallet/verify/${userId}`, {
        approved,
        reason: rejectReason || undefined
      });

      toast.success(`Wallet ${approved ? 'verified' : 'rejected'} successfully`);
      setRejectReason('');
      setShowRejectModal(false);
      setRejectTarget(null);
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyAddress = async (userId, addressId, approved) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admin can verify addresses');
      return;
    }

    if (!approved && !rejectReason) {
      setRejectTarget({ type: 'address', userId, addressId });
      setShowRejectModal(true);
      return;
    }

    try {
      setProcessingId(`${userId}-${addressId}`);
      await api.post(`/binance/wallet/verify-address/${userId}/${addressId}`, {
        approved,
        reason: rejectReason || undefined
      });

      toast.success(`Address ${approved ? 'verified' : 'rejected'} successfully`);
      setRejectReason('');
      setShowRejectModal(false);
      setRejectTarget(null);
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmReject = () => {
    if (rejectTarget.type === 'wallet') {
      handleVerifyWallet(rejectTarget.userId, false);
    } else if (rejectTarget.type === 'address') {
      handleVerifyAddress(rejectTarget.userId, rejectTarget.addressId, false);
    }
  };

  if (!canView) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only Finance Admin and Super Admin can view this panel</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectTarget(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Wallets */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pending Wallet Verifications</h2>
            <p className="text-sm text-gray-600">
              {pendingWallets.length} wallet{pendingWallets.length !== 1 ? 's' : ''} awaiting verification
            </p>
          </div>
        </div>

        {pendingWallets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No pending wallet verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingWallets.map((wallet) => (
              <div key={wallet._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{wallet.username}</p>
                        <p className="text-sm text-gray-600">{wallet.phone}</p>
                        {wallet.email && (
                          <p className="text-sm text-gray-600">{wallet.email}</p>
                        )}
                      </div>
                    </div>

                    {wallet.binance_account_id && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Binance Account ID</p>
                        <p className="font-mono text-sm text-gray-800">{wallet.binance_account_id}</p>
                      </div>
                    )}

                    {wallet.binance_wallet_address && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Wallet Address</p>
                        <p className="font-mono text-sm text-gray-800 break-all">{wallet.binance_wallet_address}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Submitted on {new Date(wallet.created_at).toLocaleString()}
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleVerifyWallet(wallet._id, true)}
                        disabled={processingId === wallet._id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        {processingId === wallet._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerifyWallet(wallet._id, false)}
                        disabled={processingId === wallet._id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Withdrawal Addresses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pending Withdrawal Addresses</h2>
            <p className="text-sm text-gray-600">
              {pendingAddresses.length} address{pendingAddresses.length !== 1 ? 'es' : ''} awaiting verification
            </p>
          </div>
        </div>

        {pendingAddresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No pending address verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAddresses.map((addr) => (
              <div key={addr._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-gray-800">{addr.username}</p>
                    </div>

                    {addr.label && (
                      <p className="font-semibold text-gray-700 mb-2">{addr.label}</p>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        {addr.currency}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                        {addr.network}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="font-mono text-sm text-gray-800 break-all">{addr.address}</p>
                    </div>

                    <p className="text-xs text-gray-500">
                      Added on {new Date(addr.added_at).toLocaleString()}
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleVerifyAddress(addr.userId, addr._id, true)}
                        disabled={processingId === `${addr.userId}-${addr._id}`}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        {processingId === `${addr.userId}-${addr._id}` ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerifyAddress(addr.userId, addr._id, false)}
                        disabled={processingId === `${addr.userId}-${addr._id}`}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You can view pending verifications, but only Super Admin can approve or reject them.
          </p>
        </div>
      )}
    </div>
  );
}
