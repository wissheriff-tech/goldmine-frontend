'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Shield, Smartphone, Lock, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const STEPS = {
  IDLE: 'idle',
  ENABLE_EMAIL: 'enable_email',
  ENABLE_CODE: 'enable_code',
  DISABLE_CONFIRM: 'disable_confirm',
};

export default function SecurityPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [method, setMethod] = useState(null);
  const [step, setStep] = useState(STEPS.IDLE);
  const [isLoading, setIsLoading] = useState(false);

  // Enable flow state
  const [enableEmail, setEnableEmail] = useState('');
  const [enableCode, setEnableCode] = useState('');

  // Disable flow state
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    api.get('/security/2fa/status')
      .then(({ data }) => {
        setTwoFactorEnabled(data.enabled);
        setMethod(data.method);
      })
      .catch(() => {
        setTwoFactorEnabled(user?.twoFactorEnabled || false);
      });

    setEnableEmail(user?.email || '');
  }, [user, router]);

  const resetModal = () => {
    setStep(STEPS.IDLE);
    setEnableEmail(user?.email || '');
    setEnableCode('');
    setDisablePassword('');
    setDisableCode('');
  };

  const handleSendEnableCode = async (e) => {
    e.preventDefault();
    if (!enableEmail) return toast.error('Email is required');
    setIsLoading(true);
    try {
      await api.post('/security/2fa/enable', { method: 'email', email: enableEmail });
      setStep(STEPS.ENABLE_CODE);
      toast.success('Verification code sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEnable = async (e) => {
    e.preventDefault();
    if (!enableCode) return toast.error('Enter the verification code');
    setIsLoading(true);
    try {
      await api.post('/security/2fa/verify', { code: enableCode });
      setTwoFactorEnabled(true);
      setMethod('email');
      resetModal();
      toast.success('2FA enabled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!disablePassword) return toast.error('Password is required');
    if (!disableCode) return toast.error('Backup code is required');
    setIsLoading(true);
    try {
      await api.post('/security/2fa/disable', { password: disablePassword, code: disableCode });
      setTwoFactorEnabled(false);
      setMethod(null);
      resetModal();
      toast.success('2FA disabled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const modal = step !== STEPS.IDLE && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={resetModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {step === STEPS.ENABLE_EMAIL && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enable Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 mb-5">
              We'll send a 6-digit verification code to confirm your email.
            </p>
            <form onSubmit={handleSendEnableCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={enableEmail}
                  onChange={(e) => setEnableEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Sending…' : 'Send verification code'}
              </button>
            </form>
          </>
        )}

        {step === STEPS.ENABLE_CODE && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter verification code</h2>
            <p className="text-sm text-gray-600 mb-5">
              Enter the 6-digit code sent to <span className="font-medium">{enableEmail}</span>.
            </p>
            <form onSubmit={handleConfirmEnable} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={enableCode}
                onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
                required
              />
              <button
                type="submit"
                disabled={isLoading || enableCode.length !== 6}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Verifying…' : 'Activate 2FA'}
              </button>
              <button
                type="button"
                onClick={() => setStep(STEPS.ENABLE_EMAIL)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Didn't receive it? Go back to resend
              </button>
            </form>
          </>
        )}

        {step === STEPS.DISABLE_CONFIRM && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Disable Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 mb-5">
              Enter your password and a backup code to confirm.
            </p>
            <form onSubmit={handleDisable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup code</label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use one of the backup codes you saved when you enabled 2FA.</p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Disabling…' : 'Disable 2FA'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      {modal}
      <div className="container max-w-3xl mx-auto px-4 py-8">
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
            {twoFactorEnabled ? (
              <button
                onClick={() => setStep(STEPS.DISABLE_CONFIRM)}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={() => setStep(STEPS.ENABLE_EMAIL)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Enable 2FA
              </button>
            )}
          </div>

          {twoFactorEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">2FA is currently enabled</p>
                  <p className="text-xs text-green-700 mt-1">
                    {method === 'email'
                      ? 'A code will be sent to your email each time you log in.'
                      : 'Your account is protected with two-factor authentication.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">2FA is not enabled</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Enable 2FA to protect your account from unauthorized access.
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

        {/* Security Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security Recommendations</h3>
              <p className="text-sm text-gray-600 mt-1">Keep your account secure with these tips</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              ['Use a strong, unique password', 'Combine uppercase, lowercase, numbers, and special characters'],
              ['Enable two-factor authentication', 'Protect your account from unauthorized access'],
              ["Never share your password", "SalonMoney will never ask for your password via email or phone"],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-600 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
