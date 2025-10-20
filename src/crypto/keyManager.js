/**
 * Key Manager for handling DEK in memory and session tokens
 * DEK is kept in memory during active session
 * Wrapped DEK can be stored in localStorage for "stay logged in" feature
 */

import {
  generateSalt,
  generateDataEncryptionKey,
  deriveKeyFromPassword,
  wrapKey,
  unwrapKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './encryption';
import { storeMetadata, getMetadata } from './database';

const SESSION_TOKEN_KEY = 'encryptionSessionToken';
const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

// In-memory storage for the active DEK
let activeDEK = null;

/**
 * Get the active DEK from memory
 * @returns {CryptoKey|null}
 */
export function getActiveDEK() {
  return activeDEK;
}

/**
 * Set the active DEK in memory
 * @param {CryptoKey} dek
 */
export function setActiveDEK(dek) {
  activeDEK = dek;
}

/**
 * Clear the active DEK from memory
 */
export function clearActiveDEK() {
  activeDEK = null;
}

/**
 * Initialize encryption with a new password
 * Creates salt, derives KWK, generates DEK, and stores wrapped DEK
 * @param {string} password - User password
 * @param {boolean} stayLoggedIn - Whether to enable "stay logged in"
 * @returns {Promise<{dek: CryptoKey, expiresAt: number|null}>}
 */
export async function initializeEncryption(password, stayLoggedIn = false) {
  // Generate salt for PBKDF2
  const salt = generateSalt();

  // Derive KWK from password
  const kwk = await deriveKeyFromPassword(password, salt);

  // Generate new DEK
  const dek = await generateDataEncryptionKey();

  // Wrap DEK with KWK
  const { wrappedKey, iv } = await wrapKey(dek, kwk);

  // Store salt and wrapped DEK in IndexedDB metadata
  await storeMetadata('salt', uint8ArrayToBase64(salt));
  await storeMetadata('wrappedDEK', arrayBufferToBase64(wrappedKey));
  await storeMetadata('wrappedDEKIV', uint8ArrayToBase64(iv));

  // Set active DEK in memory
  setActiveDEK(dek);

  let expiresAt = null;

  // If "stay logged in", store session token in localStorage
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;
    const sessionToken = {
      wrappedDEK: arrayBufferToBase64(wrappedKey),
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      expiresAt,
    };
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
  }

  return { dek, expiresAt };
}

/**
 * Unlock encryption with password
 * Derives KWK from password and unwraps DEK
 * @param {string} password - User password
 * @param {boolean} stayLoggedIn - Whether to enable "stay logged in"
 * @returns {Promise<{dek: CryptoKey, expiresAt: number|null}>}
 */
export async function unlockEncryption(password, stayLoggedIn = false) {
  // Retrieve salt and wrapped DEK from IndexedDB
  const saltBase64 = await getMetadata('salt');
  const wrappedDEKBase64 = await getMetadata('wrappedDEK');
  const ivBase64 = await getMetadata('wrappedDEKIV');

  if (!saltBase64 || !wrappedDEKBase64 || !ivBase64) {
    throw new Error('Encryption metadata not found');
  }

  const salt = base64ToUint8Array(saltBase64);
  const wrappedDEK = base64ToArrayBuffer(wrappedDEKBase64);
  const iv = base64ToUint8Array(ivBase64);

  // Derive KWK from password
  const kwk = await deriveKeyFromPassword(password, salt);

  // Unwrap DEK
  const dek = await unwrapKey(wrappedDEK, iv, kwk);

  // Set active DEK in memory
  setActiveDEK(dek);

  let expiresAt = null;

  // If "stay logged in", store session token
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;
    const sessionToken = {
      wrappedDEK: wrappedDEKBase64,
      iv: ivBase64,
      salt: saltBase64,
      expiresAt,
    };
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
  }

  return { dek, expiresAt };
}

/**
 * Try to restore session from localStorage token
 * @param {string} password - User password
 * @returns {Promise<{dek: CryptoKey, expiresAt: number}|null>}
 */
export async function restoreSession(password) {
  const tokenString = localStorage.getItem(SESSION_TOKEN_KEY);

  if (!tokenString) {
    return null;
  }

  try {
    const token = JSON.parse(tokenString);

    // Check if token is expired
    if (token.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      return null;
    }

    const salt = base64ToUint8Array(token.salt);
    const wrappedDEK = base64ToArrayBuffer(token.wrappedDEK);
    const iv = base64ToUint8Array(token.iv);

    // Derive KWK from password
    const kwk = await deriveKeyFromPassword(password, salt);

    // Unwrap DEK
    const dek = await unwrapKey(wrappedDEK, iv, kwk);

    // Set active DEK in memory
    setActiveDEK(dek);

    return { dek, expiresAt: token.expiresAt };
  } catch (error) {
    console.error('Failed to restore session:', error);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  }
}

/**
 * Check if a session token exists and is valid
 * @returns {boolean}
 */
export function hasValidSessionToken() {
  const tokenString = localStorage.getItem(SESSION_TOKEN_KEY);

  if (!tokenString) {
    return false;
  }

  try {
    const token = JSON.parse(tokenString);
    return token.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Clear session token from localStorage
 */
export function clearSessionToken() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Logout - clear DEK from memory and session token
 */
export function logout() {
  clearActiveDEK();
  clearSessionToken();
}
