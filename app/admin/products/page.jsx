'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Package, Edit, Power, X, TrendingUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

const BG = 'linear-gradient(145deg, oklch(0.18 0.26 295) 0%, oklch(0.10 0.20 270) 45%, oklch(0.14 0.22 245) 100%)';
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '0.3rem' };

export default function ManageProducts() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [products, setProducts]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [togglingId, setTogglingId]   = useState(null);
  const [formData, setFormData] = useState({ price_NSL: '', daily_income_NSL: '', validity_days: '', description: '' });

  useEffect(() => {
    if (isInitializing) return;
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) { router.push('/dashboard'); return; }
    fetchProducts();
  }, [user?.id, isInitializing, router]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?include_inactive=true');
      setProducts(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load products'); }
    finally { setIsLoading(false); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ price_NSL: product.price_NSL, daily_income_NSL: product.daily_income_NSL, validity_days: product.validity_days, description: product.description });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/products/${editingProduct.id}`, {
        price_NSL: parseFloat(formData.price_NSL),
        daily_income_NSL: parseFloat(formData.daily_income_NSL),
        validity_days: parseInt(formData.validity_days),
        description: formData.description,
      });
      toast.success(`${editingProduct.name} updated`);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (product) => {
    setTogglingId(product.id);
    try {
      await api.patch(`/products/${product.id}`, { active: !product.active });
      toast.success(`${product.name} ${!product.active ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch { toast.error('Failed to update status');
    } finally { setTogglingId(null); }
  };

  if (isLoading) {
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

  const totalReturn = (p) => ((parseFloat(formData.daily_income_NSL) || 0) * (parseInt(formData.validity_days) || 0)).toLocaleString();

  return (
    <Layout>
      {/* Edit modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 440, background: 'rgba(10,6,25,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: 'rgba(124,58,237,0.3)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>Editing</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{editingProduct.name}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 0 }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Price (NSL)</label>
                  <input type="number" min="1" required value={formData.price_NSL} onChange={e => setFormData(f => ({ ...f, price_NSL: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Daily Income (NSL)</label>
                  <input type="number" min="0.01" step="0.01" required value={formData.daily_income_NSL} onChange={e => setFormData(f => ({ ...f, daily_income_NSL: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Validity (days)</label>
                <input type="number" min="1" required value={formData.validity_days} onChange={e => setFormData(f => ({ ...f, validity_days: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={3} required value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={14} color="#60a5fa" />
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Total return:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa' }}>{totalReturn()} NSL</span>
              </div>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: BG, padding: '2rem 1rem 3rem', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'oklch(0.62 0.19 295 / .09)', filter: 'blur(100px)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'oklch(0.55 0.18 240 / .07)', filter: 'blur(90px)', bottom: -80, left: -60 }} />
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.push('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            <ArrowLeft size={15} /> Admin Panel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Manage Products</h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Control and configure all VIP plans</p>
            </div>
            <div style={{ display: 'flex', gap: '0.875rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> {products.filter(p => p.active).length} active
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} /> {products.filter(p => !p.active).length} inactive
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {products.map(product => (
              <div key={product.id} style={{
                background: product.active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${product.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, overflow: 'hidden', opacity: product.active ? 1 : 0.65,
              }}>
                <div style={{ padding: '0.875rem 1rem', background: product.active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', borderBottom: `1px solid ${product.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={16} color={product.active ? '#10b981' : 'rgba(255,255,255,0.3)'} />
                    <p style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{product.name}</p>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 20, background: product.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)', color: product.active ? '#10b981' : 'rgba(255,255,255,0.4)', border: `1px solid ${product.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                    {product.active ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    ['Price',        `${Number(product.price_NSL).toLocaleString()} NSL`, '#fff'],
                    ['Daily Income', `${product.daily_income_NSL} NSL`, '#10b981'],
                    ['Validity',     `${product.validity_days} days`, '#fff'],
                    ['Total Return', `${(product.daily_income_NSL * product.validity_days).toLocaleString()} NSL`, '#60a5fa'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color }}>{value}</span>
                    </div>
                  ))}
                  {product.description && (
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', lineHeight: 1.5 }}>{product.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button onClick={() => handleEdit(product)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.6rem', borderRadius: 9, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleToggleActive(product)} disabled={togglingId === product.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.6rem', borderRadius: 9, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: togglingId === product.id ? 0.5 : 1, background: product.active ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${product.active ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, color: product.active ? '#f87171' : '#10b981' }}>
                      <Power size={13} /> {togglingId === product.id ? '…' : product.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  );
}
