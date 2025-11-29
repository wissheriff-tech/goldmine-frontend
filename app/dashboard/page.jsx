'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import { DollarSign, TrendingUp, Users, Wallet, Sun, Moon, Cloud, CloudRain, Star } from 'lucide-react';
import Layout from '@/components/common/Layout';

export default function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [weatherIcon, setWeatherIcon] = useState(null);
  const router = useRouter();

  // Load dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update greeting and weather icon based on time
  useEffect(() => {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setWeatherIcon(<Sun className="w-8 h-8 text-yellow-400 animate-pulse" />);
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setWeatherIcon(
        <div className="relative">
          <Sun className="w-8 h-8 text-orange-400" />
          <Cloud className="w-5 h-5 text-gray-300 absolute -bottom-1 -right-1" />
        </div>
      );
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
      setWeatherIcon(
        <div className="relative">
          <Cloud className="w-8 h-8 text-gray-400" />
          <Sun className="w-5 h-5 text-orange-300 absolute top-0 right-0 opacity-50" />
        </div>
      );
    } else {
      setGreeting('Good Night');
      setWeatherIcon(
        <div className="relative">
          <Moon className="w-8 h-8 text-blue-200" />
          <Star className="w-3 h-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
        </div>
      );
    }
  }, [currentTime]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboard();
  }, [user, router]);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/user/dashboard');
      setDashboard(data);
      // Update user in auth store with latest data including profile_photo
      if (data.user) {
        setUser({ ...user, ...data.user });
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for date/time formatting
  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${day}, ${getOrdinal(date)} ${month} ${year}`;
  };

  const formatTime = () => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
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
      <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Dark Mode Toggle - Top */}
        <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="container max-w-7xl mx-auto px-4 py-3 flex justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Date, Time & Greeting Section */}
          <div className={`rounded-2xl p-6 mb-8 ${
            darkMode
              ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-gray-600'
              : 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-gray-200'
          } shadow-lg`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              {/* Left - Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {weatherIcon}
                  <div>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formatDate()}
                    </h3>
                    <p className={`text-3xl font-bold ${
                      darkMode
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                    } tabular-nums`}>
                      {formatTime()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Animated Greeting */}
              <div className="text-right">
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} animate-pulse`}>
                  {greeting}
                </p>
                <h2 className={`text-3xl font-bold ${
                  darkMode
                    ? 'bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                } animate-fadeIn`}>
                  {dashboard?.user?.username || 'User'}!
                </h2>
                <div className="mt-2 space-y-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Referral Code: <span className={`font-mono font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dashboard?.user?.referral_code}</span>
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status: <span className="text-green-500 font-semibold">{dashboard?.user?.status?.toUpperCase()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Balance in NSL</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dashboard?.user?.balance_NSL?.toFixed(2)}
                  </p>
                </div>
                <Wallet className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Balance in USDT</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dashboard?.user?.balance_usdt?.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>VIP Level</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dashboard?.user?.vip_level}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Referrals</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dashboard?.referrals?.count || 0}
                  </p>
                </div>
                <Users className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/recharge">
              <div className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                darkMode
                  ? 'bg-gradient-to-br from-blue-800 to-blue-900 border border-blue-700'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
              }`}>
                <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  💰 Recharge Account
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Add NSL to your balance
                </p>
              </div>
            </Link>

            <Link href="/products">
              <div className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                darkMode
                  ? 'bg-gradient-to-br from-purple-800 to-purple-900 border border-purple-700'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
              }`}>
                <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                  🛍️ Buy Products
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Browse VIP packages
                </p>
              </div>
            </Link>

            <Link href="/withdraw">
              <div className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                darkMode
                  ? 'bg-gradient-to-br from-green-800 to-green-900 border border-green-700'
                  : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
              }`}>
                <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                  💸 Withdraw
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Request withdrawal
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
      `}</style>
    </Layout>
  );
}
