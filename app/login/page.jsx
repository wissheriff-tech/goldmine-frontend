'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { AUTH_STYLES, AuthIllustrationPanel, IconWrap, inp, lbl, onBlur, onFocus } from '@/components/AuthIllustration';

const COINS = [
  { anim:'coinLeft',      left:'46%', top:138, size:30, delay:'0s',   dur:'2.3s' },
  { anim:'coinTop',       left:'50%', top:135, size:36, delay:'0.85s',dur:'2.0s' },
  { anim:'coinRight',     left:'53%', top:138, size:26, delay:'1.7s', dur:'2.4s' },
  { anim:'coinDiagLeft',  left:'44%', top:140, size:22, delay:'2.55s',dur:'2.1s' },
  { anim:'coinDiagRight', left:'55%', top:138, size:28, delay:'0.4s', dur:'2.6s' },
  { anim:'coinTop',       left:'48%', top:136, size:20, delay:'3.2s', dur:'1.9s' },
];

const PROFITS = [
  { text:'+25 NSL',   color:'#fbbf24', delay:'1.3s', left:'62%', top:162 },
  { text:'+$50 USDT', color:'#34d399', delay:'3.1s', left:'12%', top:165 },
  { text:'+175 NSL',  color:'#fbbf24', delay:'4.8s', left:'60%', top:160 },
  { text:'+$20',      color:'#34d399', delay:'2.0s', left:'10%', top:168 },
];

export default function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [rememberMe, setRememberMe]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
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
    <>
      <style>{AUTH_STYLES}</style>
      <div className="min-h-screen flex flex-col lg:flex-row" style={{
        background:'linear-gradient(160deg, oklch(0.20 0.24 295) 0%, oklch(0.10 0.18 270) 55%, oklch(0.15 0.20 245) 100%)',
        position:'relative', overflow:'hidden',
      }}>

        {/* Ambient orbs */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'oklch(0.62 0.19 295 / .10)', filter:'blur(130px)', top:-200, left:-200 }}/>
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(245,158,11,.05)', filter:'blur(110px)', bottom:-80, right:-80 }}/>
        </div>

        <AuthIllustrationPanel
          heading={<>Your savings,<br/>growing daily.</>}
          tagline="Deposit USDT · Earn NSL every day · VIP1–VIP9 plans"
          coins={COINS}
          profits={PROFITS}
          vipLabel="VIP3"
        />

        {/* ── Form panel ── */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center relative z-10"
             style={{ padding:'2rem 1.5rem 3rem' }}>
          <div style={{ width:'100%', maxWidth:380 }}>

            <div style={{ width:'100%', background:'#f5f5fb', borderRadius:'var(--r-xl)', padding:'2rem', boxShadow:'0 24px 64px oklch(0 0 0 / .52), 0 0 0 1px oklch(1 0 0 / .18)' }}>
              <div style={{ marginBottom:'1.75rem' }}>
                <h2 style={{ fontSize:'1.3rem', fontWeight:700, color:'#111', marginBottom:'0.3rem' }}>Welcome back</h2>
                <p style={{ fontSize:'0.8rem', color:'#6b6b8d' }}>Sign in to continue to SalonMoney</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

                {/* Username */}
                <div>
                  <label htmlFor="username" style={lbl}>Username</label>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></IconWrap>
                    <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required style={inp} onFocus={onFocus} onBlur={onBlur} autoComplete="username"/>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                    <label htmlFor="password" style={{ fontSize:'0.8rem', fontWeight:500, color:'#4a4a6a' }}>Password</label>
                    <Link href="/forgot-password" style={{ fontSize:'0.78rem', color:'var(--purple)', textDecoration:'none' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position:'relative' }}>
                    <IconWrap><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg></IconWrap>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required style={{ ...inp, paddingRight:'2.75rem' }} onFocus={onFocus} onBlur={onBlur} autoComplete="current-password"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9090b0', padding:0, lineHeight:0, cursor:'pointer' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.83rem', color:'#4a4a6a', marginTop:'-0.25rem' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width:15, height:15, accentColor:'var(--purple)' }}/>
                  Keep me signed in
                </label>

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
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>
              </form>
            </div>

            <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'oklch(1 0 0 / .65)' }}>
              No account?{' '}
              <Link href="/signup" style={{ color:'#fff', fontWeight:700, textDecoration:'none' }}>Create one</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
