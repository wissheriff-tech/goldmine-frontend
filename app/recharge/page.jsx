'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

export default function Recharge() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Amount, 2: Payment Method, 3: Confirmation
  const [amount_NSL, setAmount_NSL] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('binance');
  const [depositAddress, setDepositAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [txHash, setTxHash] = useState('');

  const NSL_TO_USDT = parseFloat(process.env.NEXT_PUBLIC_NSL_TO_USDT || 25);
  const amount_usdt = (parseFloat(amount_NSL) / NSL_TO_USDT).toFixed(2);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchTransactions();
    }
  }, [user, router]);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/user/transactions?type=recharge&limit=10');
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();

    if (!amount_NSL || parseFloat(amount_NSL) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount_NSL) < 100) {
      toast.error('Minimum recharge amount is 100 NSL');
      return;
    }

    setStep(2);
  };

  const handlePaymentMethodSubmit = async () => {
    if (paymentMethod === 'binance') {
      setIsLoading(true);
      try {
        // Generate deposit address
        const { data } = await api.post('/user/generate-deposit-address', {
          amount_NSL: parseFloat(amount_NSL)
        });

        setDepositAddress(data.address);
        setStep(3);
        toast.success('Deposit address generated!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate deposit address');
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(3);
    }
  };

  const handleRechargeSubmit = async () => {
    setIsLoading(true);

    try {
      const { data } = await api.post('/user/recharge', {
        amount_NSL: parseFloat(amount_NSL),
        payment_method: paymentMethod,
        deposit_address: depositAddress,
        tx_hash: txHash
      });

      toast.success(data.message);
      setAmount_NSL('');
      setTxHash('');
      setStep(1);
      fetchTransactions();
      setShowHistory(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Recharge failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* History Toggle */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Recharge Form */}
          <div className="lg:col-span-2">
            <div className="card animate-fadeIn">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-800">Recharge Account</h1>
                  <p className="text-gray-600">Add funds to your SalonMoney wallet</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          step >= s
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-all ${
                            step > s ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-200'
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium">
                  <span className={step >= 1 ? 'text-indigo-600' : 'text-gray-500'}>Amount</span>
                  <span className={step >= 2 ? 'text-indigo-600' : 'text-gray-500'}>Payment Method</span>
                  <span className={step >= 3 ? 'text-indigo-600' : 'text-gray-500'}>Confirmation</span>
                </div>
              </div>

              {/* Step 1: Amount */}
              {step === 1 && (
                <form onSubmit={handleAmountSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recharge Amount (NSL)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-14 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium"></span>
                      </div>
                      <input
                        type="number"
                        value={amount_NSL}
                        onChange={(e) => setAmount_NSL(e.target.value)}
                        placeholder="Enter amount (min: 100 NSL)"
                        className="form-input pl-16 text-lg font-semibold transition-all focus:scale-[1.01]"
                        step="0.01"
                        min="100"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum: 100 NSL</p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Select</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[1000, 5000, 10000, 25000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount_NSL(amt.toString())}
                          className="py-3 px-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all font-semibold text-gray-700 hover:text-indigo-600"
                        >
                          {amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {amount_NSL && parseFloat(amount_NSL) >= 100 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">You will receive:</span>
                        <span className="text-2xl font-bold text-indigo-600">{amount_NSL} NSL</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Payment required:</span>
                        <span className="text-2xl font-bold text-purple-600">{amount_usdt} USDT</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <p className="text-xs text-gray-600">
                          Exchange Rate: 1 USDT = {NSL_TO_USDT} NSL
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-lg font-bold transform hover:scale-[1.02] transition-all shadow-lg"
                  >
                    Continue to Payment Method
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </form>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Payment Method</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('binance')}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          paymentMethod === 'binance'
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'binance' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                            <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174-2.7174-2.7144 2.7175-2.6914zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"/>
                            </svg>
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-bold text-gray-800">Binance Pay</div>
                            <div className="text-xs text-gray-500">Instant & Secure</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Pay with USDT via Binance Smart Chain (BSC)
                        </p>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('crypto_wallet')}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          paymentMethod === 'crypto_wallet'
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'crypto_wallet' ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-bold text-gray-800">Crypto Wallet</div>
                            <div className="text-xs text-gray-500">Direct Transfer</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Send from your crypto wallet
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentMethodSubmit}
                      disabled={isLoading}
                      className="flex-1 btn-primary py-3 font-bold"
                    >
                      {isLoading ? 'Processing...' : 'Continue'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation & Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  {paymentMethod === 'binance' && depositAddress && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-yellow-400 rounded-lg">
                          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174-2.7174-2.7144 2.7175-2.6914zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"/>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="font-bold text-gray-800">Send {amount_usdt} USDT</div>
                          <div className="text-sm text-gray-600">to the address below</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-2">DEPOSIT ADDRESS (BSC)</label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <code className="text-sm font-mono text-gray-800 break-all">{depositAddress}</code>
                          <button
                            onClick={() => copyToClipboard(depositAddress)}
                            className="ml-2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="ml-3 text-sm text-red-800">
                            <div className="font-semibold mb-1">Important:</div>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Send only USDT on BSC network</li>
                              <li>Sending other tokens may result in permanent loss</li>
                              <li>Wait for blockchain confirmation (usually 1-3 minutes)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Enter transaction hash after payment"
                      className="form-input font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This helps us verify your payment faster
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3 text-sm text-blue-800">
                        <div className="font-semibold mb-1">What happens next?</div>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Send the exact amount to the address above</li>
                          <li>Finance admin will verify your payment</li>
                          <li>NSL will be credited to your account upon approval</li>
                          <li>You'll receive a notification when completed</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRechargeSubmit}
                      disabled={isLoading}
                      className="flex-1 btn-primary py-3 font-bold"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Info & Recent Transactions */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <div className="text-sm opacity-90 mb-1">Current Balance</div>
              <div className="text-3xl font-bold mb-4">{user?.balance_NSL?.toLocaleString() || '0'} NSL</div>
              <div className="text-sm opacity-75">≈ {((user?.balance_NSL || 0) / NSL_TO_USDT).toFixed(2)} USDT</div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">Recharge Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Min Amount</span>
                  <span className="font-semibold text-gray-800">100 NSL</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Exchange Rate</span>
                  <span className="font-semibold text-gray-800">1 USDT = {NSL_TO_USDT} NSL</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Network</span>
                  <span className="font-semibold text-gray-800">BSC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="font-semibold text-gray-800">1-24 hours</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="ml-3">
                  <div className="font-semibold text-purple-900 mb-1">Need Help?</div>
                  <p className="text-sm text-purple-700">
                    Contact support if you have any issues with your recharge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {showHistory && transactions.length > 0 && (
          <div className="mt-8 card animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Recharge History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">{tx.amount_NSL} NSL</div>
                        <div className="text-xs text-gray-500">{tx.amount_usdt} USDT</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{tx.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
