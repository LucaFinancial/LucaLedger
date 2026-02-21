/**
 * Key Manager for handling DEK in memory
 * DEK is kept in memory during the active app session
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
 * @returns {Promise<{dek: CryptoKey}>}
 */
export async function initializeEncryption(password) {
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

  return { dek };
}

/**
 * Unlock encryption with password
 * Derives KWK from password and unwraps DEK
 * @param {string} password - User password
 * @returns {Promise<{dek: CryptoKey}>}
 */
export async function unlockEncryption(password) {
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

  return { dek };
}

/**
 * Logout - clear DEK from memory
 */
export function logout() {
  clearActiveDEK();
}
