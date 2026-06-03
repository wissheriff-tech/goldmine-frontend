'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const STYLES = `
  @keyframes coinLeft {
    0%   { transform: translate(-170px,-90px) rotate(-50deg) scale(.85); opacity:0; }
    7%   { opacity:1; }
    78%  { opacity:1; transform: translate(0,0) rotate(-5deg) scale(1); }
    93%  { opacity:.4; transform: translate(1px,18px) scale(.5); }
    100% { opacity:0; transform: translate(0,22px) scale(.1); }
  }
  @keyframes coinTop {
    0%   { transform: translateY(-200px) rotate(0deg) scale(.8); opacity:0; }
    7%   { opacity:1; }
    78%  { opacity:1; transform: translateY(0) rotate(540deg) scale(1); }
    93%  { opacity:.4; transform: translateY(18px) scale(.5); }
    100% { opacity:0; transform: translateY(22px) scale(.1); }
  }
  @keyframes coinRight {
    0%   { transform: translate(170px,-90px) rotate(50deg) scale(.85); opacity:0; }
    7%   { opacity:1; }
    78%  { opacity:1; transform: translate(0,0) rotate(5deg) scale(1); }
    93%  { opacity:.4; transform: translate(-1px,18px) scale(.5); }
    100% { opacity:0; transform: translate(0,22px) scale(.1); }
  }
  @keyframes coinDiagLeft {
    0%   { transform: translate(-100px,-170px) rotate(-30deg); opacity:0; }
    7%   { opacity:1; }
    78%  { opacity:1; transform: translate(0,0) rotate(0deg); }
    93%  { opacity:.4; transform: translate(0,18px) scale(.5); }
    100% { opacity:0; transform: translate(0,22px) scale(.1); }
  }
  @keyframes coinDiagRight {
    0%   { transform: translate(100px,-170px) rotate(30deg); opacity:0; }
    7%   { opacity:1; }
    78%  { opacity:1; transform: translate(0,0) rotate(0deg); }
    93%  { opacity:.4; transform: translate(0,18px) scale(.5); }
    100% { opacity:0; transform: translate(0,22px) scale(.1); }
  }
  @keyframes profitUp {
    0%   { opacity:0; transform:translateY(0) scale(.8); }
    18%  { opacity:1; transform:translateY(0) scale(1); }
    70%  { opacity:1; transform:translateY(-55px); }
    100% { opacity:0; transform:translateY(-90px); }
  }
  @keyframes walletPulse {
    0%,100% { filter: drop-shadow(0 10px 32px rgba(109,40,217,.55)) drop-shadow(0 2px 8px rgba(0,0,0,.5)); }
    50%      { filter: drop-shadow(0 10px 56px rgba(109,40,217,.85)) drop-shadow(0 0 22px rgba(245,158,11,.35)); }
  }
  @keyframes slotBlink {
    0%,100% { opacity:.55; }
    50%     { opacity:1; }
  }
