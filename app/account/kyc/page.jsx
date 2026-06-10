'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { ArrowLeft, ShieldCheck, Upload, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

const DOCS = [
  { field: 'id_front',   label: 'ID Front',    hint: "Front of national ID, passport, or driver's licence", required: true },
  { field: 'id_back',    label: 'ID Back',     hint: "Back of national ID or driver's licence",             required: false },
  { field: 'selfie',     label: 'Selfie',      hint: 'Clear photo of your face holding your ID',            required: true },
  { field: 'additional', label: 'Additional',  hint: 'Utility bill, bank statement, etc.',                  required: false },
];

function FileSlot({ doc, file, preview, onChange, onClear }) {
  const ref = useRef();
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: `2px dashed ${file ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
            {doc.label}
            {doc.required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>{doc.hint}</p>
        </div>
        {file && (
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', lineHeight: 0, padding: '0.2rem' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {preview ? (
        <div style={{ position: 'relative' }}>
          <img src={preview} alt={doc.label} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: '0.4rem', right: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16,185,129,0.9)', borderRadius: 20, padding: '0.2rem 0.5rem' }}>
            <CheckCircle size={11} color="#fff" />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff' }}>Ready</span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '1.25rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', width: '100%' }}>
          <Upload size={20} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Click to upload</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>JPG, PNG, WEBP — max 5 MB</span>
        </button>
      )}

      <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={onChange} />
    </div>
  );
}

export default function KYCPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(null);
  const [files, setFiles]         = useState({ id_front: null, id_back: null, selfie: null, additional: null });
  const [previews, setPreviews]   = useState({ id_front: null, id_back: null, selfie: null, additional: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/user/kyc/status')
      .then(({ data }) => setKycStatus(data))
      .catch(() => toast.error('Failed to load KYC status'))
      .finally(() => setIsFetching(false));
  }, [user, router]);

  const handleFile = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5 MB');
    setFiles(f => ({ ...f, [field]: file }));
    const reader = new FileReader();
    reader.onload = ev => setPreviews(p => ({ ...p, [field]: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClear = (field) => {
    setFiles(f => ({ ...f, [field]: null }));
    setPreviews(p => ({ ...p, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.id_front) return toast.error('ID Front photo is required');
    if (!files.selfie)   return toast.error('Selfie photo is required');
    setIsLoading(true);
    const fd = new FormData();
    DOCS.forEach(({ field }) => { if (files[field]) fd.append(field, files[field]); });
    try {
      const { data } = await api.post('/user/kyc/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Documents submitted! We'll review within 24–48 hours.");
      setKycStatus(data);
      setFiles({ id_front: null, id_back: null, selfie: null, additional: null });
      setPreviews({ id_front: null, id_back: null, selfie: null, additional: null });
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    } finally { setIsLoading(false); }
  };

  if (isFetching) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3"/>
            <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  const verified = kycStatus?.kyc_verified;
  const hasDocs  = kycStatus?.documents ? Object.values(kycStatus.documents).some(Boolean) : false;

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.push('/account')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            <ArrowLeft size={15} /> Account
          </button>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Identity Verification</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Submit your documents to unlock full platform access</p>

          {/* Status banner */}
          {verified ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '1.125rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#10b981', fontSize: '0.875rem' }}>Identity Verified</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(16,185,129,0.7)', marginTop: '0.2rem' }}>Your documents have been reviewed and confirmed.</p>
              </div>
            </div>
          ) : hasDocs ? (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '1.125rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <Clock size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.875rem' }}>Under Review</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(245,158,11,0.7)', marginTop: '0.2rem' }}>We received your documents. Review takes 24–48 hours. You can resubmit below to replace them.</p>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '1.125rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <AlertTriangle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 700, color: '#f87171', fontSize: '0.875rem' }}>Verification Required</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(248,113,113,0.7)', marginTop: '0.2rem' }}>Upload your identity documents. Fields marked <strong style={{ color: '#f87171' }}>*</strong> are required.</p>
              </div>
            </div>
          )}

          {!verified && (
            <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                {hasDocs ? 'Resubmit Documents' : 'Upload Documents'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {DOCS.map(doc => (
                  <FileSlot key={doc.field} doc={doc} file={files[doc.field]} preview={previews[doc.field]}
                    onChange={e => handleFile(doc.field, e)} onClear={() => handleClear(doc.field)} />
                ))}
              </div>

              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem' }}>
                JPG, PNG, WEBP · Max 5 MB per file · Documents must be clearly readable and not expired.
              </p>

              <button type="submit" disabled={isLoading || (!files.id_front && !files.selfie)} style={{
                width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa',
                fontWeight: 800, fontSize: '0.875rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading || (!files.id_front && !files.selfie) ? 0.5 : 1,
              }}>
                {isLoading ? 'Uploading…' : 'Submit for Review'}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
