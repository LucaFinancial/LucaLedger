/**
 * IndexedDB storage layer using Dexie
 * Stores encrypted data with per-record IVs
 * Supports multiple users with per-user encrypted storage
 */

import Dexie from 'dexie';
import {
  encrypt,
  decrypt,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './encryption';

const DB_NAME = 'LucaLedgerEncrypted';
const DB_VERSION = 5;

// Create the database instance
export const db = new Dexie(DB_NAME);

// Define schema with multi-user support
// Version 4 adds recurring transactions and occurrences
db.version(DB_VERSION).stores({
  users: 'id, username', // User table with unique usernames
  accounts: 'id, userId', // Per-user accounts
  transactions: 'id, userId', // Per-user transactions
  categories: 'id, userId', // Per-user categories
  statements: 'id, userId', // Per-user statements
  recurringTransactions: 'id, userId', // Per-user recurring transactions
  recurringTransactionEvents: 'id, userId', // Per-user recurring transaction events
  transactionSplits: 'id, userId', // Per-user transaction splits
  metadata: 'key', // Global key-value store for encryption metadata (legacy compatibility)
});

// Upgrade from version 2 to 3 - add userId to existing records
db.version(3).stores({
  users: 'id, username',
  accounts: 'id, userId',
  transactions: 'id, userId',
  categories: 'id, userId',
  statements: 'id, userId',
  metadata: 'key',
});

// Upgrade from version 2 to 3 - add userId to existing records
db.version(2).stores({
  accounts: 'id',
  transactions: 'id',
  categories: 'id',
  statements: 'id',
  metadata: 'key',
});

/**
 * Store encrypted record in database
 * @param {string} storeName - Name of the store (accounts, transactions)
 * @param {string} id - Record ID
 * @param {any} data - Data to encrypt and store
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<void>}
 */
export async function storeEncryptedRecord(storeName, id, data, dek) {
  const { ciphertext, iv } = await encrypt(data, dek);

  const record = {
    id,
    iv: uint8ArrayToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
  };

  await db[storeName].put(record);
}

/**
 * Retrieve and decrypt record from database
 * @param {string} storeName - Name of the store (accounts, transactions)
 * @param {string} id - Record ID
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<any>} Decrypted data
 */
export async function getEncryptedRecord(storeName, id, dek) {
  const record = await db[storeName].get(id);

  if (!record) {
    return null;
  }

  const iv = base64ToUint8Array(record.iv);
  const ciphertext = base64ToArrayBuffer(record.ciphertext);

  return decrypt(ciphertext, iv, dek);
}

/**
 * Retrieve all records from a store and decrypt them
 * @param {string} storeName - Name of the store (accounts, transactions)
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<Array>} Array of decrypted data
 */
export async function getAllEncryptedRecords(storeName, dek) {
  const records = await db[storeName].toArray();

  const decryptedRecords = await Promise.all(
    records.map(async (record) => {
      const iv = base64ToUint8Array(record.iv);
      const ciphertext = base64ToArrayBuffer(record.ciphertext);
      return decrypt(ciphertext, iv, dek);
    })
  );

  return decryptedRecords;
}

/**
 * Delete a record from the database
 * @param {string} storeName - Name of the store
 * @param {string} id - Record ID
 * @returns {Promise<void>}
 */
export async function deleteEncryptedRecord(storeName, id) {
  await db[storeName].delete(id);
}

/**
 * Store metadata (not encrypted) like salt, wrapped DEK, etc.
 * @param {string} key - Metadata key
 * @param {any} value - Metadata value
 * @returns {Promise<void>}
 */
export async function storeMetadata(key, value) {
  await db.metadata.put({ key, value });
}

/**
 * Retrieve metadata
 * @param {string} key - Metadata key
 * @returns {Promise<any>} Metadata value
 */
export async function getMetadata(key) {
  const record = await db.metadata.get(key);
  return record ? record.value : null;
}

/**
 * Check if database has any encrypted data or if encryption is enabled
 * @returns {Promise<boolean>}
 */
export async function hasEncryptedData() {
  // First check if encryption is explicitly enabled via metadata flag
  const encryptionEnabled = await getMetadata('encryptionEnabled');
  if (encryptionEnabled) {
    return true;
  }

  // Fall back to checking if there's actual encrypted data
  const accountCount = await db.accounts.count();
  const transactionCount = await db.transactions.count();
  const categoryCount = await db.categories.count();
  return accountCount > 0 || transactionCount > 0 || categoryCount > 0;
}

/**
 * Clear all data from the database
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  await db.accounts.clear();
  await db.transactions.clear();
  await db.categories.clear();
  await db.metadata.clear();
}

/**
 * Batch write multiple records for performance
 * @param {string} storeName - Name of the store
 * @param {Array} records - Array of {id, data} objects
 * @param {CryptoKey} dek - Data Encryption Key
 * @returns {Promise<void>}
 */
export async function batchStoreEncryptedRecords(storeName, records, dek) {
  const encryptedRecords = await Promise.all(
    records.map(async ({ id, data }) => {
      const { ciphertext, iv } = await encrypt(data, dek);
      return {
        id,
        iv: uint8ArrayToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
      };
    })
  );

  await db[storeName].bulkPut(encryptedRecords);
}

// ============================================
// User Management Functions
// ============================================

/**
 * Create a new user with encrypted DEK and sentinel
 * @param {string} id - User UUID
 * @param {string} username - Unique username
 * @param {string} salt - Base64 encoded salt for KWK derivation
 * @param {string} wrappedDEK - Base64 encoded wrapped DEK
 * @param {string} wrappedDEKIV - Base64 encoded IV for DEK wrapping
 * @param {string} sentinel - Base64 encoded encrypted sentinel for password validation
 * @param {string} sentinelIV - Base64 encoded IV for sentinel
 * @returns {Promise<void>}
 */
export async function createUser(
  id,
  username,
  salt,
  wrappedDEK,
  wrappedDEKIV,
  sentinel,
  sentinelIV
) {
  // Check if username already exists
  const existingUser = await db.users
    .where('username')
    .equals(username)
    .first();
  if (existingUser) {
    throw new Error('Username already in use');
  }

  await db.users.add({
    id,
    username,
    salt,
    wrappedDEK,
    wrappedDEKIV,
    sentinel,
    sentinelIV,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get all users (returns just usernames and IDs)
 * @returns {Promise<Array<{id: string, username: string}>>}
 */
export async function getAllUsers() {
  const users = await db.users.toArray();
  return users.map((user) => ({
    id: user.id,
    username: user.username,
  }));
}

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export async function getUserByUsername(username) {
  return db.users.where('username').equals(username).first();
}

/**
 * Get user by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getUserById(id) {
  return db.users.get(id);
}

/**
 * Check if any users exist in the database
 * @returns {Promise<boolean>}
 */
export async function hasUsers() {
  const count = await db.users.count();
  return count > 0;
}

/**
 * Delete a user and all their data
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  // Delete all user-specific data
  await db.accounts.where('userId').equals(userId).delete();
  await db.transactions.where('userId').equals(userId).delete();
  await db.categories.where('userId').equals(userId).delete();
  await db.statements.where('userId').equals(userId).delete();

  // Delete the user record
  await db.users.delete(userId);
}

/**
 * Store encrypted record with userId
 * @param {string} storeName - Name of the store
 * @param {string} id - Record ID
 * @param {any} data - Data to encrypt and store
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {string} userId - User ID for multi-user support
 * @returns {Promise<void>}
 */
export async function storeUserEncryptedRecord(
  storeName,
  id,
  data,
  dek,
  userId
) {
  const { ciphertext, iv } = await encrypt(data, dek);

  const record = {
    id,
    userId,
    iv: uint8ArrayToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
  };

  await db[storeName].put(record);
}

/**
 * Retrieve all records for a specific user from a store and decrypt them
 * @param {string} storeName - Name of the store
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of decrypted data
 */
export async function getUserEncryptedRecords(storeName, dek, userId) {
  const records = await db[storeName].where('userId').equals(userId).toArray();

  const decryptedRecords = await Promise.all(
    records.map(async (record) => {
      const iv = base64ToUint8Array(record.iv);
      const ciphertext = base64ToArrayBuffer(record.ciphertext);
      return decrypt(ciphertext, iv, dek);
    })
  );

  return decryptedRecords;
}

/**
 * Batch store encrypted records with userId
 * @param {string} storeName - Name of the store
 * @param {Array} records - Array of {id, data} objects
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function batchStoreUserEncryptedRecords(
  storeName,
  records,
  dek,
  userId
) {
  const encryptedRecords = await Promise.all(
    records.map(async ({ id, data }) => {
      const { ciphertext, iv } = await encrypt(data, dek);
      return {
        id,
        userId,
        iv: uint8ArrayToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
      };
    })
  );

  await db[storeName].bulkPut(encryptedRecords);
}

/**
 * Delete a record from the database for a specific user
 * @param {string} storeName - Name of the store
 * @param {string} id - Record ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUserEncryptedRecord(storeName, id, userId) {
  // First verify the record belongs to the user
  const record = await db[storeName].get(id);
  if (record && record.userId === userId) {
    await db[storeName].delete(id);
  }
}

/**
 * Clear all data for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearUserData(userId) {
  await db.accounts.where('userId').equals(userId).delete();
  await db.transactions.where('userId').equals(userId).delete();
  await db.categories.where('userId').equals(userId).delete();
  await db.statements.where('userId').equals(userId).delete();
}

/**
 * Check if there's any legacy encrypted data (without userId)
 * @returns {Promise<boolean>}
 */
export async function hasLegacyEncryptedData() {
  // Check for records without userId (legacy data)
  const legacyAccounts = await db.accounts
    .filter((record) => !record.userId)
    .count();
  const legacyTransactions = await db.transactions
    .filter((record) => !record.userId)
    .count();
  return legacyAccounts > 0 || legacyTransactions > 0;
}

/**
 * Migrate legacy encrypted data to a user
 * @param {string} userId - Target user ID
 * @returns {Promise<void>}
 */
export async function migrateLegacyDataToUser(userId) {
  // Update all records without userId to have the specified userId
  const stores = ['accounts', 'transactions', 'categories', 'statements'];

  for (const storeName of stores) {
    const records = await db[storeName].filter((r) => !r.userId).toArray();
    for (const record of records) {
      await db[storeName].update(record.id, { userId });
    }
  }
}

/**
 * Check for legacy localStorage data
 * @returns {boolean}
 */
export function hasLegacyLocalStorage() {
  const reduxState = localStorage.getItem('reduxState');
  if (!reduxState) return false;

  try {
    const state = JSON.parse(reduxState);
    // Check if there's any meaningful data
    const hasAccounts =
      state.accounts?.data?.length > 0 ||
      (Array.isArray(state.accounts) && state.accounts.length > 0);
    const hasTransactions = state.transactions?.length > 0;
    return hasAccounts || hasTransactions;
  } catch {
    return false;
  }
}
