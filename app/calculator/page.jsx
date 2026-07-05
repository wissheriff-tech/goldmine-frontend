'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, TrendingUp, Calendar, Coins } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';

function fmtNSL(n) { return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }); }

const DURATIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '180 days', days: 180 },
  { label: '365 days', days: 365 },
];

export default function CalculatorPage() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      const list = data.products || data || [];
      setProducts(list);
      if (list.length > 0) setSelectedProduct(list[0]);
    } catch { /* products failed to load */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchProducts();
  }, [user?.id, isInitializing, router, fetchProducts]);

  const activeDays = customDays ? parseInt(customDays) || 0 : days;
  const dailyIncome = selectedProduct ? parseFloat(selectedProduct.daily_income_NSL || 0) : 0;
  const totalIncome = dailyIncome * activeDays;
  const cost = selectedProduct ? parseFloat(selectedProduct.price_NSL || 0) : 0;
  const roi = cost > 0 ? ((totalIncome / cost) * 100).toFixed(1) : 0;
  const breakEvenDays = dailyIncome > 0 ? Math.ceil(cost / dailyIncome) : null;

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} color="#a78bfa" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Profit Calculator</h1>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>Estimate your earnings before investing</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Spinner /></div>
          ) : (
            <>
              {/* Plan selector */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Plan</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {products.map(p => (
                    <button key={p.id} onClick={() => setSelectedProduct(p)} style={{
                      background: selectedProduct?.id === p.id ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedProduct?.id === p.id ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12, padding: '0.75rem 1rem', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s',
                    }}>
                      <div>
                        <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                          Cost: {fmtNSL(p.price_NSL)} NSL · {p.duration_days}d plan
                        </p>
                      </div>
                      <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>+{fmtNSL(p.daily_income_NSL)}/day</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration picker */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {DURATIONS.map(d => (
                    <button key={d.days} onClick={() => { setDays(d.days); setCustomDays(''); }} style={{
                      padding: '0.35rem 0.8rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                      background: !customDays && days === d.days ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                      color: !customDays && days === d.days ? '#fff' : 'rgba(255,255,255,0.45)',
                      transition: 'all 0.15s',
                    }}>{d.label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number" min="1" max="3650" placeholder="Custom days..."
                    value={customDays} onChange={e => setCustomDays(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>days</span>
                </div>
              </div>

              {/* Results */}
              {selectedProduct && activeDays > 0 && (
                <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 16, padding: '1.25rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Returns</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <ResultCard Icon={Coins} label="Daily Income" value={`${fmtNSL(dailyIncome)} NSL`} color="#fbbf24" />
                    <ResultCard Icon={TrendingUp} label="Total Income" value={`${fmtNSL(totalIncome)} NSL`} color="#34d399" big />
                    <ResultCard Icon={Calendar} label="Duration" value={`${activeDays} days`} color="#60a5fa" />
                    <ResultCard Icon={TrendingUp} label="ROI" value={`${roi}%`} color="#a78bfa" />
                  </div>
                  {breakEvenDays !== null && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, textAlign: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
                        Break-even in <span style={{ color: '#34d399', fontWeight: 700 }}>{breakEvenDays} days</span>
                        {activeDays >= breakEvenDays
                          ? <span style={{ color: '#34d399' }}> ✓ Profitable</span>
                          : <span style={{ color: '#fbbf24' }}> (not yet reached)</span>}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}

function ResultCard({ Icon, label, value, color, big }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <Icon size={13} color={color} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 600 }}>{label}</p>
      </div>
      <p style={{ color, fontSize: big ? '1.1rem' : '0.95rem', fontWeight: 800 }}>{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: 'spin 1s linear infinite' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" />
      <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
