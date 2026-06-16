'use client';

import Link from 'next/link';

export const AUTH_STYLES = `
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

export const inp = {
  width:'100%', padding:'0.75rem 0.875rem 0.75rem 2.4rem',
  background:'#f4f4f8', border:'1.5px solid #e4e4f0',
  borderRadius:'var(--r-md)', color:'#111', fontSize:'0.875rem',
  outline:'none', transition:'border-color .15s, box-shadow .15s',
};

export const lbl = { display:'block', fontSize:'0.8rem', fontWeight:500, color:'#4a4a6a', marginBottom:'0.4rem' };

export const onFocus = (e) => {
  e.target.style.borderColor = 'var(--purple)';
  e.target.style.boxShadow   = '0 0 0 3px oklch(0.62 0.19 295 / .18)';
  e.target.style.background  = '#fff';
};

export const onBlur = (e) => {
  e.target.style.borderColor = '#e4e4f0';
  e.target.style.boxShadow   = 'none';
  e.target.style.background  = '#f4f4f8';
};

export function IconWrap({ children }) {
  return (
    <div style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', lineHeight:0, color:'#9090b0' }}>
      {children}
    </div>
  );
}

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

function WalletSVG({ vipLabel }) {
  return (
    <svg width="200" height="148" viewBox="0 0 200 148" fill="none">
      <defs>
        <linearGradient id="authWalletB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.40 0.20 290)"/>
          <stop offset="100%" stopColor="oklch(0.24 0.17 275)"/>
        </linearGradient>
        <linearGradient id="authWalletF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.48 0.23 296)"/>
          <stop offset="100%" stopColor="oklch(0.34 0.21 286)"/>
        </linearGradient>
        <linearGradient id="authWalletC" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.54 0.22 292)"/>
          <stop offset="100%" stopColor="oklch(0.32 0.20 270)"/>
        </linearGradient>
      </defs>
      <rect x="4" y="38" width="192" height="106" rx="16" fill="url(#authWalletB)"/>
      <rect x="4" y="18" width="192" height="64"  rx="16" fill="url(#authWalletF)"/>
      <rect x="4" y="18" width="192" height="18"  rx="16" fill="rgba(255,255,255,.07)"/>
      <ellipse cx="100" cy="34" rx="27" ry="10.5" fill="none" stroke="rgba(251,191,36,.5)" strokeWidth="1.5" style={{ animation:'slotBlink 1.8s ease-in-out infinite' }}/>
      <ellipse cx="100" cy="34" rx="23" ry="8"   fill="rgba(0,0,0,.58)"/>
      <ellipse cx="100" cy="33" rx="20" ry="5.5" fill="rgba(0,0,0,.30)"/>
      <rect x="16" y="66" width="106" height="64" rx="11" fill="url(#authWalletC)" opacity=".92"/>
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
      <text x="164" y="117" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="600" fontFamily="system-ui">{vipLabel}</text>
      <line x1="24" y1="138" x2="176" y2="138" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
    </svg>
  );
}

function Illustration({ coins, profits, vipLabel }) {
  return (
    <div style={{ position:'relative', width:280, height:295, flexShrink:0 }}>
      <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'oklch(0.62 0.19 295 / .22)', filter:'blur(60px)', top:'20%', left:'50%', transform:'translateX(-50%)' }}/>
      <div style={{ position:'absolute', width:160, height:60,  borderRadius:'50%', background:'rgba(245,158,11,.15)', filter:'blur(30px)', top:225, left:'50%', transform:'translateX(-50%)' }}/>
      {coins.map((c) => (
        <div key={`${c.anim}-${c.delay}`} style={{ position:'absolute', left:c.left, top:c.top, transform:'translateX(-50%)', animation:`${c.anim} ${c.dur} ${c.delay} infinite ease-in`, zIndex:10 }}>
          <Coin size={c.size}/>
        </div>
      ))}
      <div style={{ position:'absolute', left:'50%', top:105, transform:'translateX(-50%)', animation:'walletPulse 2.8s ease-in-out infinite', zIndex:5 }}>
        <WalletSVG vipLabel={vipLabel}/>
      </div>
      {profits.map((p) => (
        <div key={p.text} style={{ position:'absolute', left:p.left, top:p.top, color:p.color, fontSize:'0.7rem', fontWeight:700, animation:`profitUp 3.5s ${p.delay} infinite ease-out`, textShadow:`0 0 14px ${p.color}`, zIndex:15, whiteSpace:'nowrap', letterSpacing:'0.02em' }}>
          {p.text}
        </div>
      ))}
    </div>
  );
}

export function AuthIllustrationPanel({ heading, tagline, coins, profits, vipLabel }) {
  return (
    <div className="lg:w-1/2 flex flex-col items-center lg:items-start justify-center relative z-10"
         style={{ padding:'3rem 2.5rem 2rem' }}>
      <Link href="/" style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', textDecoration:'none', letterSpacing:'-0.02em', marginBottom:'2.5rem' }}>
        SalonMoney
      </Link>
      <Illustration coins={coins} profits={profits} vipLabel={vipLabel}/>
      <div style={{ marginTop:'1.5rem' }}>
        <h1 style={{ fontSize:'2rem', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:'0.75rem' }}>
          {heading}
        </h1>
        <p style={{ fontSize:'0.875rem', color:'oklch(1 0 0 / .58)', lineHeight:1.75 }}>
          {tagline}
        </p>
      </div>
    </div>
  );
}
