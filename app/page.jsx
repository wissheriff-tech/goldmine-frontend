'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">SalonMoney</h1>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container max-w-6xl mx-auto px-4 py-20 text-white">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Invest in Your Future Today</h2>
          <p className="text-xl text-gray-100 mb-8">
            Earn daily income through salon service investments. Grow your wealth with our secure financial platform.
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link href="/signup" className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-block">
                Get Started
              </Link>
              <Link href="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition inline-block">
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Invest Easily</h3>
            <p className="text-gray-100">Choose from VIP packages and start earning daily income</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-md">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Earn Referrals</h3>
            <p className="text-gray-100">Get up to 35% commission from referral purchases</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-md">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Secure & Safe</h3>
            <p className="text-gray-100">Bank-level encryption and role-based security controls</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-md">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Transparent</h3>
            <p className="text-gray-100">Real-time balance updates and transaction history</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white bg-opacity-5 backdrop-blur-md py-12 mt-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <p className="text-4xl font-bold">100+</p>
              <p className="text-gray-100 mt-2">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold">8</p>
              <p className="text-gray-100 mt-2">VIP Packages</p>
            </div>
            <div>
              <p className="text-4xl font-bold">24/7</p>
              <p className="text-gray-100 mt-2">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-6xl mx-auto px-4 py-20">
        {!isAuthenticated && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-600 mb-8">Join SalonMoney today and start your investment journey</p>
            <Link href="/signup" className="btn-primary px-8 py-3 text-lg">
              Create Account Now
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black bg-opacity-30 text-white py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 SalonMoney. All rights reserved. Secure Financial Platform.</p>
        </div>
      </footer>
    </div>
  );
}
