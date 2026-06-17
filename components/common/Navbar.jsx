'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  Home, ShoppingBag, Wallet, ArrowDownCircle, ArrowUpCircle,
  Receipt, Users, Shield, Package, User, Sun, Moon,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { backendAssetUrl } from '@/utils/api';
import { applyStoredTheme, getCurrentTheme, setStoredTheme } from '@/utils/theme';

function Avatar({ user, className = '' }) {
  const [broken, setBroken] = useState(false);
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';
  const photoUrl = user?.profile_photo
    ? backendAssetUrl(user.profile_photo)
    : null;

  if (photoUrl && !broken) {
    return (
      <img
        src={photoUrl}
        alt="Profile"
        className={className}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div className={`${className} bg-white/30 flex items-center justify-center`}>
      <span className="text-white font-bold text-sm drop-shadow">{initial}</span>
    </div>
  );
}

export default function Navbar({ onProfileClick, isProfileOpen }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(() => getCurrentTheme() === 'dark');

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(applyStoredTheme() === 'dark');
    };
    const handleThemeChange = (event) => {
      setDarkMode(Boolean(event.detail?.dark));
    };

    syncTheme();
    window.addEventListener('storage', syncTheme);
    window.addEventListener('salonmoney:theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('salonmoney:theme-change', handleThemeChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    setDarkMode(nextTheme === 'dark');
    setStoredTheme(nextTheme);
  };

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isFinance = user?.role === 'finance' || isAdmin;
  const isAmbassador = user?.role === 'ambassador';

  const userLinks = [
    { href: '/dashboard',    label: 'Dashboard',     icon: Home },
    { href: '/products',     label: 'VIP Products',  icon: ShoppingBag },
    { href: '/deposit',     label: 'Recharge',      icon: ArrowDownCircle },
    { href: '/withdraw',     label: 'Withdraw',      icon: ArrowUpCircle },
    { href: '/transactions', label: 'Transactions',  icon: Receipt },
    { href: '/referrals',    label: 'Referrals',     icon: Users },
  ];
  const adminLinks = [
    { href: '/admin',          label: 'Admin Panel',     icon: Shield },
    { href: '/admin/products', label: 'Manage Products', icon: Package },
  ];

  let desktopLinks = [...userLinks];
  if (isFinance && !desktopLinks.find(l => l.href === '/finance')) {
    desktopLinks.push({ href: '/finance', label: 'Finance', icon: Wallet });
  }
  if (isAmbassador) {
    desktopLinks.push({ href: '/ambassador', label: 'Ambassador', icon: Users });
  }
  if (isAdmin) desktopLinks = [...desktopLinks, ...adminLinks];

  const mobileLinks = isAdmin
    ? [
        { href: '/dashboard', label: 'Home',     icon: Home },
        { href: '/admin',     label: 'Admin',    icon: Shield },
        { href: '/deposit',  label: 'Recharge', icon: ArrowDownCircle },
        { href: '/withdraw',  label: 'Withdraw', icon: ArrowUpCircle },
        { href: '/account',   label: 'Account',  icon: User },
      ]
    : isAmbassador
    ? [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/ambassador', label: 'Sector', icon: Users },
        { href: '/products', label: 'Products', icon: ShoppingBag },
        { href: '/referrals', label: 'Invites', icon: Users },
        { href: '/account', label: 'Account', icon: User },
      ]
    : [
        { href: '/dashboard',    label: 'Home',     icon: Home },
        { href: '/products',     label: 'Products', icon: ShoppingBag },
        { href: '/deposit',     label: 'Recharge', icon: ArrowDownCircle },
        { href: '/transactions', label: 'History',  icon: Receipt },
        { href: '/account',      label: 'Account',  icon: User },
      ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <nav
        className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 sticky top-0 z-40 transition-all duration-500 ease-in-out ${
          isProfileOpen ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white drop-shadow-lg">SalonMoney</span>
              </Link>

              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={darkMode}
                className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full
                           bg-white/15 hover:bg-white/25 backdrop-blur-sm
                           border border-white/25 transition-all duration-300
                           hover:scale-105 active:scale-95 shrink-0 group"
              >
                <span className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${darkMode ? 'bg-yellow-400/80' : 'bg-white/40'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full shadow transition-all duration-300 ${
                    darkMode ? 'left-4 bg-white' : 'left-0.5 bg-white/90'
                  }`} />
                </span>
                {darkMode
                  ? <Sun className="w-3.5 h-3.5 text-yellow-300 transition-all duration-300 group-hover:rotate-12" />
                  : <Moon className="w-3.5 h-3.5 text-white/80 transition-all duration-300 group-hover:-rotate-12" />
                }
              </button>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6">
              {/* Balance — desktop only */}
              <div className="hidden md:flex items-center space-x-4 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-right">
                  <p className="text-xs text-white/80">Balance</p>
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

              {/* Balance pill — mobile only */}
              <div className="flex md:hidden items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <p className="text-xs font-semibold text-white">
                  {user?.balance_NSL?.toLocaleString() || 0} NSL
                </p>
              </div>

              {user && <NotificationBell />}

              {/* Avatar button */}
              <button onClick={onProfileClick} className="relative group shrink-0">
                <Avatar
                  user={user}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/40 hover:border-white transition-all duration-300 hover:scale-110"
                />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </button>
            </div>
          </div>

          {/* Desktop tab row */}
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {desktopLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-300 whitespace-nowrap group ${
                    active
                      ? 'border-white text-white bg-white/20'
                      : 'border-transparent text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? '' : 'group-hover:scale-110'}`} />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                      bg-white dark:bg-gray-900
                      border-t border-gray-200 dark:border-gray-700
                      shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center flex-1 h-full space-y-1 group"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  active ? 'bg-purple-100 dark:bg-purple-900/50' : 'group-active:bg-gray-100 dark:group-active:bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                </div>
                <span className={`text-[10px] font-medium leading-none ${
                  active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} className="bg-white dark:bg-gray-900" />
      </nav>
    </>
  );
}
