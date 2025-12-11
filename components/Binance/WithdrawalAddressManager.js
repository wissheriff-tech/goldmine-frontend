'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Clock, Loader, Shield } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function WithdrawalAddressManager({ userWallet, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '',
    network: 'BSC',
    currency: 'USDT',
    label: ''
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.address || !newAddress.network || !newAddress.currency) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/binance/wallet/withdrawal-address', newAddress);

      toast.success(response.data.message);
      setIsAdding(false);
      setNewAddress({ address: '', network: 'BSC', currency: 'USDT', label: '' });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add withdrawal address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdrawalAddresses = userWallet?.withdrawal_addresses || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Withdrawal Addresses</h2>
          <p className="text-sm text-gray-600">Manage your verified withdrawal addresses</p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Add Address Form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Withdrawal Address</h3>

          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={newAddress.currency}
                  onChange={(e) => setNewAddress({ ...newAddress, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USDT">USDT - Tether</option>
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="BNB">BNB - Binance Coin</option>
                  <option value="BUSD">BUSD - Binance USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network *
                </label>
                <select
                  value={newAddress.network}
                  onChange={(e) => setNewAddress({ ...newAddress, network: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BSC">BSC - Binance Smart Chain</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="TRC20">TRC20 - Tron</option>
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="POLYGON">POLYGON - Polygon</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Address *
              </label>
              <input
                type="text"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                placeholder="0x... or wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label (Optional)
              </label>
              <input
                type="text"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                placeholder="My USDT Wallet"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Withdrawal addresses must be verified by Super Admin before you can use them. Double-check your address to avoid delays.
            </p>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {withdrawalAddresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No withdrawal addresses added yet</p>
            <p className="text-sm mt-1">Add your first withdrawal address to get started</p>
          </div>
        ) : (
          withdrawalAddresses.map((addr, index) => (
            <div
              key={index}
              className={`border-2 ${
                addr.verified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
              } rounded-lg p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {addr.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      addr.verified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {addr.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>

                  {addr.label && (
                    <p className="font-semibold text-gray-800 mb-1">{addr.label}</p>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      {addr.currency}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                      {addr.network}
                    </span>
                  </div>

                  <p className="font-mono text-sm text-gray-700 break-all">
                    {addr.address}
                  </p>

                  {addr.verified && addr.verified_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Verified on {new Date(addr.verified_at).toLocaleDateString()}
                    </p>
                  )}

                  {!addr.verified && (
                    <p className="text-xs text-yellow-700 mt-2">
                      Added on {new Date(addr.added_at).toLocaleDateString()} - Awaiting Super Admin verification
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-sm font-semibold text-red-800 mb-2">Security Notice</h3>
        <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
          <li>Only add addresses you control and have verified</li>
          <li>Double-check the address and network before submitting</li>
          <li>Wrong addresses can result in permanent loss of funds</li>
          <li>All withdrawal addresses require Super Admin verification</li>
        </ul>
      </div>
    </div>
  );
}
