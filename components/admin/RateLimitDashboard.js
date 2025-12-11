'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function RateLimitDashboard() {
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [customIP, setCustomIP] = useState('');

  // Fetch rate limit info
  const fetchRateLimitInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/rate-limit-info');
      setRateLimitInfo(response.data);
    } catch (error) {
      console.error('Error fetching rate limit info:', error);
      toast.error('Failed to load rate limit information');
    } finally {
      setLoading(false);
    }
  };

  // Reset rate limits
  const handleResetLimits = async (targetIP = null) => {
    try {
      setResetting(true);
      const payload = targetIP ? { ip: targetIP } : {};
      const response = await api.post('/admin/reset-limits', payload);

      toast.success(response.data.message || 'Rate limits reset requested');

      // Show detailed info
      if (response.data.info) {
        setTimeout(() => {
          toast(response.data.info, { icon: 'ℹ️', duration: 5000 });
        }, 500);
      }

      // Clear custom IP input
      setCustomIP('');
    } catch (error) {
      console.error('Error resetting rate limits:', error);
      toast.error(error.response?.data?.message || 'Failed to reset rate limits');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchRateLimitInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Rate Limit Dashboard</h2>
              <p className="text-sm text-gray-600">Manage API rate limits and restrictions</p>
            </div>
          </div>
          <button
            onClick={fetchRateLimitInfo}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Current IP Info */}
        {rateLimitInfo?.currentIP && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Your Current IP Address</p>
                <p className="text-blue-700 font-mono">{rateLimitInfo.currentIP}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limiters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rateLimitInfo?.limiters?.map((limiter, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{limiter.name}</h3>
                <p className="text-sm text-gray-600">{limiter.description}</p>
              </div>
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            </div>

            <div className="space-y-3">
              {/* Window Time */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time Window:</span>
                <span className="font-semibold text-gray-800">{limiter.window}</span>
              </div>

              {/* Max Requests */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Max Requests:</span>
                <span className="font-semibold text-green-600">{limiter.maxRequests}</span>
              </div>

              {/* Auto Reset */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Auto Reset:</span>
                <span className="font-semibold text-blue-600">{limiter.autoResetTime}</span>
              </div>

              {/* Special Features */}
              {limiter.skipSuccessful && (
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">Skips successful requests</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Reset Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 mb-1">Automatic Reset</p>
            <p className="text-sm text-yellow-800">
              {rateLimitInfo?.note || 'Rate limits automatically reset after their configured window time. Manual reset is logged but limits will auto-expire anyway.'}
            </p>
          </div>
        </div>
      </div>

      {/* Reset Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Reset Actions</h3>

        {/* Reset Current IP */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Reset Your IP</p>
                <p className="text-sm text-gray-600">Reset rate limits for your current IP address</p>
              </div>
              <button
                onClick={() => handleResetLimits()}
                disabled={resetting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset My Limits</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reset Specific IP */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <p className="font-semibold text-gray-800 mb-1">Reset Specific IP</p>
              <p className="text-sm text-gray-600">Reset rate limits for a specific IP address</p>
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customIP}
                onChange={(e) => setCustomIP(e.target.value)}
                placeholder="e.g., 192.168.1.100"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleResetLimits(customIP)}
                disabled={!customIP || resetting}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {resetting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset IP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Important Note</p>
              <p className="text-sm text-red-800">
                Rate limits will auto-expire after their configured time window. The reset button logs your request but limits reset automatically.
                Only use this if you understand the implications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
