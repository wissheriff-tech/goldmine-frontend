'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { User, Settings, Lock, KeyRound, LogOut, X, Crown, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function ProfileSidebar({ isOpen, onClose }) {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const { data } = await api.post('/user/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser({ ...user, profile_photo: data.profile_photo });
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleBalanceClick = () => {
    router.push('/recharge');
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Account',
      href: '/account',
      description: 'Manage your profile'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/account/settings',
      description: 'Preferences & notifications'
    },
    {
      icon: Lock,
      label: 'Change Password',
      href: '/account/change-password',
      description: 'Update your password'
    },
    {
      icon: KeyRound,
      label: 'Security',
      href: '/account/security',
      description: '2FA & security options'
    },
  ];

  const handleNavigation = (href) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-all duration-500 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Avatar */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 relative flex-shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <button
                onClick={handleProfilePhotoClick}
                disabled={uploading}
                className="relative group"
              >
                {user?.profile_photo ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.profile_photo}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white border-opacity-40"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white border-opacity-40">
                    <span className="text-white font-bold text-3xl">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}

                {/* Camera Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Online Status */}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-3 border-white rounded-full"></div>

                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <h3 className="text-white font-bold text-lg">{user?.username || 'User'}</h3>
            <p className="text-white text-opacity-80 text-sm">{user?.phone}</p>

            {/* VIP Badge */}
            {user?.vip_level && user.vip_level !== 'none' && (
              <div className="mt-3 px-4 py-1 bg-yellow-400 rounded-full flex items-center space-x-1">
                <Crown className="w-4 h-4 text-gray-900" />
                <span className="text-xs font-bold text-gray-900">{user.vip_level}</span>
              </div>
            )}

            {/* Balance - Clickable */}
            <button
              onClick={handleBalanceClick}
              className="mt-4 w-full bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 hover:bg-opacity-30 transition-all group"
            >
              <p className="text-white text-opacity-80 text-xs text-center">Total Balance</p>
              <p className="text-white font-bold text-xl text-center">
                {user?.balance_NSL?.toLocaleString() || 0} NSL
              </p>
              <p className="text-white text-opacity-60 text-xs text-center mt-1 group-hover:text-opacity-100 transition-opacity">
                Click to recharge
              </p>
            </button>
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="w-full flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout Button - Fixed at Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
