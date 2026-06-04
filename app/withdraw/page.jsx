'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const NETWORKS = ['TRC20', 'BSC', 'ETH'];
const NSL_TO_USDT = parseFloat(process.env.NEXT_PUBLIC_NSL_TO_USDT || 23);
const FEE_PCT = 10;

export default function Withdraw() {
  const { user, isInitializing } = useAuthStore();
  const [amount_NSL, setAmount_NSL] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    api.get('/user/dashboard').then(({ data }) => setBalance(data.user?.balance_NSL || 0)).catch(() => {});
  }, [user?.id, isInitializing, router]);

  const amt = parseFloat(amount_NSL) || 0;
  const fee = parseFloat((amt * FEE_PCT / 100).toFixed(4));
  const net = parseFloat((amt - fee).toFixed(4));
  const usdt = (net / NSL_TO_USDT).toFixed(2);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (amt < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (amt > balance) return toast.error('Insufficient balance');
    if (!address.trim()) return toast.error('Wallet address is required');

    setIsLoading(true);
    try {
      const { data } = await api.post('/user/withdraw', {
        amount_NSL: amt,
        withdrawal_address: address.trim(),
        withdrawal_network: network,
      });
      toast.success(data.message || 'Withdrawal submitted!');
      setAmount_NSL('');
      setAddress('');
      setTimeout(() => router.push('/transactions'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-gray-500 text-sm mt-1">Funds sent to your wallet within 24h after approval</p>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-purple-700">{parseFloat(balance).toLocaleString()} NSL</p>
              <p className="text-xs text-gray-400 mt-1">${(balance / NSL_TO_USDT).toFixed(2)} USDT</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NSL)</label>
                <input
                  id="amount_NSL" name="amount_NSL"
                  type="number" min="100" step="0.01" max={balance}
                  value={amount_NSL} onChange={e => setAmount_NSL(e.target.value)}
                  placeholder="Min 100 NSL"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-sm"
                  required
                />
              </div>

              {/* Fee preview */}
              {amt >= 100 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-1.5">
                  <div className="flex justify-between text-gray-600"><span>Withdrawal amount</span><span className="font-mono">{amt.toLocaleString()} NSL</span></div>
                  <div className="flex justify-between text-red-500"><span>Fee ({FEE_PCT}%)</span><span className="font-mono">−{fee.toLocaleString()} NSL</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-1.5 mt-1.5">
                    <span>You receive</span>
                    <span className="font-mono">{net.toLocaleString()} NSL ≈ ${usdt}</span>
                  </div>
                </div>
              )}

              {/* Wallet address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                <input
                  id="withdrawal_address" name="withdrawal_address"
                  type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Paste your USDT wallet address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-sm font-mono"
                  required
                />
              </div>

              {/* Network */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <div className="flex gap-2">
                  {NETWORKS.map(n => (
                    <button key={n} type="button" onClick={() => setNetwork(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${network === n ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                ⚠️ Double-check your wallet address and network. Wrong address = permanent loss of funds.
              </div>

              <button type="submit" disabled={isLoading || amt < 100 || amt > balance || !address.trim()}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {isLoading ? 'Submitting…' : 'Request Withdrawal'}
              </button>
            </form>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 font-medium mb-2">Process</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Submit withdrawal request</li>
                <li>Finance admin reviews (within 24h)</li>
                <li>If approved, USDT sent to your wallet</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
