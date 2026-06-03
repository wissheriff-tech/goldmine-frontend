'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, TrendingUp, Shield, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const GRADIENT = 'linear-gradient(135deg, oklch(0.36 0.22 295) 0%, oklch(0.22 0.18 270) 48%, oklch(0.28 0.20 245) 100%)';

const TRUST_POINTS = [
  { Icon: TrendingUp, text: 'Daily NSL token earnings, automatically credited' },
  { Icon: Shield,     text: 'Secure USDT deposits with a transparent fee structure' },
  { Icon: Users,      text: 'Earn referral bonuses every time a friend joins' },
];

const inputBase = {
  width: '100%',
  paddingTop: '0.7rem',
  paddingBottom: '0.7rem',
  paddingLeft: '2.4rem',
  background: '#f4f4f8',
  border: '1.5px solid #e4e4f0',
  borderRadius: 'var(--r-md)',
  color: '#111',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function InputField({ label, id, type = 'text', value, onChange, placeholder, required, icon: Icon, suffix, extra }) {
  return (
    <div>
      {extra || (
        <label htmlFor={id} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a4a6a', marginBottom: '0.4rem' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Icon size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9090b0', pointerEvents: 'none' }} />
        <input
          id={id} name={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          style={{ ...inputBase, paddingRight: suffix ? '2.75rem' : '0.875rem' }}
          autoComplete={id}
          onFocus={(e) => { e.target.style.borderColor = 'var(--purple)'; e.target.style.boxShadow = '0 0 0 3px oklch(0.62 0.19 295 / 0.18)'; e.target.style.background = '#fff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e4e4f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f4f4f8'; }}
        />
        {suffix && <div style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>}
      </div>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(username, password, rememberMe);
      if (data.requiresTwoFactor) {
        toast.success(data.message);
        router.push(`/verify-2fa?userId=${data.userId}`);
        return;
      }
      toast.success('Welcome back!');
      router.push(data.redirectTo || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: GRADIENT, position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / 0.18)', filter: 'blur(100px)', top: -160, left: -120 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.50 0.18 240 / 0.15)', filter: 'blur(90px)', bottom: -100, right: -80 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'oklch(0.70 0.16 310 / 0.10)', filter: 'blur(80px)', top: '40%', left: '35%' }} />
      </div>

      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex" style={{ width: '44%', flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between', padding: '3rem', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          SalonMoney
        </Link>
        <div>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--r-xl)', background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <TrendingUp size={26} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
            Your savings,<br />growing daily.
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'oklch(1 0 0 / 0.72)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Deposit USDT, choose a VIP plan, and earn NSL tokens every day — straightforward, reliable, yours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TRUST_POINTS.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={13} style={{ color: '#fff' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'oklch(1 0 0 / 0.72)', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'oklch(1 0 0 / 0.40)' }}>© 2025 SalonMoney. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile brand */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
              SalonMoney
            </Link>
            <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: 'oklch(1 0 0 / 0.70)' }}>
              Sign in to your account
            </p>
          </div>

          {/* Card */}
          <div style={{ width: '100%', background: '#f5f5fb', borderRadius: 'var(--r-xl)', padding: '1.75rem', boxShadow: '0 24px 64px oklch(0 0 0 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.25)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>Welcome back</h2>
              <p style={{ fontSize: '0.8rem', color: '#6b6b8d' }}>Sign in to continue to SalonMoney</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField label="Username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required icon={User} />

              <InputField
                id="password" type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password" required icon={Lock}
                extra={
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label htmlFor="password" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#4a4a6a' }}>Password</label>
                    <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--purple)', textDecoration: 'none' }}>Forgot password?</Link>
                  </div>
                }
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#9090b0', padding: 0, lineHeight: 0, cursor: 'pointer' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.83rem', color: '#4a4a6a', marginTop: '-0.25rem' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--purple)' }} />
                Keep me signed in
              </label>

              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '0.75rem',
                background: isLoading ? 'var(--purple-dim)' : 'linear-gradient(135deg, oklch(0.62 0.19 295) 0%, oklch(0.50 0.20 270) 100%)',
                color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: '0.875rem', fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: '0.25rem',
                boxShadow: isLoading ? 'none' : '0 4px 16px oklch(0.62 0.19 295 / 0.40)',
              }}>
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'oklch(1 0 0 / 0.70)' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
