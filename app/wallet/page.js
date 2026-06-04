'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

export default function DepositPage() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [form, setForm] = useState({ amount: '', txid: '', notes: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/deposit/wallet-info').then(r => setWalletInfo(r.data.data)).catch(console.error);
    api.get('/deposit/my').then(r => setHistory(r.data.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ ...status, error: 'Please attach your receipt image.' });
    setStatus({ loading: true, success: '', error: '' });

    const fd = new FormData();
    fd.append('receipt', file);
    fd.append('amount', form.amount);
    fd.append('txid', form.txid);
    fd.append('notes', form.notes);

    try {
      await api.post('/deposit/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ loading: false, success: 'Deposit submitted! Admin will credit your account shortly.', error: '' });
      setForm({ amount: '', txid: '', notes: '' });
      setFile(null);
      const r = await api.get('/deposit/my');
      setHistory(r.data.data);
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.response?.data?.message || 'Submission failed.' });
    }
  };

  const statusBadge = (s) => {
    const map = { pending: 'bg-yellow-800 text-yellow-200', approved: 'bg-green-800 text-green-200', rejected: 'bg-red-800 text-red-200', reviewing: 'bg-blue-800 text-blue-200' };
    return map[s] || 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-6 px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>

      {walletInfo && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-4">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Step 1 — Send USDT</p>
          <p className="text-gray-300 text-sm">{walletInfo.instructions}</p>

          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500">Network</p>
            <p className="text-purple-300 font-semibold">{walletInfo.network}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-green-400 text-sm break-all flex-1">{walletInfo.wallet_address || 'Contact admin for wallet address'}</code>
              {walletInfo.wallet_address && (
                <button onClick={() => navigator.clipboard.writeText(walletInfo.wallet_address)} className="text-xs text-gray-400 hover:text-white shrink-0">
                  Copy
                </button>
              )}
            </div>
          </div>

          {walletInfo.qr_code && (
            <div className="flex justify-center">
              <img src={walletInfo.qr_code} alt="Deposit QR Code" className="w-40 h-40 rounded-xl border border-gray-600" />
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-4">Step 2 — Submit Proof</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Amount (USDT)</label>
            <input
              type="number" min="1" step="0.01" required
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Transaction ID / TxHash (optional)</label>
            <input
              type="text"
              value={form.txid} onChange={e => setForm({ ...form, txid: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
              placeholder="Paste transaction hash"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Receipt Screenshot</label>
            <input
              type="file" accept="image/*" required
              onChange={e => setFile(e.target.files[0])}
              className="w-full text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Any additional info for the admin"
            />
          </div>

          {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
          {status.success && <p className="text-green-400 text-sm">{status.success}</p>}

          <button
            type="submit" disabled={status.loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {status.loading ? 'Submitting...' : 'Submit Deposit Proof'}
          </button>
        </form>
      </div>

      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-4">Deposit History</p>
          <div className="space-y-3">
            {history.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">${d.user_submitted_amount} USDT</p>
                  <p className="text-gray-500 text-xs">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(d.status)}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
