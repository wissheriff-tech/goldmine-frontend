'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import RateLimitDashboard from '@/components/admin/RateLimitDashboard';

export default function RateLimitsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated and is superadmin
    if (!loading && (!user || user.role !== 'superadmin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <RateLimitDashboard />
      </div>
    </div>
  );
}
