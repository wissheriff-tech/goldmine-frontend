'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Home,ShoppingBag,Wallet,ArrowDownCircle,ArrowUpCircle,Receipt,Users,Shield,Package
} from 'lucide-react';

export default function Navbar({ onProfileClick, isProfileOpen }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Navigation links for regular users
  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/products', label: 'VIP Products', icon: ShoppingBag },
    { href: '/recharge', label: 'Recharge', icon: ArrowDownCircle },
    { href: '/withdraw', label: 'Withdraw', icon: ArrowUpCircle },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/referrals', label: 'Referrals', icon: Users },
  ];

  // Admin-specific links
  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: Shield },
    { href: '/admin/products', label: 'Manage Products', icon: Package },
  ];

  // Combine links based on user role
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || isAdmin;

  let navLinks = [...userLinks];
  if (isFinance && !navLinks.find(l => l.href === '/finance')) {
    navLinks.push({ href: '/finance', label: 'Finance', icon: Wallet });
  }
  if (isAdmin) {
    navLinks = [...navLinks, ...adminLinks];
  }

  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 sticky top-0 z-40 transition-all duration-500 ease-in-out ${
        isProfileOpen ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4">
        {/* Top Bar - Logo and User Info */}
        <div className="flex items-center justify-between h-16 border-b border-white border-opacity-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              SalonMoney
            </span>
          </Link>

          {/* Right Side - Balance & Profile */}
          <div className="flex items-center space-x-6">
            {/* Balance Display */}
            <div className="hidden md:flex items-center space-x-4 text-sm bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-right">
                <p className="text-xs text-white text-opacity-80">Balance</p>
                <p className="font-semibold text-white">
                  {user?.balance_NSL?.toLocaleString() || 0} NSL
                </p>
              </div>
              {user?.vip_level && user.vip_level !== 'none' && (
                <div className="px-2 py-1 bg-yellow-400 rounded text-xs font-bold text-gray-900">
                  {user.vip_level}
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={onProfileClick}
              className="relative group"
            >
              {user?.profile_photo ? (
                <img
                  src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.profile_photo}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white border-opacity-40 hover:border-opacity-100 transition-all duration-300 hover:scale-110"
                />
              ) : (
                <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-40 hover:border-opacity-100 transition-all duration-300 hover:scale-110">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-3 border-b-3 transition-all duration-300 whitespace-nowrap group ${
                  active
                    ? 'border-white text-white bg-white bg-opacity-20'
                    : 'border-transparent text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-300 ${
                  active ? '' : 'group-hover:scale-110 group-hover:rotate-12'
                }`} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
