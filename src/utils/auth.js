/**
 * Authentication storage and token management utilities.
 * Handles unified access and sync between 'token' and 'tux_token' storage keys.
 */

const TOKEN_KEY = 'token';
const LEGACY_TOKEN_KEY = 'tux_token';
const USER_KEY = 'tux_user';

/**
 * Retrieves the stored auth token, checking both 'token' and 'tux_token'.
 * Automatically keeps both keys in sync in localStorage.
 *
 * @returns {string} The JWT string or empty string if not found.
 */
export function getStoredToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '';
    if (token) {
      if (!localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      if (!localStorage.getItem(LEGACY_TOKEN_KEY)) {
        localStorage.setItem(LEGACY_TOKEN_KEY, token);
      }
    }
    return token;
  } catch {
    return '';
  }
}

/**
 * Persists the auth token under both storage keys.
 * If null/empty is passed, removes both keys.
 *
 * @param {string|null} token
 */
export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  } catch {
    // storage unavailable
  }
}

/**
 * Clears all user session and token data from localStorage.
 */
export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // storage unavailable
  }
}

