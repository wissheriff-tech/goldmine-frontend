'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, Loader2, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';
import {
  formatAmountLabel,
  isMobileProvider,
  providerLabel,
  sanitizeReceiptSubmission,
  validateDepositReceipt,
} from '@/utils/depositReceiptParser';

const DEPOSIT_FEE_PCT = 5;
const DEFAULT_NSL_RATE = 23.99;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const OCR_VARIANT_WIDTH = 1200;

const PROVIDERS = {
  orange_money: {
    label: 'Orange Money',
    short: 'Orange',
    accent: '#fb923c',
    bg: 'rgba(249,115,22,0.16)',
    border: 'rgba(249,115,22,0.38)',
    destinationKey: 'orange_money_number',
    destinationLabel: 'Company number',
  },
  africell: {
    label: 'Africell',
    short: 'Africell',
    accent: '#60a5fa',
    bg: 'rgba(59,130,246,0.16)',
    border: 'rgba(59,130,246,0.38)',
    destinationKey: 'africell_number',
    destinationLabel: 'Company number',
  },
  binance: {
    label: 'Binance',
    short: 'Binance',
    accent: '#facc15',
    bg: 'rgba(250,204,21,0.14)',
    border: 'rgba(250,204,21,0.34)',
    destinationKey: 'binance_wallet_address',
    destinationLabel: 'USDT wallet',
  },
};

const S = {
  bg: 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)',
  card: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '1.25rem' },
  label: { display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', fontWeight: 700 },
};

function estimateCredit(receipt, nslRate) {
  if (!receipt?.amount) return { grossNSL: 0, feeNSL: 0, netNSL: 0, grossUsdt: 0, netUsdt: 0 };
  const isCrypto = receipt.currency === 'USDT' || receipt.provider === 'binance';
  const grossNSL = isCrypto ? receipt.amount * nslRate : receipt.amount;
  const feeNSL = grossNSL * DEPOSIT_FEE_PCT / 100;
  const netNSL = grossNSL - feeNSL;
  return {
    grossNSL,
    feeNSL,
    netNSL,
    grossUsdt: isCrypto ? receipt.amount : grossNSL / nslRate,
    netUsdt: netNSL / nslRate,
  };
}

function DetailRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: accent || '#fff', fontWeight: 800, textAlign: 'right', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>{value || 'Not found'}</span>
    </div>
  );
}

function receiptNeedsEnhancedScan(receipt) {
  if (!receipt?.reference_id || !receipt.amount) return true;
  return isMobileProvider(receipt.provider) && !receipt.sender_number && !receipt.receiver_number;
}

function loadImageForOcr(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image could not be loaded'));
    };
    image.decoding = 'async';
    image.src = url;
  });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('OCR image variant could not be prepared'));
    }, 'image/png');
  });
}

