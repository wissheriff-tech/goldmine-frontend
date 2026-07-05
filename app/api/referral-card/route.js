import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get('code') || 'XXXXXX').toUpperCase();
  const earned = parseInt(searchParams.get('earned') || '0', 10);
  const referrals = parseInt(searchParams.get('referrals') || '0', 10);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #1a0a3d 0%, #0a0619 50%, #0d0e24 100%)',
          padding: '48px 44px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow blobs */}
        <div style={{ display: 'flex', position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', filter: 'blur(80px)', top: -80, right: -60 }} />
        <div style={{ display: 'flex', position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(96,165,250,0.08)', filter: 'blur(70px)', bottom: -60, left: -40 }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 54, height: 54, borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          }}>
            <div style={{ display: 'flex', width: 28, height: 28, background: '#fff', borderRadius: 4, transform: 'rotate(45deg)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#ffffff', fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Gold Mine</span>
            <span style={{ color: '#a78bfa', fontSize: 14, fontWeight: 600, letterSpacing: '0.04em' }}>Earn Daily Income</span>
          </div>
        </div>

        {/* Invite headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>You have been invited</span>
          <span style={{ color: '#ffffff', fontSize: 28, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.01em' }}>Join &amp; earn commissions{'\n'}from every deposit</span>
        </div>

        {/* Code card */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: 'rgba(124,58,237,0.18)',
          border: '2px solid rgba(124,58,237,0.45)',
          borderRadius: 22, padding: '28px 32px',
          marginBottom: 28,
        }}>
          <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Your Referral Code</span>
          <span style={{ color: '#ffffff', fontSize: 60, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.12em', lineHeight: 1 }}>{code}</span>
        </div>

        {/* Commission badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          {[['L1', '3%', '#a78bfa', 'rgba(167,139,250,0.15)', 'rgba(167,139,250,0.4)'],
            ['L2', '2%', '#60a5fa', 'rgba(96,165,250,0.15)', 'rgba(96,165,250,0.4)'],
            ['L3', '1%', '#22d3ee', 'rgba(34,211,238,0.15)', 'rgba(34,211,238,0.4)']].map(([level, pct, color, bg, border]) => (
            <div key={level} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: bg, border: `1px solid ${border}`, borderRadius: 14,
              padding: '10px 18px',
            }}>
              <span style={{ color, fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{pct}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{level}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>3-level commissions</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>on every deposit made</span>
          </div>
        </div>

        {/* Stats row */}
        {(referrals > 0 || earned > 0) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '14px 20px' }}>
              <span style={{ color: '#10b981', fontSize: 22, fontWeight: 900 }}>{referrals}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>Total Referrals</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 14, padding: '14px 20px' }}>
              <span style={{ color: '#a78bfa', fontSize: 22, fontWeight: 900 }}>{earned.toLocaleString()} NSL</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>Commissions Earned</span>
            </div>
          </div>
        )}

        {/* Sign up link */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 22px' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Sign up at</span>
          <span style={{ color: '#a78bfa', fontSize: 17, fontWeight: 700, fontFamily: 'monospace' }}>mygoldmine.app/signup?ref={code}</span>
        </div>
      </div>
    ),
    {
      width: 500,
      height: 860,
    }
  );
}
