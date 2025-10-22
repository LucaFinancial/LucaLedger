/**
 * Encryption utilities using Web Crypto API
 * Implements AES-GCM encryption with per-record IVs
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum
const SALT_LENGTH = 16; // 128 bits

/**
 * Generate a cryptographically secure random password
 * Achieves ≥128-bit entropy with mixed character sets
 * @returns {string} Secure password
 */
export function generateSecurePassword() {
  // Using 24 characters from a set of 62 (uppercase, lowercase, numbers)
  // Entropy: log2(62^24) ≈ 143 bits
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < array.length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

/**
 * Generate a random salt for key derivation
 * @returns {Uint8Array} Random salt
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random initialization vector (IV) for encryption
 * @returns {Uint8Array} Random IV
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive a Key Wrapping Key (KWK) from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Key Wrapping Key (non-extractable)
 */
export async function deriveKeyFromPassword(password, salt) {
  const passwordBuffer = new TextEncoder().encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive KWK using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // non-extractable for security
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Generate a Data Encryption Key (DEK)
 * @returns {Promise<CryptoKey>} Data Encryption Key (extractable for wrapping)
 */
export async function generateDataEncryptionKey() {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable so it can be wrapped
    ['encrypt', 'decrypt']
  );
}

/**
 * Wrap (encrypt) the DEK using the KWK
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {CryptoKey} kwk - Key Wrapping Key
 * @returns {Promise<{wrappedKey: ArrayBuffer, iv: Uint8Array}>} Wrapped key and IV
 */
export async function wrapKey(dek, kwk) {
  const iv = generateIV();
  const wrappedKey = await crypto.subtle.wrapKey('raw', dek, kwk, {
    name: ALGORITHM,
    iv,
  });

  return { wrappedKey, iv };
}

/**
 * Unwrap (decrypt) the DEK using the KWK
 * @param {ArrayBuffer} wrappedKey - Wrapped DEK
 * @param {Uint8Array} iv - IV used for wrapping
 * @param {CryptoKey} kwk - Key Wrapping Key
 * @returns {Promise<CryptoKey>} Unwrapped Data Encryption Key
 */
export async function unwrapKey(wrappedKey, iv, kwk) {
  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    kwk,
    {
      name: ALGORITHM,
      iv,
    },
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable so it can be re-wrapped if needed
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using the DEK
 * @param {any} data - Data to encrypt (will be JSON serialized)
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<{ciphertext: ArrayBuffer, iv: Uint8Array}>} Encrypted data and IV
 */
export async function encrypt(data, dek) {
  const jsonString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(jsonString);
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    dek,
    dataBuffer
  );

  return { ciphertext, iv };
}

/**
 * Decrypt data using the DEK
 * @param {ArrayBuffer} ciphertext - Encrypted data
 * @param {Uint8Array} iv - Initialization vector
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<any>} Decrypted and parsed data
 */
export async function decrypt(ciphertext, iv, dek) {
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    dek,
    ciphertext
  );

  const jsonString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(jsonString);
}

/**
 * Helper to convert ArrayBuffer to base64 string for storage
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper to convert base64 string back to ArrayBuffer
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper to convert Uint8Array to base64 string
 * @param {Uint8Array} array
 * @returns {string}
 */
export function uint8ArrayToBase64(array) {
  return arrayBufferToBase64(array.buffer);
}

/**
 * Helper to convert base64 string to Uint8Array
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToUint8Array(base64) {
  return new Uint8Array(base64ToArrayBuffer(base64));
}
