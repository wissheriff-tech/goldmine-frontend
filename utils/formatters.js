/**
 * Formatting Utilities
 * Functions for formatting currency, dates, numbers, etc.
 */

import { CURRENCY } from './constants';

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount, currency = 'NSL') => {
  if (amount === null || amount === undefined) return '0.00';

  const decimals = currency === 'NSL' ? CURRENCY.NSL_DECIMALS : CURRENCY.USDT_DECIMALS;
  const formatted = Number(amount).toFixed(decimals);

  // Add thousand separators
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const symbol = currency === 'NSL' ? CURRENCY.NSL_SYMBOL : CURRENCY.USDT_SYMBOL;
  return `${symbol} ${parts.join('.')}`;
};

/**
 * Format NSL amount
 */
export const formatNSL = (amount) => formatCurrency(amount, 'NSL');

/**
 * Format USDT amount
 */
export const formatUSDT = (amount) => formatCurrency(amount, 'USDT');

/**
 * Convert NSL to USDT
 */
export const nslToUsdt = (nslAmount) => {
  return Number(nslAmount) / CURRENCY.NSL_TO_USDT_RATE;
};

/**
 * Convert USDT to NSL
 */
export const usdtToNsl = (usdtAmount) => {
  return Number(usdtAmount) * CURRENCY.USDT_TO_NSL_RATE;
};

/**
 * Format date to readable string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => formatDate(date, true);

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format time remaining
 */
export const formatTimeRemaining = (endDate) => {
  if (!endDate) return 'N/A';

  const end = new Date(endDate);
  if (isNaN(end.getTime())) return 'Invalid Date';

  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  return 'Expires soon';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length (assuming international format)
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, -10);
    const areaCode = cleaned.slice(-10, -7);
    const firstPart = cleaned.slice(-7, -4);
    const secondPart = cleaned.slice(-4);

    return countryCode
      ? `+${countryCode} ${areaCode} ${firstPart} ${secondPart}`
      : `${areaCode} ${firstPart} ${secondPart}`;
  }

  return phone;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';

  const formatted = Number(num).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimals > 0 ? parts.join('.') : parts[0];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Truncate wallet address
 */
export const truncateAddress = (address) => {
  if (!address) return '';
  if (address.length <= 13) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '??';

  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Format VIP level display
 */
export const formatVIPLevel = (level) => {
  if (!level || level === 'none') return 'No VIP';
  return level.replace('VIP', 'VIP ');
};

/**
 * Format transaction status badge
 */
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    frozen: 'bg-red-100 text-red-800'
  };

  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Parse JSON safely
 */
export const safeJSONParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};
