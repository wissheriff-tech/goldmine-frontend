'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { AUTH_STYLES, AuthIllustrationPanel, IconWrap, inp, lbl, onBlur, onFocus } from '@/components/AuthIllustration';

const COINS = [
  { anim:'coinDiagLeft',  left:'44%', top:138, size:28, delay:'0s',   dur:'2.3s' },
  { anim:'coinTop',       left:'50%', top:135, size:34, delay:'1.0s', dur:'2.0s' },
  { anim:'coinRight',     left:'54%', top:138, size:24, delay:'1.9s', dur:'2.4s' },
  { anim:'coinLeft',      left:'45%', top:140, size:20, delay:'2.7s', dur:'2.1s' },
  { anim:'coinDiagRight', left:'55%', top:138, size:30, delay:'0.5s', dur:'2.6s' },
  { anim:'coinTop',       left:'48%', top:136, size:22, delay:'3.4s', dur:'1.9s' },
];

const PROFITS = [
  { text:'+25 NSL',   color:'#fbbf24', delay:'1.4s', left:'62%', top:162 },
  { text:'+$20 USDT', color:'#34d399', delay:'3.2s', left:'10%', top:165 },
  { text:'+75 NSL',   color:'#fbbf24', delay:'5.0s', left:'60%', top:160 },
  { text:'+10% ref',  color:'#a78bfa', delay:'2.2s', left:'8%',  top:168 },
];

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor  = ['', 'var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)'];

