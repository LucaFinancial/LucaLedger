/**
 * IndexedDB storage layer using Dexie
 * Stores encrypted data with per-record IVs
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
const DB_VERSION = 1;

// Create the database instance
export const db = new Dexie(DB_NAME);

// Define schema
db.version(DB_VERSION).stores({
  accounts: 'id', // id as primary key
  transactions: 'id', // id as primary key
  categories: 'id', // id as primary key
  metadata: 'key', // key-value store for encryption metadata
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
