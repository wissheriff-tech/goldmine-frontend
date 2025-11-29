'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { User, Mail, Phone, Calendar, Crown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [user, router]);

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
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Information</h1>
          <p className="text-gray-600">Manage your account details and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 relative">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white border-opacity-40 overflow-hidden">
                  {user?.profile_photo ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profile_photo}`}
                      alt={user?.username || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-4 border-white rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user?.username || 'User'}</h2>
                <p className="text-white text-opacity-90">{user?.phone}</p>
                <div className="flex items-center space-x-3 mt-3">
                  {user?.vip_level && user.vip_level !== 'none' && (
                    <div className="px-3 py-1 bg-yellow-400 rounded-full flex items-center space-x-1">
                      <Crown className="w-4 h-4 text-gray-900" />
                      <span className="text-sm font-bold text-gray-900">{user.vip_level}</span>
                    </div>
                  )}
                  <div className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-semibold text-white capitalize">{user?.role}</span>
                  </div>
                  {user?.status === 'active' && (
                    <div className="px-3 py-1 bg-green-400 bg-opacity-20 backdrop-blur-sm rounded-full">
                      <span className="text-sm font-semibold text-white">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Username</p>
                  <p className="font-semibold text-gray-900">{user?.username || 'Not set'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{user?.email || 'Not set'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{user?.phone || 'Not set'}</p>
                </div>
              </div>

              {/* Referral Code */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Referral Code</p>
                  <p className="font-semibold text-gray-900 font-mono">{user?.referral_code || 'Not set'}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* KYC Status */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">KYC Status</p>
                  <p className={`font-semibold ${user?.kyc_verified ? 'text-green-600' : 'text-orange-600'}`}>
                    {user?.kyc_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* NSL Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-white text-opacity-80 text-sm mb-2">NSL Balance</p>
            <p className="text-4xl font-bold mb-4">{user?.balance_NSL?.toLocaleString() || 0}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white text-opacity-80">Currency</span>
              <span className="font-semibold">NSL</span>
            </div>
          </div>

          {/* USDT Balance */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-white text-opacity-80 text-sm mb-2">USDT Balance</p>
            <p className="text-4xl font-bold mb-4">{user?.balance_usdt?.toLocaleString() || 0}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white text-opacity-80">Currency</span>
              <span className="font-semibold">USDT</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/account/settings')}
              className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all text-left group"
            >
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Edit Profile</p>
              <p className="text-sm text-gray-500 mt-1">Update your information</p>
            </button>

            <button
              onClick={() => router.push('/account/change-password')}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all text-left group"
            >
              <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Change Password</p>
              <p className="text-sm text-gray-500 mt-1">Update your password</p>
            </button>

            <button
              onClick={() => router.push('/account/security')}
              className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all text-left group"
            >
              <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Security Settings</p>
              <p className="text-sm text-gray-500 mt-1">Manage 2FA and security</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
