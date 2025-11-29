'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Shield, Smartphone, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function SecurityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setTwoFactorEnabled(user?.two_factor_enabled || false);
  }, [user, router]);

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/user/toggle-2fa');
      setTwoFactorEnabled(data.enabled);
      toast.success(data.enabled ? '2FA enabled successfully!' : '2FA disabled successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and authentication</p>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">2FA is currently enabled</p>
                  <p className="text-xs text-green-700 mt-1">
                    You'll need to verify your identity using a code sent to your phone
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Password Security */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Password</h3>
              <p className="text-sm text-gray-600 mt-1">
                Last changed: {user?.password_updated_at ? new Date(user.password_updated_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <button
              onClick={() => router.push('/account/change-password')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-sm font-medium"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security Recommendations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Keep your account secure with these tips
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Use a strong, unique password</p>
                <p className="text-xs text-gray-600 mt-1">
                  Combine uppercase, lowercase, numbers, and special characters
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Enable two-factor authentication</p>
                <p className="text-xs text-gray-600 mt-1">
                  Protect your account from unauthorized access
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Never share your password</p>
                <p className="text-xs text-gray-600 mt-1">
                  SalonMoney will never ask for your password via email or phone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
