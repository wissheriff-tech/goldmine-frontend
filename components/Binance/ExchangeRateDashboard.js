'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Edit2, Check, X, Loader } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function ExchangeRateDashboard() {
  const { user } = useAuthStore();
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [overrideData, setOverrideData] = useState({ rate: '', reason: '' });

  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/binance/exchange-rates');
      setRates(response.data.rates);
    } catch (error) {
      toast.error('Failed to fetch exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllRates = async () => {
    try {
      setIsUpdating(true);
      const response = await api.post('/binance/exchange-rates/update');
      toast.success(`Updated ${response.data.updated} exchange rates`);
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update rates');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetOverride = async (currencyCode) => {
    if (!overrideData.rate || parseFloat(overrideData.rate) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    try {
      await api.post(`/binance/exchange-rates/${currencyCode}/override`, {
        rate: parseFloat(overrideData.rate),
        reason: overrideData.reason || 'Manual rate adjustment',
        use_override: true
      });

      toast.success('Exchange rate override set successfully');
      setEditingCurrency(null);
      setOverrideData({ rate: '', reason: '' });
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set override');
    }
  };

  const handleRemoveOverride = async (currencyCode) => {
    try {
      await api.post(`/binance/exchange-rates/${currencyCode}/override`, {
        use_override: false
      });

      toast.success('Reverted to Binance rate');
      fetchRates();
    } catch (error) {
      toast.error('Failed to remove override');
    }
  };

  const startEditing = (rate) => {
    setEditingCurrency(rate.currency_code);
    setOverrideData({
      rate: rate.admin_override_rate || rate.rate_to_usd,
      reason: ''
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exchange Rates</h2>
          <p className="text-sm text-gray-600">Live currency exchange rates</p>
        </div>

        {isAdmin && (
          <button
            onClick={updateAllRates}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update from Binance'}
          </button>
        )}
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => (
          <div
            key={rate.currency_code}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rate.currency_symbol}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{rate.currency_code}</h3>
                  <p className="text-xs text-gray-500">{rate.currency_name}</p>
                </div>
              </div>

              {rate.source === 'admin' && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  Manual
                </span>
              )}
              {rate.source === 'binance' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Live
                </span>
              )}
            </div>

            {/* Rates Display */}
            {editingCurrency === rate.currency_code ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Custom Rate (1 USD =)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={overrideData.rate}
                    onChange={(e) => setOverrideData({ ...overrideData, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter rate"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Reason (Optional)</label>
                  <input
                    type="text"
                    value={overrideData.reason}
                    onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Market adjustment"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetOverride(rate.currency_code)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCurrency(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">1 USD =</span>
                    <span className="text-lg font-bold text-gray-800">
                      {rate.rate_to_usd.toLocaleString()} {rate.currency_code}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">1 {rate.currency_code} =</span>
                    <span className="text-lg font-bold text-gray-800">
                      ${rate.usd_per_unit.toFixed(6)} USD
                    </span>
                  </div>
                </div>

                {rate.last_update && (
                  <p className="text-xs text-gray-500 mt-2">
                    Updated: {new Date(rate.last_update).toLocaleString()}
                  </p>
                )}

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEditing(rate)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Override
                    </button>

                    {rate.source === 'admin' && (
                      <button
                        onClick={() => handleRemoveOverride(rate.currency_code)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm py-2 rounded-lg flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Revert
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {rates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No exchange rates available</p>
          <p className="text-sm mt-2">Contact your administrator to seed currencies</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">About Exchange Rates</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Live:</strong> Rates automatically updated from Binance every 4 hours</li>
          <li>• <strong>Manual:</strong> Custom rates set by administrators for local market adjustments</li>
          {isAdmin && <li>• <strong>Override:</strong> Click "Override" to set a custom rate for any currency</li>}
        </ul>
      </div>
    </div>
  );
}
