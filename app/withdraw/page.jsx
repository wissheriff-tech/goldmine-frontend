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
const SLL_PER_NSL = parseFloat(process.env.NEXT_PUBLIC_ORANGE_SLL_PER_NSL || 100);
const FEE_PCT = 10;

export default function Withdraw() {
  const { user, isInitializing } = useAuthStore();
  const [method, setMethod] = useState('crypto');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Crypto form state
  const [amount_NSL, setAmount_NSL] = useState('');
  const [address, setAddress]       = useState('');
  const [network, setNetwork]       = useState('TRC20');

  // Orange Money form state
  const [omAmount, setOmAmount] = useState('');
  const [omPhone, setOmPhone]   = useState('');

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    api.get('/user/dashboard').then(({ data }) => setBalance(data.user?.balance_NSL || 0)).catch(() => {});
  }, [user?.id, isInitializing, router]);

  // ── Crypto withdraw ────────────────────────────────────────────────────────
  const amt  = parseFloat(amount_NSL) || 0;
  const fee  = parseFloat((amt * FEE_PCT / 100).toFixed(4));
  const net  = parseFloat((amt - fee).toFixed(4));
  const usdt = (net / NSL_TO_USDT).toFixed(2);

  const handleCryptoWithdraw = async (e) => {
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
      setAmount_NSL(''); setAddress('');
      setTimeout(() => router.push('/transactions'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Orange Money withdraw ──────────────────────────────────────────────────
  const omNsl  = parseFloat(omAmount) || 0;
  const omFee  = parseFloat((omNsl * FEE_PCT / 100).toFixed(4));
  const omNet  = parseFloat((omNsl - omFee).toFixed(4));
  const omSLL  = Math.round(omNet * SLL_PER_NSL);

  const handleOmWithdraw = async (e) => {
    e.preventDefault();
    if (omNsl < 100) return toast.error('Minimum withdrawal is 100 NSL');
    if (omNsl > balance) return toast.error('Insufficient balance');
    if (!omPhone.trim()) return toast.error('Phone number is required');

    setIsLoading(true);
    try {
      const { data } = await api.post('/orange-money/withdraw', {
        amount_NSL: omNsl,
        phone: omPhone.trim(),
      });
      toast.success(data.message || 'Withdrawal submitted!');
      setOmAmount(''); setOmPhone('');
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

            {/* Header */}
            <div>
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm mb-3">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-gray-500 text-sm mt-1">Funds sent after admin approval</p>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-purple-700">{parseFloat(balance).toLocaleString()} NSL</p>
              <p className="text-xs text-gray-400 mt-1">${(balance / NSL_TO_USDT).toFixed(2)} USDT</p>
            </div>

            {/* Method switcher */}
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setMethod('crypto')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === 'crypto' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Crypto Wallet
              </button>
              <button onClick={() => setMethod('orange')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${method === 'orange' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                Orange Money
              </button>
            </div>

            {/* ── Crypto form ── */}
            {method === 'crypto' && (
              <form onSubmit={handleCryptoWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NSL)</label>
                  <input id="amount_NSL" name="amount_NSL" type="number" min="100" step="0.01" max={balance}
                    value={amount_NSL} onChange={e => setAmount_NSL(e.target.value)}
                    placeholder="Min 100 NSL"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-sm"
                    required />
                </div>

                {amt >= 100 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-1.5">
                    <div className="flex justify-between text-gray-600"><span>Withdrawal amount</span><span className="font-mono">{amt.toLocaleString()} NSL</span></div>
                    <div className="flex justify-between text-red-500"><span>Fee ({FEE_PCT}%)</span><span className="font-mono">−{fee.toLocaleString()} NSL</span></div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-1.5 mt-1.5">
                      <span>You receive</span><span className="font-mono">{net.toLocaleString()} NSL ≈ ${usdt}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                  <input id="withdrawal_address" name="withdrawal_address" type="text"
                    value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Paste your USDT wallet address"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 text-sm font-mono"
                    required />
                </div>

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
            )}

            {/* ── Orange Money form ── */}
            {method === 'orange' && (
              <form onSubmit={handleOmWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NSL)</label>
                  <input type="number" min="100" step="1" max={balance}
                    value={omAmount} onChange={e => setOmAmount(e.target.value)}
                    placeholder="Min 100 NSL"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-sm"
                    required />
                </div>

                {omNsl >= 100 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm space-y-1.5">
                    <div className="flex justify-between text-gray-600"><span>Withdrawal amount</span><span className="font-mono">{omNsl.toLocaleString()} NSL</span></div>
                    <div className="flex justify-between text-red-500"><span>Fee ({FEE_PCT}%)</span><span className="font-mono">−{omFee.toLocaleString()} NSL</span></div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-orange-200 pt-1.5 mt-1.5">
                      <span>You receive</span><span className="font-mono text-orange-600">{omSLL.toLocaleString()} SLL</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orange Money Phone Number</label>
                  <input type="tel"
                    value={omPhone} onChange={e => setOmPhone(e.target.value)}
                    placeholder="+232 XX XXX XXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-sm"
                    required />
                  <p className="text-xs text-gray-400 mt-1">Funds will be sent directly to this Orange Money number.</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                  ⚠️ Verify your Orange Money number carefully. Funds sent to a wrong number cannot be recovered.
                </div>

                <button type="submit" disabled={isLoading || omNsl < 100 || omNsl > balance || !omPhone.trim()}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                  {isLoading ? 'Submitting…' : 'Withdraw via Orange Money'}
                </button>
              </form>
            )}

            {/* Process info */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 font-medium mb-2">Process</p>
              {method === 'crypto' ? (
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Submit withdrawal request</li>
                  <li>Finance admin reviews (within 24h)</li>
                  <li>If approved, USDT sent to your wallet</li>
                </ol>
              ) : (
                <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Submit withdrawal request</li>
                  <li>Balance deducted immediately</li>
                  <li>SLL sent to your Orange Money number (within 24h)</li>
                </ol>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
