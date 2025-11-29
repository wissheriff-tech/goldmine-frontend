'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Loader } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/binance/exchange-rates');
      setCurrencies(response.data.rates);
    } catch (error) {
      toast.error('Failed to fetch currencies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsConverting(true);
      const response = await api.post('/binance/exchange-rates/convert', {
        amount: parseFloat(amount),
        from_currency: fromCurrency,
        to_currency: toCurrency
      });

      setConvertedAmount(response.data.to.amount);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  const getRate = () => {
    const from = currencies.find(c => c.currency_code === fromCurrency);
    const to = currencies.find(c => c.currency_code === toCurrency);

    if (!from || !to) return null;

    // Convert from -> USD -> to
    const usdAmount = parseFloat(amount) * from.usd_per_unit;
    const rate = usdAmount * to.rate_to_usd / parseFloat(amount);

    return rate;
  };

  const rate = getRate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Currency Converter</h2>

      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setConvertedAmount(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="0.00"
            />
            <select
              value={fromCurrency}
              onChange={(e) => {
                setFromCurrency(e.target.value);
                setConvertedAmount(null);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              {currencies.map((curr) => (
                <option key={curr.currency_code} value={curr.currency_code}>
                  {curr.currency_code} ({curr.currency_symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="bg-white hover:bg-gray-50 border-2 border-gray-300 p-3 rounded-full transition-all hover:scale-110"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={convertedAmount !== null ? convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : ''}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg font-semibold text-gray-800"
              placeholder="0.00"
            />
            <select
              value={toCurrency}
              onChange={(e) => {
                setToCurrency(e.target.value);
                setConvertedAmount(null);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              {currencies.map((curr) => (
                <option key={curr.currency_code} value={curr.currency_code}>
                  {curr.currency_code} ({curr.currency_symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {rate && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Exchange Rate</p>
            <p className="text-lg font-bold text-gray-800">
              1 {fromCurrency} = {rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {toCurrency}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              1 {toCurrency} = {(1 / rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {fromCurrency}
            </p>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={isConverting || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isConverting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Converting...
            </>
          ) : (
            'Convert'
          )}
        </button>
      </div>

      {/* Converted Result */}
      {convertedAmount !== null && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 mb-1">Conversion Result</p>
          <p className="text-2xl font-bold text-green-800">
            {parseFloat(amount).toLocaleString()} {fromCurrency} = {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {toCurrency}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Exchange rates are updated automatically every 4 hours from Binance. Actual transaction rates may vary slightly.
        </p>
      </div>
    </div>
  );
}
