'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import AdminVerificationPanel from '@/components/Binance/AdminVerificationPanel';
import { Loader } from 'lucide-react';

export default function BinanceVerificationPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const canAccess = ['finance', 'superadmin'].includes(user?.role);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && !canAccess) {
      router.push('/dashboard');
    }
  }, [user, loading, canAccess, router]);

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
          <h1 className="text-3xl font-bold text-gray-900">Binance Verification</h1>
          <p className="text-gray-600 mt-2">
            Review and verify user wallet submissions and withdrawal addresses
          </p>
        </div>

        {/* Content */}
        <AdminVerificationPanel />
      </div>
    </div>
  );
}
