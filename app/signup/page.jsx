'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referred_by: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signup } = useAuth();
  const router = useRouter();

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }

    setIsLoading(true);

    try {
      const data = await signup(
        formData.username,
        formData.phone,
        formData.password,
        formData.referred_by,
        formData.email
      );

      if (data.requiresEmailVerification) {
        toast.success('Account created! 🎉 Please check your email to verify your account.');
      } else {
        toast.success('Account created! 🎉 Awaiting admin verification.');
      }

      router.push('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse-subtle"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-purple-500/50 animate-slideUp">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-fadeIn">
              Join SalonMoney Now
            </h1>
            <p className="text-gray-600 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              Start earning today!
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                  autoComplete="username"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Email Address <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                  autoComplete="email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">Recommended for password reset and 2FA</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+232-00-000-000"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                  autoComplete="tel"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                  autoComplete="new-password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength / 4) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                  autoComplete="new-password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.45s' }}>
              <label className="block text-sm font-semibold text-gray-700">
                Referral Code <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="referred_by"
                  value={formData.referred_by}
                  onChange={(e) => setFormData(prev => ({ ...prev, referred_by: e.target.value.toUpperCase() }))}
                  placeholder="Enter referral code"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white uppercase"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="text-xs text-gray-600 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-purple-600 hover:text-purple-800 font-semibold">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold">Privacy Policy</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-fadeIn"
              style={{ animationDelay: '0.55s' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 font-bold hover:text-purple-800 transition-colors hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/80 text-sm mt-6 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
          Join 10,000+ users earning daily 💰
        </p>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
