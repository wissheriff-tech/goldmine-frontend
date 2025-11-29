'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTransactions();
  }, [user, router, filter]);

  const fetchTransactions = async () => {
    try {
      const params = filter ? { type: filter } : {};
      const { data } = await api.get('/user/transactions', { params });
      setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      recharge: '💰',
      withdrawal: '💸',
      income: '📈',
      referral_bonus: '👥',
      purchase: '🛍️'
    };
    return icons[type] || '💳';
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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-6xl mx-auto px-4">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg ${!filter ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            {['recharge', 'withdrawal', 'income', 'purchase', 'referral_bonus'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg ${filter === type ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                {type.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                    <div>
                      <p className="font-semibold capitalize">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount_NSL} NSL
                    </p>
                    <p className={`text-sm px-3 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