`;

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

function Coin({ size }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 32%, #fde68a, #f59e0b 52%, #d97706 88%)',
      boxShadow: '0 3px 14px rgba(245,158,11,.9), inset 0 1px 4px rgba(255,255,255,.6), inset 0 -2px 4px rgba(0,0,0,.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#78350f', fontWeight: 900, fontSize: Math.floor(size * .34),
      fontFamily: 'system-ui, sans-serif', userSelect: 'none',
    }}>$</div>
  );
}

function WalletSVG() {
  return (
    <svg width="200" height="148" viewBox="0 0 200 148" fill="none">
      <defs>
        <linearGradient id="flwb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.40 0.20 290)"/>
          <stop offset="100%" stopColor="oklch(0.24 0.17 275)"/>
        </linearGradient>
        <linearGradient id="flwf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.48 0.23 296)"/>
          <stop offset="100%" stopColor="oklch(0.34 0.21 286)"/>
        </linearGradient>
        <linearGradient id="flwc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.54 0.22 292)"/>
          <stop offset="100%" stopColor="oklch(0.32 0.20 270)"/>
        </linearGradient>
      </defs>
      <rect x="4" y="38" width="192" height="106" rx="16" fill="url(#flwb)"/>
      <rect x="4" y="18" width="192" height="64"  rx="16" fill="url(#flwf)"/>
      <rect x="4" y="18" width="192" height="18"  rx="16" fill="rgba(255,255,255,.07)"/>
      <ellipse cx="100" cy="34" rx="27" ry="10.5" fill="none" stroke="rgba(251,191,36,.5)" strokeWidth="1.5" style={{ animation:'slotBlink 1.8s ease-in-out infinite' }}/>
      <ellipse cx="100" cy="34" rx="23" ry="8"   fill="rgba(0,0,0,.58)"/>
      <ellipse cx="100" cy="33" rx="20" ry="5.5" fill="rgba(0,0,0,.30)"/>
      <rect x="16" y="66" width="106" height="64" rx="11" fill="url(#flwc)" opacity=".92"/>
      <rect x="16" y="66" width="106" height="16" rx="11" fill="rgba(255,255,255,.08)"/>
      <rect x="27" y="79" width="24" height="18" rx="4" fill="#f59e0b"/>
      <rect x="30" y="82" width="8" height="4" rx="1" fill="rgba(0,0,0,.35)"/>
      <rect x="30" y="88" width="8" height="4" rx="1" fill="rgba(0,0,0,.35)"/>
      <line x1="38" y1="82" x2="38" y2="96" stroke="rgba(0,0,0,.2)" strokeWidth="1"/>
      <circle cx="30" cy="118" r="2.5" fill="white" opacity=".5"/>
      <circle cx="39" cy="118" r="2.5" fill="white" opacity=".5"/>
      <circle cx="48" cy="118" r="2.5" fill="white" opacity=".5"/>
      <circle cx="57" cy="118" r="2.5" fill="white" opacity=".5"/>
      <rect x="138" y="64" width="52" height="66" rx="11" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" strokeWidth="1"/>
      <text x="164" y="83"  textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="8"  fontFamily="system-ui">BALANCE</text>
      <text x="164" y="100" textAnchor="middle" fill="white"   fontSize="12" fontWeight="700" fontFamily="system-ui">NSL</text>
      <text x="164" y="117" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600" fontFamily="system-ui">VIP3</text>
      <line x1="24" y1="138" x2="176" y2="138" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
    </svg>
  );
}

function Illustration() {
  return (
    <div style={{ position:'relative', width:280, height:295, flexShrink:0 }}>
      <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'oklch(0.62 0.19 295 / .22)', filter:'blur(60px)', top:'20%', left:'50%', transform:'translateX(-50%)' }}/>
      <div style={{ position:'absolute', width:160, height:60,  borderRadius:'50%', background:'rgba(245,158,11,.15)', filter:'blur(30px)', top:225, left:'50%', transform:'translateX(-50%)' }}/>
      {COINS.map((c, i) => (
        <div key={i} style={{ position:'absolute', left:c.left, top:c.top, transform:'translateX(-50%)', animation:`${c.anim} ${c.dur} ${c.delay} infinite ease-in`, zIndex:10 }}>
          <Coin size={c.size}/>
        </div>
      ))}
      <div style={{ position:'absolute', left:'50%', top:105, transform:'translateX(-50%)', animation:'walletPulse 2.8s ease-in-out infinite', zIndex:5 }}>
        <WalletSVG/>
      </div>
      {PROFITS.map((p, i) => (
        <div key={i} style={{ position:'absolute', left:p.left, top:p.top, color:p.color, fontSize:'0.7rem', fontWeight:700, animation:`profitUp 3.5s ${p.delay} infinite ease-out`, textShadow:`0 0 14px ${p.color}`, zIndex:15, whiteSpace:'nowrap', letterSpacing:'0.02em' }}>
          {p.text}
        </div>
      ))}
    </div>
  );
}

const inp = {
  width:'100%', padding:'0.75rem 0.875rem 0.75rem 2.4rem',
  background:'#f4f4f8', border:'1.5px solid #e4e4f0',
  borderRadius:'var(--r-md)', color:'#111', fontSize:'0.875rem',
  outline:'none', transition:'border-color .15s, box-shadow .15s',
};
const lbl = { display:'block', fontSize:'0.8rem', fontWeight:500, color:'#4a4a6a', marginBottom:'0.4rem' };
const onFocus = (e) => { e.target.style.borderColor='var(--purple)'; e.target.style.boxShadow='0 0 0 3px oklch(0.62 0.19 295 / .18)'; e.target.style.background='#fff'; };
const onBlur  = (e) => { e.target.style.borderColor='#e4e4f0'; e.target.style.boxShadow='none'; e.target.style.background='#f4f4f8'; };

function IconWrap({ children }) {
  return (
    <div style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', lineHeight:0, color:'#9090b0' }}>
      {children}
    </div>
  );
}

export default function Login() {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
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
      <style>{STYLES}</style>
      <div className="min-h-screen flex flex-col lg:flex-row" style={{
        background:'linear-gradient(160deg, oklch(0.20 0.24 295) 0%, oklch(0.10 0.18 270) 55%, oklch(0.15 0.20 245) 100%)',
        position:'relative', overflow:'hidden',
      }}>

        {/* Ambient orbs */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'oklch(0.62 0.19 295 / .10)', filter:'blur(130px)', top:-200, left:-200 }}/>
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(245,158,11,.05)', filter:'blur(110px)', bottom:-80, right:-80 }}/>
        </div>

        {/* ── Illustration panel ── */}
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start justify-center relative z-10"
             style={{ padding:'3rem 2.5rem 2rem' }}>
          <Link href="/" style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', textDecoration:'none', letterSpacing:'-0.02em', marginBottom:'2.5rem' }}>
            SalonMoney
          </Link>
          <Illustration/>
          <div style={{ marginTop:'1.5rem' }}>
            <h1 style={{ fontSize:'2rem', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:'0.75rem' }}>
              Your savings,<br/>growing daily.
            </h1>
            <p style={{ fontSize:'0.875rem', color:'oklch(1 0 0 / .58)', lineHeight:1.75 }}>
              Deposit USDT · Earn NSL every day · VIP1–VIP9 plans
            </p>
          </div>
        </div>

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
