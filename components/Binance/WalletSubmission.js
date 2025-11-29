'use client';

import { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function WalletSubmission({ userWallet, onUpdate }) {
  const [formData, setFormData] = useState({
    binance_account_id: userWallet?.binance_account_id || '',
    wallet_address: userWallet?.binance_wallet_address || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.binance_account_id && !formData.wallet_address) {
      toast.error('Please provide either Binance Account ID or Wallet Address');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/binance/wallet/submit', formData);

      toast.success(response.data.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit wallet information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = userWallet?.binance_wallet_verified;
  const isPending = (userWallet?.binance_account_id || userWallet?.binance_wallet_address) && !isVerified;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Binance Wallet</h2>
          <p className="text-sm text-gray-600">Connect your Binance account for deposits and withdrawals</p>
        </div>
      </div>

      {/* Status Banner */}
      {isVerified && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-semibold">Wallet Verified</p>
            <p className="text-sm text-green-600">
              Your wallet was verified on {new Date(userWallet.binance_wallet_verified_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-semibold">Verification Pending</p>
            <p className="text-sm text-yellow-600">
              Your wallet information is awaiting Super Admin verification
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Binance Account ID (Optional)
          </label>
          <input
            type="text"
            value={formData.binance_account_id}
            onChange={(e) => setFormData({ ...formData, binance_account_id: e.target.value })}
            placeholder="Enter your Binance Account ID"
            disabled={isVerified}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Found in your Binance profile settings
          </p>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address (Optional)
          </label>
          <input
            type="text"
            value={formData.wallet_address}
            onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
            placeholder="0x... or your wallet address"
            disabled={isVerified}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Binance deposit wallet address for receiving funds
          </p>
        </div>

        {!isVerified && (
          <button
            type="submit"
            disabled={isSubmitting || (!formData.binance_account_id && !formData.wallet_address)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                {isPending ? 'Update Wallet Information' : 'Submit for Verification'}
              </>
            )}
          </button>
        )}
      </form>

      {/* Current Wallet Info */}
      {(userWallet?.binance_account_id || userWallet?.binance_wallet_address) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Wallet Information</h3>

          {userWallet.binance_account_id && (
            <div className="mb-2">
              <p className="text-xs text-gray-600">Binance Account ID</p>
              <p className="font-mono text-sm text-gray-800">{userWallet.binance_account_id}</p>
            </div>
          )}

          {userWallet.binance_wallet_address && (
            <div>
              <p className="text-xs text-gray-600">Wallet Address</p>
              <p className="font-mono text-sm text-gray-800 break-all">{userWallet.binance_wallet_address}</p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How to find your information:</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Login to your Binance account</li>
          <li>Go to Profile → Dashboard</li>
          <li>Your Account ID is displayed at the top</li>
          <li>For wallet address: Go to Wallet → Spot → Deposit</li>
        </ul>
      </div>
    </div>
  );
}
