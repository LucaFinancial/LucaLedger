/**
 * Key Manager for handling DEK in memory and session tokens
 * DEK is kept in memory during active session
 * Session tokens store wrapped DEK for "stay logged in" functionality
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
const SESSION_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

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
  await storeMetadata('encryptionEnabled', true);

  // Set active DEK in memory
  setActiveDEK(dek);

  let expiresAt = null;

  // Store session token for "stay logged in" functionality
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;

    // Wrap DEK with a random session key
    const sessionSalt = generateSalt();
    const sessionPassword = crypto.randomUUID();
    const sessionKWK = await deriveKeyFromPassword(
      sessionPassword,
      sessionSalt,
    );
    const { wrappedKey: sessionWrappedDEK, iv: sessionIV } = await wrapKey(
      dek,
      sessionKWK,
    );

    const sessionToken = {
      sessionWrappedDEK: arrayBufferToBase64(sessionWrappedDEK),
      sessionSalt: uint8ArrayToBase64(sessionSalt),
      sessionIV: uint8ArrayToBase64(sessionIV),
      sessionPassword,
      expiresAt,
    };
    sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
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

  // Store session token for "stay logged in" functionality
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;

    // Wrap DEK with a random session key
    const sessionSalt = generateSalt();
    const sessionPassword = crypto.randomUUID();
    const sessionKWK = await deriveKeyFromPassword(
      sessionPassword,
      sessionSalt,
    );
    const { wrappedKey: sessionWrappedDEK, iv: sessionIV } = await wrapKey(
      dek,
      sessionKWK,
    );

    const sessionToken = {
      sessionWrappedDEK: arrayBufferToBase64(sessionWrappedDEK),
      sessionSalt: uint8ArrayToBase64(sessionSalt),
      sessionIV: uint8ArrayToBase64(sessionIV),
      sessionPassword,
      expiresAt,
    };
    sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
  }

  return { dek, expiresAt };
}

/**
 * Restore session from sessionStorage token
 * Unwraps the DEK using session credentials
 * @returns {Promise<{dek: CryptoKey, expiresAt: number}|null>}
 */
export async function restoreSessionFromToken() {
  const tokenString = sessionStorage.getItem(SESSION_TOKEN_KEY);

  if (!tokenString) {
    return null;
  }

  try {
    const token = JSON.parse(tokenString);

    if (token.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return null;
    }

    if (!token.sessionWrappedDEK || !token.sessionPassword) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return null;
    }

    // Unwrap DEK using session credentials
    const sessionSalt = base64ToUint8Array(token.sessionSalt);
    const sessionWrappedDEK = base64ToArrayBuffer(token.sessionWrappedDEK);
    const sessionIV = base64ToUint8Array(token.sessionIV);

    const sessionKWK = await deriveKeyFromPassword(
      token.sessionPassword,
      sessionSalt,
    );

    const dek = await unwrapKey(sessionWrappedDEK, sessionIV, sessionKWK);

    setActiveDEK(dek);

    return { dek, expiresAt: token.expiresAt };
  } catch (error) {
    console.error('Failed to restore session from token:', error);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  }
}

/**
 * Check if a session token exists and is valid
 * @returns {boolean}
 */
export function hasValidSessionToken() {
  const tokenString = sessionStorage.getItem(SESSION_TOKEN_KEY);

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
 * Clear session token from sessionStorage
 */
export function clearSessionToken() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Logout - clear DEK from memory and session token
 */
export function logout() {
  clearActiveDEK();
  clearSessionToken();
}