export default function Signup() {
  const [formData, setFormData]         = useState({ username:'', email:'', phone:'', password:'', confirmPassword:'', referred_by:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [strength, setStrength]         = useState(0);
  const { signup } = useAuthStore();
  const router = useRouter();

  const getReqs = (p) => ({
    minLength: p.length >= 8,
    hasLower:  /[a-z]/.test(p),
    hasUpper:  /[A-Z]/.test(p),
    hasNumber: /\d/.test(p),
    hasSpecial:/[@$!%*?&]/.test(p),
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
    if (!r.hasLower)  return toast.error('Password must contain a lowercase letter');
    if (!r.hasUpper)  return toast.error('Password must contain an uppercase letter');
    if (!r.hasNumber) return toast.error('Password must contain a number');
    if (!r.hasSpecial)return toast.error('Password must contain a special character (@$!%*?&)');
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
    <>
      <style>{AUTH_STYLES}</style>
      <div className="min-h-screen flex flex-col lg:flex-row" style={{
        background:'linear-gradient(155deg, oklch(0.18 0.23 300) 0%, oklch(0.10 0.18 272) 52%, oklch(0.16 0.21 248) 100%)',
        position:'relative', overflow:'hidden',
      }}>

        {/* Ambient orbs */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'oklch(0.62 0.19 295 / .10)', filter:'blur(130px)', top:-200, right:-200 }}/>
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(245,158,11,.05)', filter:'blur(110px)', bottom:-80, left:-80 }}/>
        </div>

        <AuthIllustrationPanel
          heading={<>Start earning<br/>today.</>}
          tagline="Pick a VIP plan · Earn NSL daily · Refer & earn 10%"
          coins={COINS}
          profits={PROFITS}
          vipLabel="VIP1"
        />

        {/* ── Form panel ── */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center relative z-10"
             style={{ padding:'2rem 1.5rem 3rem' }}>
          <div style={{ width:'100%', maxWidth:400 }}>

            <div style={{ width:'100%', background:'#f5f5fb', borderRadius:'var(--r-xl)', padding:'1.75rem', boxShadow:'0 24px 64px oklch(0 0 0 / .52), 0 0 0 1px oklch(1 0 0 / .18)' }}>
              <div style={{ marginBottom:'1.25rem' }}>
                <h2 style={{ fontSize:'1.3rem', fontWeight:700, color:'#111', marginBottom:'0.3rem' }}>Create account</h2>
                <p style={{ fontSize:'0.8rem', color:'#6b6b8d' }}>Takes less than a minute to set up</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>

                {/* Username */}
                <div>
                  <label htmlFor="username" style={lbl}>Username</label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></IconWrap>
                    <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="Choose a username" required style={inp} onFocus={onFocus} onBlur={onBlur} autoComplete="username"/>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={lbl}>Email <span style={{ color:'#9090b0', fontWeight:400 }}>(optional)</span></label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></IconWrap>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" style={inp} onFocus={onFocus} onBlur={onBlur} autoComplete="email"/>
                  </div>
                  <p style={{ fontSize:'0.72rem', color:'#9090b0', marginTop:'0.25rem' }}>Used for password reset and 2FA only.</p>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" style={lbl}>Phone number</label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></IconWrap>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+232-00-000-000" required style={inp} onFocus={onFocus} onBlur={onBlur} autoComplete="tel"/>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" style={lbl}>Password</label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg></IconWrap>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="At least 8 characters" required style={{ ...inp, paddingRight:'2.75rem' }} onFocus={onFocus} onBlur={onBlur} autoComplete="new-password"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9090b0', padding:0, lineHeight:0, cursor:'pointer' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ marginTop:'0.45rem' }}>
                      <div style={{ display:'flex', gap:4, marginBottom:'0.3rem', alignItems:'center' }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=strength ? strengthColor[strength] : '#e4e4f0', transition:'background .2s' }}/>
                        ))}
                        <span style={{ fontSize:'0.7rem', color: strengthColor[strength]||'#9090b0', marginLeft:4, whiteSpace:'nowrap' }}>{strengthLabel[strength]}</span>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.2rem 0.65rem' }}>
                        {[[reqs.minLength,'8+ chars'],[reqs.hasLower&&reqs.hasUpper,'Upper & lower'],[reqs.hasNumber,'Number'],[reqs.hasSpecial,'Special char']].map(([met,label]) => (
                          <span key={label} style={{ fontSize:'0.7rem', color: met ? 'var(--green)' : '#9090b0' }}>{met?'✓':'○'} {label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirmPassword" style={lbl}>Confirm password</label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg></IconWrap>
                    <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" required style={{ ...inp, paddingRight:'2.5rem' }} onFocus={onFocus} onBlur={onBlur} autoComplete="new-password"/>
                    {formData.confirmPassword && (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                        style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', color: formData.password===formData.confirmPassword ? 'var(--green)' : 'var(--red)', pointerEvents:'none' }}>
                        {formData.password===formData.confirmPassword
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Referral */}
                <div>
                  <label htmlFor="referred_by" style={lbl}>Referral code <span style={{ color:'#9090b0', fontWeight:400 }}>(optional)</span></label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg></IconWrap>
                    <input id="referred_by" name="referred_by" type="text" value={formData.referred_by} onChange={(e) => setFormData(prev => ({ ...prev, referred_by: e.target.value.toUpperCase() }))} placeholder="XXXXXXXXXX" style={inp} onFocus={onFocus} onBlur={onBlur} autoComplete="off"/>
                  </div>
                </div>

                {/* Terms */}
                <p style={{ fontSize:'0.73rem', color:'#9090b0', lineHeight:1.5 }}>
                  By creating an account you agree to our{' '}
                  <Link href="/terms" style={{ color:'var(--purple)', textDecoration:'none' }}>Terms of Service</Link>{' '}
                  and <Link href="/privacy" style={{ color:'var(--purple)', textDecoration:'none' }}>Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={isLoading} style={{
                  width:'100%', padding:'0.85rem',
                  background: isLoading ? 'var(--purple-dim)' : 'linear-gradient(135deg, oklch(0.62 0.19 295) 0%, oklch(0.50 0.20 270) 100%)',
                  color:'#fff', border:'none', borderRadius:'var(--r-md)',
                  fontSize:'0.9rem', fontWeight:700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: isLoading ? 'none' : '0 4px 22px oklch(0.62 0.19 295 / .50)',
                }}>
                  {isLoading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                      <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create account'}
                </button>
              </form>
            </div>

            <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'oklch(1 0 0 / .65)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color:'#fff', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
