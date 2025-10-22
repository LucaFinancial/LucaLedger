/**
 * Key Manager for handling DEK in memory and session tokens
 * DEK is kept in memory during active session
 * For "stay logged in", DEK is exported and stored in localStorage (security tradeoff)
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

  // If "stay logged in", store wrapped DEK with a separate session key
  // This is more secure than storing the raw DEK
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;

    // Create a session-specific DEK wrapping
    // We'll wrap the DEK with a fresh session key and store that key
    const sessionSalt = generateSalt();
    const sessionPassword = crypto.randomUUID(); // Random session password
    const sessionKWK = await deriveKeyFromPassword(
      sessionPassword,
      sessionSalt
    );
    const { wrappedKey: sessionWrappedDEK, iv: sessionIV } = await wrapKey(
      dek,
      sessionKWK
    );

    const sessionToken = {
      sessionWrappedDEK: arrayBufferToBase64(sessionWrappedDEK),
      sessionSalt: uint8ArrayToBase64(sessionSalt),
      sessionIV: uint8ArrayToBase64(sessionIV),
      sessionPassword, // Store the random session password
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

  // If "stay logged in", store wrapped DEK with a separate session key
  if (stayLoggedIn) {
    expiresAt = Date.now() + SESSION_DURATION;

    // Create a session-specific DEK wrapping
    const sessionSalt = generateSalt();
    const sessionPassword = crypto.randomUUID(); // Random session password
    const sessionKWK = await deriveKeyFromPassword(
      sessionPassword,
      sessionSalt
    );
    const { wrappedKey: sessionWrappedDEK, iv: sessionIV } = await wrapKey(
      dek,
      sessionKWK
    );

    const sessionToken = {
      sessionWrappedDEK: arrayBufferToBase64(sessionWrappedDEK),
      sessionSalt: uint8ArrayToBase64(sessionSalt),
      sessionIV: uint8ArrayToBase64(sessionIV),
      sessionPassword, // Store the random session password
      expiresAt,
    };
    localStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(sessionToken));
  }

  return { dek, expiresAt };
}

/**
 * Restore session from localStorage token (without password)
 * Unwraps the DEK using session credentials stored in the token
 * @returns {Promise<{dek: CryptoKey, expiresAt: number}|null>}
 */
export async function restoreSessionFromToken() {
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

    // Check if this is the new format with wrapped DEK
    if (token.sessionWrappedDEK && token.sessionPassword) {
      // New secure format: unwrap DEK using session credentials
      const sessionSalt = base64ToUint8Array(token.sessionSalt);
      const sessionWrappedDEK = base64ToArrayBuffer(token.sessionWrappedDEK);
      const sessionIV = base64ToUint8Array(token.sessionIV);

      // Derive session KWK from session password
      const sessionKWK = await deriveKeyFromPassword(
        token.sessionPassword,
        sessionSalt
      );

      // Unwrap the DEK
      const dek = await unwrapKey(sessionWrappedDEK, sessionIV, sessionKWK);

      // Set active DEK in memory
      setActiveDEK(dek);

      return { dek, expiresAt: token.expiresAt };
    }

    // Legacy format: raw DEK (for backward compatibility during transition)
    if (token.dek) {
      const dekRaw = base64ToArrayBuffer(token.dek);
      const dek = await crypto.subtle.importKey(
        'raw',
        dekRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Set active DEK in memory
      setActiveDEK(dek);

      return { dek, expiresAt: token.expiresAt };
    }

    // Unrecognized format
    localStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  } catch (error) {
    console.error('Failed to restore session from token:', error);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  }
}

/**
 * Try to restore session from localStorage token (legacy - still requires password)
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

    // New format: DEK is exported directly
    if (token.dek) {
      const dekRaw = base64ToArrayBuffer(token.dek);
      const dek = await crypto.subtle.importKey(
        'raw',
        dekRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      setActiveDEK(dek);
      return { dek, expiresAt: token.expiresAt };
    }

    // Old format: DEK is wrapped (still needs password)
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
