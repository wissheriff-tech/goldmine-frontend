'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

export default function Withdraw() {
  const { user } = useAuth();
  const [amount_NSL, setAmount_NSL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBalance();
  }, [user, router]);

  const fetchBalance = async () => {
    try {
      const { data } = await api.get('/user/dashboard');
      setBalance(data.user.balance_NSL);
    } catch (error) {
      toast.error('Failed to fetch balance');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!amount_NSL || parseFloat(amount_NSL) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount_NSL) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/user/withdraw', { amount_NSL: parseFloat(amount_NSL) });
      toast.success(data.message);
      setAmount_NSL('');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const USDT_TO_NSL = 6;
  const amount_usdt = (parseFloat(amount_NSL) / USDT_TO_NSL).toFixed(2);

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-md mx-auto px-4">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">{balance.toFixed(2)} NSL</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (NSL)
              </label>
              <input
                type="number"
                value={amount_NSL}
                onChange={(e) => setAmount_NSL(e.target.value)}
                placeholder="Enter amount in NSL"
                className="form-input"
                step="0.01"
                min="0"
                max={balance}
                required
              />
            </div>

            {amount_NSL && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-lg font-bold">
                  {amount_NSL} NSL = {amount_usdt} USDT
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Rate: 1 NSL = 1/6 USDT (Withdrawal)
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ A Finance Admin must approve this withdrawal before it is processed.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !amount_NSL || parseFloat(amount_NSL) > balance}
              className="btn-primary w-full"
            >
              {isLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Withdrawal Process</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>You submit withdrawal request</li>
              <li>Finance Admin reviews your request</li>
              <li>If approved, funds are sent to Binance</li>
              <li>You receive the funds to your wallet</li>
            </ol>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
