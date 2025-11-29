'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import WalletSubmission from '@/components/Binance/WalletSubmission';
import WithdrawalAddressManager from '@/components/Binance/WithdrawalAddressManager';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

export default function WalletPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [userWallet, setUserWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchWalletData();
    }
  }, [user, loading, router]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/binance/wallet/my-wallet');
      setUserWallet(response.data.wallet);
    } catch (error) {
      toast.error('Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Binance Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your Binance wallet and withdrawal addresses
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Submission */}
          <div>
            <WalletSubmission
              userWallet={userWallet}
              onUpdate={fetchWalletData}
            />
          </div>

          {/* Withdrawal Addresses */}
          <div>
            <WithdrawalAddressManager
              userWallet={userWallet}
              onUpdate={fetchWalletData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
