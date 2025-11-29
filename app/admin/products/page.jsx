'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import Layout from '@/components/common/Layout';
import { Package, Edit, Power, Pause, DollarSign, TrendingUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function ManageProducts() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_NSL: '',
    daily_income_NSL: '',
    validity_days: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price_NSL: product.price_NSL,
      daily_income_NSL: product.daily_income_NSL,
      validity_days: product.validity_days,
      description: product.description,
      is_active: product.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/products/${editingProduct._id}`, formData);
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/toggle-active`, {
        is_active: !currentStatus
      });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleSuspend = async (productId) => {
    try {
      await api.patch(`/admin/products/${productId}/suspend`);
      toast.success('Product suspended successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to suspend product');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Products</h1>
          <p className="text-gray-600">Control and manage all VIP products</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
                product.is_active ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              {/* Product Header */}
              <div className={`p-6 ${product.is_active ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.is_active ? 'bg-white text-green-600' : 'bg-gray-600 text-white'
                  }`}>
                    {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Price (NSL):</span>
                  <span className="font-bold text-lg">{product.price_NSL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Daily Income:</span>
                  <span className="font-bold text-green-600">{product.daily_income_NSL} NSL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Validity:</span>
                  <span className="font-bold">{product.validity_days} days</span>
                </div>
                <p className="text-sm text-gray-600 pt-2 border-t">
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(product._id, product.is_active)}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      product.is_active
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span className="text-sm">{product.is_active ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleSuspend(product._id)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Suspend Product</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">Edit Product</h3>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (NSL)
                    </label>
                    <input
                      type="number"
                      value={formData.price_NSL}
                      onChange={(e) => setFormData({ ...formData, price_NSL: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Income (NSL)
                    </label>
                    <input
                      type="number"
                      value={formData.daily_income_NSL}
                      onChange={(e) => setFormData({ ...formData, daily_income_NSL: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity (days)
                  </label>
                  <input
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Product is Active
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
