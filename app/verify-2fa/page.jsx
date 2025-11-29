'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';

export default function Verify2FA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { setUser, setToken } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      toast.error('Invalid session. Please login again.');
      router.push('/login');
    }
  }, [userId, router]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('');
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/verify-2fa', { userId, code: fullCode });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      setToken(data.token);

      toast.success('Login successful!');
      router.push(data.redirectTo || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || '2FA verification failed');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button className="text-primary font-semibold hover:underline">
              Resend Code
            </button>
          </p>
          <Link href="/login" className="block text-primary font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
