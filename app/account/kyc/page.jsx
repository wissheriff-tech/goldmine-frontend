'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { ArrowLeft, ShieldCheck, Upload, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const DOCS = [
  { field: 'id_front', label: 'ID Front', hint: "Front of your national ID, passport, or driver's licence", required: true },
  { field: 'id_back',  label: 'ID Back',  hint: "Back of your national ID or driver's licence",           required: false },
  { field: 'selfie',   label: 'Selfie',   hint: 'Clear photo of your face holding your ID document',      required: true },
  { field: 'additional', label: 'Additional', hint: 'Any supporting document (utility bill, bank statement…)', required: false },
];

function FileSlot({ doc, file, preview, onChange, onClear }) {
  const ref = useRef();
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {doc.label}
            {doc.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{doc.hint}</p>
        </div>
        {file && (
          <button onClick={onClear} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {preview ? (
        <div className="relative">
          <img src={preview} alt={doc.label} className="w-full h-36 object-cover rounded-lg border border-gray-200" />
          <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Ready
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-6 text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-colors cursor-pointer"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs">Click to upload</span>
          <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5 MB</span>
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}

export default function KYCPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(null);
  const [files, setFiles] = useState({ id_front: null, id_back: null, selfie: null, additional: null });
  const [previews, setPreviews] = useState({ id_front: null, id_back: null, selfie: null, additional: null });
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
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
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
      const { data } = await api.post('/user/kyc/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Documents submitted! We'll review them within 24-48 hours.");
      setKycStatus(data);
      setFiles({ id_front: null, id_back: null, selfie: null, additional: null });
      setPreviews({ id_front: null, id_back: null, selfie: null, additional: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  const verified = kycStatus?.kyc_verified;
  const hasDocs = kycStatus?.documents
    ? Object.values(kycStatus.documents).some(Boolean)
    : false;

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.push('/account')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Identity Verification (KYC)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submit your identity documents to unlock full platform access.
          </p>
        </div>

        {/* Status banner */}
        {verified ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Identity Verified</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your documents have been reviewed and your identity is confirmed.
              </p>
            </div>
          </div>
        ) : hasDocs ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
            <Clock className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Documents Under Review</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                We received your documents and are reviewing them. This usually takes 24–48 hours.
                You can resubmit below to replace them.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Verification Required</p>
              <p className="text-sm text-orange-700 mt-0.5">
                Upload your identity documents to complete KYC. Fields marked <span className="text-red-500 font-bold">*</span> are required.
              </p>
            </div>
          </div>
        )}

        {/* Upload form — always shown so user can resubmit */}
        {!verified && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">
              {hasDocs ? 'Resubmit Documents' : 'Upload Documents'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOCS.map(doc => (
                <FileSlot
                  key={doc.field}
                  doc={doc}
                  file={files[doc.field]}
                  preview={previews[doc.field]}
                  onChange={e => handleFile(doc.field, e)}
                  onClear={() => handleClear(doc.field)}
                />
              ))}
            </div>

            <p className="text-xs text-gray-400">
              Accepted formats: JPG, PNG, WEBP · Max 5 MB per file ·
              Make sure documents are clearly readable and not expired.
            </p>

            <button
              type="submit"
              disabled={isLoading || (!files.id_front && !files.selfie)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {isLoading ? 'Uploading…' : 'Submit for Review'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
