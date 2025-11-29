/**
 * Local Storage Utilities
 * Safe wrappers for localStorage operations with error handling
 */

import { AUTH_CONFIG } from './constants';

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get item from localStorage
 */
export const getItem = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable()) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 */
export const setItem = (key, value) => {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 */
export const removeItem = (key) => {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all localStorage
 */
export const clearAll = () => {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get authentication token
 */
export const getToken = () => {
  return getItem(AUTH_CONFIG.TOKEN_KEY);
};

/**
 * Set authentication token
 */
export const setToken = (token) => {
  return setItem(AUTH_CONFIG.TOKEN_KEY, token);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  return removeItem(AUTH_CONFIG.TOKEN_KEY);
};

/**
 * Get user data
 */
export const getUser = () => {
  return getItem(AUTH_CONFIG.USER_KEY);
};

/**
 * Set user data
 */
export const setUser = (user) => {
  return setItem(AUTH_CONFIG.USER_KEY, user);
};

/**
 * Remove user data
 */
export const removeUser = () => {
  return removeItem(AUTH_CONFIG.USER_KEY);
};

/**
 * Get remember me preference
 */
export const getRememberMe = () => {
  return getItem(AUTH_CONFIG.REMEMBER_ME_KEY, false);
};

/**
 * Set remember me preference
 */
export const setRememberMe = (remember) => {
  return setItem(AUTH_CONFIG.REMEMBER_ME_KEY, remember);
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
  return true;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

/**
 * Get item with expiration
 */
export const getItemWithExpiry = (key) => {
  if (!isLocalStorageAvailable()) return null;

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (item.expiry && now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error reading from localStorage with expiry (${key}):`, error);
    return null;
  }
};

/**
 * Set item with expiration (ttl in milliseconds)
 */
export const setItemWithExpiry = (key, value, ttl) => {
  if (!isLocalStorageAvailable()) return false;

  try {
    const now = new Date().getTime();
    const item = {
      value: value,
      expiry: ttl ? now + ttl : null
    };

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage with expiry (${key}):`, error);
    return false;
  }
};

/**
 * Get all keys in localStorage
 */
export const getAllKeys = () => {
  if (!isLocalStorageAvailable()) return [];

  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
};

/**
 * Get storage size (approximate)
 */
export const getStorageSize = () => {
  if (!isLocalStorageAvailable()) return 0;

  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

/**
 * Check if storage is nearly full (>80% of 5MB limit)
 */
export const isStorageNearlyFull = () => {
  const size = getStorageSize();
  const limit = 5 * 1024 * 1024; // 5MB (typical localStorage limit)
  return size > limit * 0.8;
};

export default {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  getRememberMe,
  setRememberMe,
  clearAuth,
  isAuthenticated,
  getItemWithExpiry,
  setItemWithExpiry,
  getAllKeys,
  getStorageSize,
  isStorageNearlyFull
};
