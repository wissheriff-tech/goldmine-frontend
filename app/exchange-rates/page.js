'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import ExchangeRateDashboard from '@/components/Binance/ExchangeRateDashboard';
import CurrencyConverter from '@/components/Binance/CurrencyConverter';
import { Loader } from 'lucide-react';

export default function ExchangeRatesPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
          <p className="text-gray-600 mt-2">
            Live currency exchange rates and converter
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Currency Converter */}
          <CurrencyConverter />

          {/* Exchange Rate Dashboard */}
          <ExchangeRateDashboard />
        </div>
      </div>
    </div>
  );
}