async function createOcrVariant(file, mode) {
  const image = await loadImageForOcr(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return null;

  const targetWidth = Math.min(1400, Math.max(sourceWidth, OCR_VARIANT_WIDTH));
  const scale = targetWidth / sourceWidth;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sourceWidth * scale);
  canvas.height = Math.round(sourceHeight * scale);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
    const orangeText = red > 140 && green > 70 && green < 200 && blue < 170 && red > green + 10 && green > blue + 10;
    const darkText = gray < 135;
    const shouldInk = mode === 'orange-only' ? orangeText : (darkText || orangeText);
    const value = shouldInk ? 0 : 255;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function createOcrImageVariants(file) {
  const variants = [];
  for (const mode of ['orange-only', 'high-contrast']) {
    try {
      const blob = await createOcrVariant(file, mode);
      if (blob) variants.push(blob);
    } catch {}
  }
  return variants;
}

function StatusPanel({ status, errors, submitError, scanResult, accent }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'scanning' || status === 'submitting') {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}`, borderRadius: 12, padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        {status === 'scanning' ? 'Scanning receipt...' : 'Submitting for approval...'}
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.32)', borderRadius: 12, padding: '0.875rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: '#fecaca', fontWeight: 800 }}>The scan is missing required receipt details.</p>
        </div>
        {errors.map(error => (
          <p key={error} style={{ fontSize: '0.75rem', color: 'rgba(254,202,202,0.82)', marginTop: '0.25rem' }}>{error}</p>
        ))}
      </div>
    );
  }

  if (submitError) {
    return (
      <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.34)', borderRadius: 12, padding: '0.875rem', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700 }}>
        {submitError}
      </div>
    );
  }

  if (scanResult) {
    return (
      <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.32)', borderRadius: 12, padding: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <ShieldCheck size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: '0.78rem', color: '#bbf7d0', fontWeight: 700 }}>Receipt scanned. The extracted details are ready for approval review.</p>
      </div>
    );
  }

  return null;
}

export default function DepositPage() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const scanRunRef = useRef(0);
  const [provider, setProvider] = useState('orange_money');
  const [paymentMethods, setPaymentMethods] = useState({});
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanResult, setScanResult] = useState(null);
  const [scanErrors, setScanErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);
  const [nslRate, setNslRate] = useState(DEFAULT_NSL_RATE);

  const meta = PROVIDERS[provider] || PROVIDERS.orange_money;
  const destination = paymentMethods[meta.destinationKey] || '';
  const estimate = useMemo(() => estimateCredit(scanResult, nslRate), [scanResult, nslRate]);
  const submittedEstimate = useMemo(() => estimateCredit(submittedReceipt, nslRate), [submittedReceipt, nslRate]);
  const validation = useMemo(() => validateDepositReceipt(scanResult || {}), [scanResult]);
  const canRetrySubmit = Boolean(screenshot && scanResult && validation.valid && scanStatus === 'ready');
  const isBusy = scanStatus === 'scanning' || scanStatus === 'submitting';

  useEffect(() => {
    if (isInitializing) return;
    if (!user) router.push('/login');
  }, [user, isInitializing, router]);

  useEffect(() => {
    api.get('/finance/nsl-rate')
      .then(({ data }) => setNslRate(parseFloat(data.nsl_per_usdt) || DEFAULT_NSL_RATE))
      .catch(() => {});

    api.get('/deposit/payment-methods')
      .then(({ data }) => setPaymentMethods(data.data || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const resetScan = useCallback(() => {
    scanRunRef.current += 1;
    setScreenshot(null);
    setScreenshotPreview(null);
    setScanResult(null);
    setScanErrors([]);
    setSubmitError('');
    setScanStatus('idle');
  }, []);

  const scanReceiptImage = async (file, selectedProvider) => {
    const { createWorker } = await import('tesseract.js');
    let worker;
    try {
      worker = await createWorker('eng');
      const recognize = async (imageSource) => {
        const { data: { text } } = await worker.recognize(imageSource);
        return text || '';
      };

      const texts = [await recognize(file)];
      const initialReceipt = sanitizeReceiptSubmission({ ocr_text: texts[0], provider: selectedProvider });

      if (receiptNeedsEnhancedScan(initialReceipt)) {
        const variants = await createOcrImageVariants(file);
        for (const variant of variants) {
          texts.push(await recognize(variant));
          const receipt = sanitizeReceiptSubmission({ ocr_text: texts.join('\n'), provider: selectedProvider });
          if (!receiptNeedsEnhancedScan(receipt)) break;
        }
      }

      return texts.join('\n');
    } finally {
      if (worker) await worker.terminate().catch(() => {});
    }
  };

  const submitScannedDeposit = useCallback(async (file, receipt, runId = scanRunRef.current) => {
    const checked = validateDepositReceipt(receipt);
    setScanErrors(checked.errors);
    if (!checked.valid) {
      setScanStatus('ready');
      return;
    }

    setSubmitError('');
    setScanStatus('submitting');
    try {
      const form = new FormData();
      form.append('screenshot', file);
      form.append('provider', receipt.provider);
      form.append('amount', String(receipt.amount));
      form.append('currency', receipt.currency);
      form.append('reference_id', receipt.reference_id);
      form.append('sender_number', receipt.sender_number || '');
      form.append('receiver_number', receipt.receiver_number || '');
      form.append('timestamp_receipt', receipt.timestamp_receipt || '');
      await api.post('/orange-money/manual-deposit', form);
      if (runId !== scanRunRef.current) return;
      setSubmittedReceipt(receipt);
      setSubmitted(true);
    } catch (err) {
      if (runId !== scanRunRef.current) return;
      const message = err.response?.data?.message || 'Submission failed. Try again.';
      setSubmitError(message);
      setScanStatus('ready');
      toast.error(message);
    }
  }, []);

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || isBusy) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
    if (!IMAGE_TYPES.has(file.type) || !allowedExt) {
      toast.error('Only JPG, PNG, WEBP, or GIF receipts are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Max file size is 10MB');
      return;
    }

    const runId = scanRunRef.current + 1;
    scanRunRef.current = runId;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setScanResult(null);
    setScanErrors([]);
    setSubmitError('');
    setScanStatus('scanning');

    try {
      const text = await scanReceiptImage(file, provider);
      if (runId !== scanRunRef.current) return;
      const receipt = sanitizeReceiptSubmission({ ocr_text: text, provider });
      const checked = validateDepositReceipt(receipt);
      setScanResult(receipt);
      setScanErrors(checked.errors);
      if (PROVIDERS[receipt.provider] && receipt.provider !== provider) setProvider(receipt.provider);

      if (!checked.valid) {
        setScanStatus('ready');
        toast.error('Receipt scan missed required details. Upload a clearer screenshot.');
        return;
      }

      toast.success('Receipt scanned');
      await submitScannedDeposit(file, receipt, runId);
    } catch {
      if (runId !== scanRunRef.current) return;
      setScanStatus('error');
      setScanErrors(['Receipt could not be scanned. Upload a clearer screenshot.']);
      toast.error('Could not scan the receipt screenshot.');
    }
  };

  const handleProviderChange = (key) => {
    if (isBusy || key === provider) return;
    setProvider(key);
    resetScan();
  };

  const copyDestination = async () => {
    if (!destination) return;
    await navigator.clipboard.writeText(destination);
    toast.success('Copied');
  };

  if (submitted) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Deposit Submitted</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your receipt is waiting for approval. Estimated credit after review is <strong style={{ color: '#10b981' }}>{Math.round(submittedEstimate.netNSL).toLocaleString()} NSL</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => router.push('/dashboard')} style={{ padding: '0.8rem 1.5rem', borderRadius: 12, fontWeight: 700, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.875rem' }}>
                Dashboard
              </button>
              <button onClick={() => router.push('/transactions')} style={{ padding: '0.8rem 1.5rem', borderRadius: 12, fontWeight: 700, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.875rem' }}>
                Transactions
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.48)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', letterSpacing: 0 }}>Deposit Funds</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.48)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Upload a clear Orange Money, Africell, or Binance receipt for finance review.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.45rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.25rem', marginBottom: '1.25rem' }}>
            {Object.entries(PROVIDERS).map(([key, item]) => (
              <button key={key} onClick={() => handleProviderChange(key)} disabled={isBusy} style={{
                minHeight: 44,
                padding: '0.55rem 0.35rem',
                borderRadius: 9,
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                border: 'none',
                background: provider === key ? item.bg : 'transparent',
                color: provider === key ? item.accent : 'rgba(255,255,255,0.48)',
                transition: 'all 0.15s',
                opacity: isBusy && provider !== key ? 0.45 : 1,
              }}>{item.short}</button>
            ))}
          </div>

          <div style={{ ...S.card, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: '0.35rem' }}>{meta.destinationLabel}</p>
                <p style={{ color: destination ? meta.accent : 'rgba(255,255,255,0.45)', fontWeight: 900, fontSize: provider === 'binance' ? '0.88rem' : '1.2rem', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                  {destination || `${meta.label} destination not configured`}
                </p>
                {provider === 'binance' && paymentMethods.binance_network && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.42)', marginTop: '0.35rem' }}>{paymentMethods.binance_network}</p>
                )}
              </div>
              <button type="button" onClick={copyDestination} disabled={!destination} style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}`, color: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: destination ? 'pointer' : 'not-allowed', opacity: destination ? 1 : 0.45 }} title="Copy">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={S.label}>Receipt Screenshot</label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                minHeight: 176,
                padding: '1.1rem',
                borderRadius: 12,
                cursor: isBusy ? 'wait' : 'pointer',
                background: screenshot ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border: `2px dashed ${screenshot ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`,
                opacity: isBusy ? 0.78 : 1,
              }}>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleScreenshot} disabled={isBusy} style={{ display: 'none' }} />
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Receipt preview" style={{ maxHeight: 170, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                ) : (
                  <>
                    <Upload size={26} color="rgba(255,255,255,0.42)" />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', fontWeight: 800 }}>Upload receipt to scan</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>JPG, PNG, WEBP, or GIF · max 10MB</span>
                  </>
                )}
              </label>
              {screenshot && !isBusy && (
                <button type="button" onClick={resetScan} style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Remove and re-upload
                </button>
              )}
            </div>

            <StatusPanel status={scanStatus} errors={scanErrors} submitError={submitError} scanResult={scanResult} accent={meta.border} />

            {scanResult && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.95rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <DetailRow label="Provider" value={providerLabel(scanResult.provider)} accent={PROVIDERS[scanResult.provider]?.accent || meta.accent} />
                <DetailRow label="Amount found" value={formatAmountLabel(scanResult.amount, scanResult.currency)} />
                <DetailRow label={isMobileProvider(scanResult.provider) ? 'Payment number' : 'Binance ID'} value={scanResult.sender_number || scanResult.receiver_number || scanResult.reference_id} />
                <DetailRow label="Reference" value={scanResult.reference_id} />
                {scanResult.timestamp_receipt && <DetailRow label="Receipt time" value={scanResult.timestamp_receipt} />}
                {validation.valid && (
                  <>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />
                    <DetailRow label="Deposit fee" value={`${Math.round(estimate.feeNSL).toLocaleString()} NSL`} accent="#f87171" />
                    <DetailRow label="Estimated credit" value={`${Math.round(estimate.netNSL).toLocaleString()} NSL ≈ $${estimate.netUsdt.toFixed(2)}`} accent="#10b981" />
                  </>
                )}
              </div>
            )}

            <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.30)', borderRadius: 12, padding: '0.8rem', marginTop: '1rem', display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', lineHeight: 1.45 }}>
                Finance approves only after matching the scanned reference with the received payment message. Receipt images are cleaned before storage.
              </p>
            </div>

            {canRetrySubmit && (
              <button type="button" onClick={() => submitScannedDeposit(screenshot, scanResult)} style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.875rem',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}>
                <RefreshCw size={15} /> Submit Scanned Receipt
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
