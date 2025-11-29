/**
 * Frontend Constants
 * Centralized configuration values for the frontend application
 */

export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SalonMoney',
  COMPANY: process.env.NEXT_PUBLIC_COMPANY_NAME || 'SalonMoney Inc.',
  VERSION: '1.0.0'
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

export const AUTH_CONFIG = {
  TOKEN_KEY: 'salonmoney_token',
  USER_KEY: 'salonmoney_user',
  REMEMBER_ME_KEY: 'salonmoney_remember_me',
  TOKEN_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export const CURRENCY = {
  NSL_TO_USDT_RATE: 25,
  USDT_TO_NSL_RATE: 25,
  NSL_SYMBOL: 'NSL',
  USDT_SYMBOL: 'USDT',
  NSL_DECIMALS: 2,
  USDT_DECIMALS: 2
};

export const VIP_LEVELS = [
  { value: 'VIP1', label: 'VIP 1', color: 'text-gray-500' },
  { value: 'VIP2', label: 'VIP 2', color: 'text-green-500' },
  { value: 'VIP3', label: 'VIP 3', color: 'text-blue-500' },
  { value: 'VIP4', label: 'VIP 4', color: 'text-purple-500' },
  { value: 'VIP5', label: 'VIP 5', color: 'text-pink-500' },
  { value: 'VIP6', label: 'VIP 6', color: 'text-yellow-500' },
  { value: 'VIP7', label: 'VIP 7', color: 'text-orange-500' },
  { value: 'VIP8', label: 'VIP 8', color: 'text-red-500' },
  { value: 'VIP9', label: 'VIP 9', color: 'text-gradient-to-r from-purple-500 to-pink-500' }
];

export const TRANSACTION_TYPES = [
  { value: 'recharge', label: 'Recharge', icon: '💰', color: 'green' },
  { value: 'withdrawal', label: 'Withdrawal', icon: '💸', color: 'red' },
  { value: 'income', label: 'Daily Income', icon: '📈', color: 'blue' },
  { value: 'referral_bonus', label: 'Referral Bonus', icon: '🎁', color: 'purple' },
  { value: 'purchase', label: 'Product Purchase', icon: '🛒', color: 'orange' },
  { value: 'renewal', label: 'Auto Renewal', icon: '🔄', color: 'teal' }
];

export const TRANSACTION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { value: 'completed', label: 'Completed', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
];

export const USER_ROLES = [
  { value: 'user', label: 'User', color: 'gray' },
  { value: 'admin', label: 'Admin', color: 'blue' },
  { value: 'finance', label: 'Finance Admin', color: 'green' },
  { value: 'verificator', label: 'Verificator', color: 'purple' },
  { value: 'approval', label: 'Approval Admin', color: 'orange' },
  { value: 'superadmin', label: 'Super Admin', color: 'red' }
];

export const ACCOUNT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'frozen', label: 'Frozen', color: 'red' },
  { value: 'rejected', label: 'Rejected', color: 'gray' }
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  RECHARGE: '/recharge',
  WITHDRAW: '/withdraw',
  TRANSACTIONS: '/transactions',
  REFERRALS: '/referrals',
  ACCOUNT: '/account',
  ACCOUNT_SETTINGS: '/account/settings',
  ACCOUNT_PASSWORD: '/account/change-password',
  ACCOUNT_SECURITY: '/account/security',
  ADMIN: '/admin',
  FORGOT_PASSWORD: '/forgot-password'
};

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { name: 'Products', href: ROUTES.PRODUCTS, icon: 'Package' },
  { name: 'Recharge', href: ROUTES.RECHARGE, icon: 'Wallet' },
  { name: 'Withdraw', href: ROUTES.WITHDRAW, icon: 'ArrowDownToLine' },
  { name: 'Transactions', href: ROUTES.TRANSACTIONS, icon: 'Receipt' },
  { name: 'Referrals', href: ROUTES.REFERRALS, icon: 'Users' }
];

export const BINANCE_CONFIG = {
  SUPPORTED_NETWORKS: ['BSC', 'ETH', 'TRC20'],
  DEFAULT_NETWORK: 'BSC',
  MIN_CONFIRMATION_BLOCKS: 12
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PHONE_MIN_LENGTH: 7,
  PHONE_MAX_LENGTH: 15
};

export const TOAST_CONFIG = {
  DURATION: 3000, // 3 seconds
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 4000,
  POSITION: 'top-right'
};

export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  FULL: 'MMMM DD, YYYY HH:mm:ss'
};
