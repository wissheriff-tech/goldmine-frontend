'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { resolvePostLoginRedirect } from '@/utils/navigation';
import { reloadIfPwaUpdateIsReady } from '@/utils/pwaUpdate';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [updateProgress, setUpdateProgress] = useState(null);
  const [updateStage, setUpdateStage] = useState('Checking for the latest version');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let reloadingForUpdate = false;
    try {
      reloadingForUpdate = await reloadIfPwaUpdateIsReady({
        onProgress: ({ progress, stage }) => {
          setUpdateProgress(progress);
          setUpdateStage(stage || 'Checking for the latest version');
        },
      });
      if (reloadingForUpdate) return;
      setUpdateProgress(null);

      const data = await login(identifier.trim(), password, rememberMe);
      if (data.requiresTwoFactor) {
        try {
          if (rememberMe) window.sessionStorage.setItem('pendingLoginRememberMe', '1');
          else window.sessionStorage.removeItem('pendingLoginRememberMe');
        } catch {}
        toast.success(data.message);
        router.push(`/verify-2fa?userId=${data.userId}`);
        return;
      }
      try { window.sessionStorage.removeItem('pendingLoginRememberMe'); } catch {}
      toast.success('Welcome back!');
      router.push(resolvePostLoginRedirect(data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      if (!reloadingForUpdate) setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 40%, #0d0d2b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background mesh */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', top: -200, left: -200 }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)', bottom: -150, right: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', top: '50%', left: '60%' }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {updateProgress !== null && (
        <div className="pwa-update-shell" role="status" aria-live="assertive">
          <div className="pwa-update-card">
            <p className="pwa-install-title">Updating Gold Mine</p>
            <p className="pwa-install-copy">{updateStage}. {updateProgress}%</p>
            <div className="pwa-update-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={updateProgress}>
              <div style={{ width: `${updateProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
            marginBottom: '1rem',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Gold Mine</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>Financial Platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '2.25rem 2rem',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 0 0.3rem' }}>Sign in to your account</h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Username or Phone
              </label>
              <input
                type="text"
                name="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Enter username or phone number"
                required
                autoComplete="username"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.8rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: '#fff',
                  fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'rgba(167,139,250,0.9)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.8rem 2.75rem 0.8rem 1rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: '#fff',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, lineHeight: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}
                />
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: rememberMe ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.08)',
                  border: rememberMe ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', pointerEvents: 'none',
                }}>
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', userSelect: 'none' }}>Keep me signed in</span>
            </label>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.25rem 0' }} />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: isLoading
                  ? 'rgba(124,58,237,0.35)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(124,58,237,0.5)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.65)'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.5)'; }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Have a referral code?{' '}
            <Link href="/signup" style={{ color: 'rgba(167,139,250,0.9)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginTop: '1.75rem' }}>
          {['256-bit SSL', 'Bank-level Security', 'Trusted Platform'].map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L1.5 3v3c0 2.76 1.96 5.34 4.5 6 2.54-.66 4.5-3.24 4.5-6V3L6 1z" fill="rgba(124,58,237,0.7)"/>
              </svg>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.03em' }}>{label}</span>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
