'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Package, Edit, Power, X, TrendingUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function ManageProducts() {
  const { user, isInitializing } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [formData, setFormData] = useState({
    price_NSL: '',
    daily_income_NSL: '',
    validity_days: '',
    description: '',
  });

  useEffect(() => {
    if (isInitializing) return;
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    fetchProducts();
  }, [user?.id, isInitializing, router]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?include_inactive=true');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      price_NSL: product.price_NSL,
      daily_income_NSL: product.daily_income_NSL,
      validity_days: product.validity_days,
      description: product.description,
    });
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product) => {
    setTogglingId(product.id);
    try {
      await api.patch(`/products/${product.id}`, { active: !product.active });
      toast.success(`${product.name} ${!product.active ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
              <p className="text-gray-500 mt-1">Control and manage all VIP products</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> {products.filter(p => p.active).length} active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> {products.filter(p => !p.active).length} inactive
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all
                ${product.active ? 'border-green-400' : 'border-gray-200 opacity-70'}`}
            >
              {/* Card Header */}
              <div className={`px-5 py-4 flex items-center justify-between
                ${product.active ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'}`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-white/80" />
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                  ${product.active ? 'bg-white text-green-700' : 'bg-gray-600 text-white'}`}>
                  {product.active ? 'ACTIVE' : 'OFF'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-bold text-gray-900">{product.price_NSL.toLocaleString()} NSL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daily Income</span>
                  <span className="font-bold text-green-600">{product.daily_income_NSL} NSL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Validity</span>
                  <span className="font-bold text-gray-900">{product.validity_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Return</span>
                  <span className="font-bold text-blue-600">{(product.daily_income_NSL * product.validity_days).toLocaleString()} NSL</span>
                </div>
                <p className="text-xs text-gray-400 pt-1 border-t border-gray-100 leading-relaxed">{product.description}</p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={togglingId === product.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50
                      ${product.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {togglingId === product.id ? '...' : product.active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs uppercase tracking-wide">Editing</p>
                <h3 className="text-xl font-bold text-white">{editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (NSL)</label>
                  <input
                    type="number" min="1" required
                    value={formData.price_NSL}
                    onChange={(e) => setFormData({ ...formData, price_NSL: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Income (NSL)</label>
                  <input
                    type="number" min="0.01" step="0.01" required
                    value={formData.daily_income_NSL}
                    onChange={(e) => setFormData({ ...formData, daily_income_NSL: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Validity (days)</label>
                <input
                  type="number" min="1" required
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3} required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Live preview */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Total return: <span className="font-bold text-blue-600">
                  {((parseFloat(formData.daily_income_NSL) || 0) * (parseInt(formData.validity_days) || 0)).toLocaleString()} NSL
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
