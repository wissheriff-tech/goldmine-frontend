'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

export default function VerifyEmail() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setVerificationSuccess(true);
        toast.success(data.message);
        setTimeout(() => router.push('/login'), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
        toast.error(err.response?.data?.message || 'Verification failed');
      } finally {
        setIsVerifying(false);
      }
    };
    if (token) verifyEmail();
  }, [token, router]);

  const btnStyle = {
    display: 'inline-block', padding: '0.875rem 1.5rem', borderRadius: 12, fontWeight: 800,
    fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'none',
    background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa',
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(120px)', top: -150, right: -100 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(100px)', bottom: -100, left: -80 }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '2.25rem', textAlign: 'center' }}>

          {isVerifying && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Loader2 size={26} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Verifying Email</h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Please wait while we verify your email address…
              </p>
            </>
          )}

          {!isVerifying && verificationSuccess && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Email Verified!</h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Your email has been verified. Redirecting to login…
              </p>
              <Link href="/login" style={btnStyle}>Go to Login</Link>
            </>
          )}

          {!isVerifying && error && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <XCircle size={28} color="#ef4444" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Verification Failed</h1>
              <p style={{ fontSize: '0.875rem', color: '#f87171', lineHeight: 1.6, marginBottom: '1.5rem' }}>{error}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/login" style={{ ...btnStyle, display: 'block' }}>Go to Login</Link>
                <Link href="/signup" style={{ fontSize: '0.82rem', color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }}>
                  Create New Account
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
