'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Eye, EyeOff, Gift, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const GRADIENT = 'linear-gradient(150deg, oklch(0.33 0.21 305) 0%, oklch(0.20 0.17 278) 48%, oklch(0.27 0.19 248) 100%)';

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)'];

const inputBase = {
  width: '100%',
  paddingTop: '0.7rem',
  paddingBottom: '0.7rem',
  paddingLeft: '2.4rem',
  paddingRight: '0.875rem',
  background: '#f4f4f8',
  border: '1.5px solid #e4e4f0',
  borderRadius: 'var(--r-md)',
  color: '#111',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const lbl = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a4a6a', marginBottom: '0.4rem' };

function focusStyle(e) { e.target.style.borderColor = 'var(--purple)'; e.target.style.boxShadow = '0 0 0 3px oklch(0.62 0.19 295 / 0.18)'; e.target.style.background = '#fff'; }
function blurStyle(e) { e.target.style.borderColor = '#e4e4f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f4f4f8'; }

function Field({ label, id, type = 'text', value, onChange, placeholder, required, icon: Icon, suffix, optional, hint, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} style={lbl}>
        {label}{optional && <span style={{ color: '#9090b0', fontWeight: 400, marginLeft: '0.35rem' }}>(optional)</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9090b0', pointerEvents: 'none' }} />
        <input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
          required={required} autoComplete={autoComplete || id}
          style={{ ...inputBase, paddingRight: suffix ? '2.75rem' : '0.875rem' }}
          onFocus={focusStyle} onBlur={blurStyle} />
        {suffix && <div style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>}
      </div>
      {hint && <p style={{ fontSize: '0.72rem', color: '#9090b0', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  );
}

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '', referred_by: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const { signup } = useAuthStore();
  const router = useRouter();

  const getReqs = (p) => ({
    minLength: p.length >= 8,
    hasLower: /[a-z]/.test(p),
    hasUpper: /[A-Z]/.test(p),
    hasNumber: /\d/.test(p),
    hasSpecial: /[@$!%*?&]/.test(p),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const r = getReqs(value);
      setStrength([r.minLength, r.hasLower && r.hasUpper, r.hasNumber, r.hasSpecial].filter(Boolean).length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    const r = getReqs(formData.password);
    if (!r.minLength) return toast.error('Password must be at least 8 characters');
    if (!r.hasLower) return toast.error('Password must contain a lowercase letter');
    if (!r.hasUpper) return toast.error('Password must contain an uppercase letter');
    if (!r.hasNumber) return toast.error('Password must contain a number');
    if (!r.hasSpecial) return toast.error('Password must contain a special character (@$!%*?&)');
    setIsLoading(true);
    try {
      const data = await signup(formData.username, formData.phone, formData.password, formData.referred_by, formData.email);
      toast.success(data.requiresEmailVerification ? 'Account created! Check your email.' : 'Account created! Awaiting verification.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reqs = getReqs(formData.password);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: GRADIENT, position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'oklch(0.60 0.20 305 / 0.20)', filter: 'blur(100px)', top: -140, right: -100 }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'oklch(0.48 0.18 248 / 0.16)', filter: 'blur(90px)', bottom: -80, left: -80 }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'oklch(0.72 0.14 320 / 0.12)', filter: 'blur(70px)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--r-xl)', background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.22)', marginBottom: '1rem', boxShadow: '0 4px 20px oklch(0 0 0 / 0.25)' }}>
              <TrendingUp size={24} style={{ color: '#fff' }} />
            </div>
            <Link href="/" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#fff', textDecoration: 'none', marginBottom: '0.3rem' }}>
              SalonMoney
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'oklch(1 0 0 / 0.70)' }}>Create your account</p>
          </div>

          {/* Card */}
          <div style={{ width: '100%', background: '#f5f5fb', borderRadius: 'var(--r-xl)', padding: '1.75rem', boxShadow: '0 24px 64px oklch(0 0 0 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.25)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>Start earning today</h2>
              <p style={{ fontSize: '0.8rem', color: '#6b6b8d' }}>Takes less than a minute to set up</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Username" id="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required icon={User} />
              <Field label="Email" id="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" icon={Mail} optional hint="Used for password reset and 2FA only." autoComplete="email" />
              <Field label="Phone number" id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+232-00-000-000" required icon={Phone} autoComplete="tel" />

              {/* Password with strength */}
              <div>
                <label htmlFor="password" style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9090b0', pointerEvents: 'none' }} />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                    placeholder="At least 8 characters" required autoComplete="new-password"
                    style={{ ...inputBase, paddingRight: '2.75rem' }} onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9090b0', padding: 0, lineHeight: 0, cursor: 'pointer' }}
                    aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: '0.35rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor[strength] : '#e4e4f0', transition: 'background 0.2s' }} />
                      ))}
                      <span style={{ fontSize: '0.7rem', color: strengthColor[strength] || '#9090b0', marginLeft: 4, whiteSpace: 'nowrap' }}>{strengthLabel[strength]}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
                      {[[reqs.minLength, '8+ chars'], [reqs.hasLower && reqs.hasUpper, 'Upper & lower'], [reqs.hasNumber, 'Number'], [reqs.hasSpecial, 'Special char']].map(([met, label]) => (
                        <span key={label} style={{ fontSize: '0.7rem', color: met ? 'var(--green)' : '#9090b0' }}>{met ? '✓' : '○'} {label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" style={lbl}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9090b0', pointerEvents: 'none' }} />
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password" required autoComplete="new-password"
                    style={{ ...inputBase, paddingRight: '2.5rem' }} onFocus={focusStyle} onBlur={blurStyle} />
                  {formData.confirmPassword && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                      style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: formData.password === formData.confirmPassword ? 'var(--green)' : 'var(--red)', pointerEvents: 'none' }}>
                      {formData.password === formData.confirmPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                    </svg>
                  )}
                </div>
              </div>

              <Field label="Referral code" id="referred_by" value={formData.referred_by}
                onChange={(e) => setFormData(prev => ({ ...prev, referred_by: e.target.value.toUpperCase() }))}
                placeholder="XXXXXXXXXX" icon={Gift} optional autoComplete="off" />

              <p style={{ fontSize: '0.75rem', color: '#9090b0', lineHeight: 1.5 }}>
                By creating an account you agree to our{' '}
                <Link href="/terms" style={{ color: 'var(--purple)', textDecoration: 'none' }}>Terms of Service</Link>{' '}
                and <Link href="/privacy" style={{ color: 'var(--purple)', textDecoration: 'none' }}>Privacy Policy</Link>.
              </p>

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
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'oklch(1 0 0 / 0.70)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
