/**
 * Encrypted Export/Import utilities
 * Handles encrypted backup and restore of user data
 */

import JSZip from 'jszip';
import {
  encrypt,
  decrypt,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './encryption';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

// Export metadata version for future compatibility
const EXPORT_FORMAT_VERSION = '1.0';

/**
 * Serialize and compress data
 * @param {Object} data - Data to compress
 * @returns {Promise<{compressed: ArrayBuffer, compressionUsed: boolean}>}
 */
async function compressData(data) {
  const jsonString = JSON.stringify(data);
  const dataSize = new Blob([jsonString]).size;

  // Only compress if data is larger than 10KB
  if (dataSize > 10240) {
    const zip = new JSZip();
    zip.file('data.json', jsonString);
    const compressed = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
    return { compressed, compressionUsed: true };
  }

  // For small files, skip compression
  const encoder = new TextEncoder();
  const compressed = encoder.encode(jsonString).buffer;
  return { compressed, compressionUsed: false };
}

/**
 * Decompress data
 * @param {ArrayBuffer} data - Compressed data
 * @param {boolean} compressionUsed - Whether compression was used
 * @returns {Promise<Object>}
 */
async function decompressData(data, compressionUsed) {
  if (compressionUsed) {
    const zip = new JSZip();
    await zip.loadAsync(data);
    const jsonString = await zip.file('data.json').async('string');
    return JSON.parse(jsonString);
  }

  // No compression - decode directly
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(data);
  return JSON.parse(jsonString);
}

/**
 * Export encrypted data backup
 * @param {Object} userData - User data to export (accounts, transactions, categories, statements)
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {Object} options - Export options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<Blob>} Encrypted backup as blob
 */
export async function exportEncryptedData(userData, dek, options = {}) {
  const { onProgress } = options;

  try {
    // Progress: 0-20% - Preparing data
    if (onProgress) onProgress(10);

    // Create export payload with metadata
    const exportPayload = {
      formatVersion: EXPORT_FORMAT_VERSION,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      data: userData,
    };

    // Progress: 20-40% - Compressing
    if (onProgress) onProgress(30);

    const { compressed, compressionUsed } = await compressData(exportPayload);

    // Progress: 40-60% - Encrypting
    if (onProgress) onProgress(50);

    const { ciphertext, iv } = await encrypt(
      {
        compressed: arrayBufferToBase64(compressed),
        compressionUsed,
      },
      dek
    );

    // Progress: 60-80% - Finalizing
    if (onProgress) onProgress(70);

    // Create final encrypted export structure
    const encryptedExport = {
      version: EXPORT_FORMAT_VERSION,
      iv: uint8ArrayToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext),
      createdAt: new Date().toISOString(),
    };

    // Progress: 80-100% - Creating blob
    if (onProgress) onProgress(90);

    const blob = new Blob([JSON.stringify(encryptedExport, null, 2)], {
      type: 'application/json',
    });

    if (onProgress) onProgress(100);

    return blob;
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export data: ${error.message}`);
  }
}

/**
 * Import encrypted data backup
 * @param {string|Object} encryptedData - Encrypted backup data (JSON string or parsed object)
 * @param {CryptoKey} dek - Data Encryption Key
 * @param {Object} options - Import options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Decrypted user data
 * @throws {Error} Various errors for wrong key, corrupted data, version mismatch
 */
export async function importEncryptedData(encryptedData, dek, options = {}) {
  const { onProgress } = options;

  try {
    // Progress: 0-10% - Parsing
    if (onProgress) onProgress(5);

    // Parse if string
    const parsedData =
      typeof encryptedData === 'string'
        ? JSON.parse(encryptedData)
        : encryptedData;

    // Validate structure
    if (!parsedData.version || !parsedData.iv || !parsedData.ciphertext) {
      throw new Error(
        'Invalid backup file format. Missing required fields (version, iv, ciphertext).'
      );
    }

    // Check format version compatibility
    if (parsedData.version !== EXPORT_FORMAT_VERSION) {
      throw new Error(
        `Unsupported export format version: ${parsedData.version}. Expected: ${EXPORT_FORMAT_VERSION}`
      );
    }

    // Progress: 10-30% - Decrypting
    if (onProgress) onProgress(20);

    const iv = base64ToUint8Array(parsedData.iv);
    const ciphertext = base64ToArrayBuffer(parsedData.ciphertext);

    let decryptedData;
    try {
      decryptedData = await decrypt(ciphertext, iv, dek);
    } catch (error) {
      // AES-GCM will throw if auth tag verification fails (wrong key or corrupted data)
      if (
        error.message.includes('OperationError') ||
        error.name === 'OperationError'
      ) {
        throw new Error(
          'Decryption failed. The file may be corrupted or encrypted with a different key.'
        );
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }

    // Validate decrypted structure
    if (
      !decryptedData.compressed ||
      decryptedData.compressionUsed === undefined
    ) {
      throw new Error('Invalid encrypted data structure after decryption.');
    }

    // Progress: 30-60% - Decompressing
    if (onProgress) onProgress(45);

    const compressed = base64ToArrayBuffer(decryptedData.compressed);
    const payload = await decompressData(
      compressed,
      decryptedData.compressionUsed
    );

    // Progress: 60-80% - Validating
    if (onProgress) onProgress(70);

    // Validate payload structure
    if (!payload.formatVersion || !payload.schemaVersion || !payload.data) {
      throw new Error(
        'Invalid backup payload. Missing required fields (formatVersion, schemaVersion, data).'
      );
    }

    // Check schema version compatibility
    // Allow importing from same or older schema versions
    const importSchemaVersion = payload.schemaVersion;
    const currentVersion = CURRENT_SCHEMA_VERSION;

    if (compareVersions(importSchemaVersion, currentVersion) > 0) {
      throw new Error(
        `Cannot import data from newer schema version ${importSchemaVersion}. Current version is ${currentVersion}. Please update the application.`
      );
    }

    // Validate data structure
    const { data } = payload;
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure in backup.');
    }

    // Progress: 80-100% - Finalizing
    if (onProgress) onProgress(90);

    // Return the imported data with metadata
    const result = {
      ...data,
      importMetadata: {
        exportedAt: payload.createdAt,
        schemaVersion: payload.schemaVersion,
        formatVersion: payload.formatVersion,
      },
    };

    if (onProgress) onProgress(100);

    return result;
  } catch (error) {
    // Re-throw known errors
    if (
      error.message.includes('Invalid backup') ||
      error.message.includes('Unsupported') ||
      error.message.includes('Decryption failed') ||
      error.message.includes('Cannot import')
    ) {
      throw error;
    }

    // Wrap unknown errors
    console.error('Import failed:', error);
    throw new Error(`Failed to import data: ${error.message}`);
  }
}

/**
 * Compare semantic versions
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map((n) => parseInt(n, 10));
  const parts2 = v2.split('.').map((n) => parseInt(n, 10));

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }

  return 0;
}

/**
 * Validate imported data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result with { valid: boolean, errors: string[] }
 */
export function validateImportedData(data) {
  const errors = [];

  // Check for required top-level properties
  if (!data.accounts || !Array.isArray(data.accounts)) {
    errors.push('Missing or invalid accounts array');
  }

  if (!data.transactions || !Array.isArray(data.transactions)) {
    errors.push('Missing or invalid transactions array');
  }

  if (!data.categories || typeof data.categories !== 'object') {
    errors.push('Missing or invalid categories object');
  }

  // Basic validation of accounts structure
  if (Array.isArray(data.accounts)) {
    data.accounts.forEach((account, index) => {
      if (!account.id) {
        errors.push(`Account at index ${index} missing id`);
      }
      if (!account.name) {
        errors.push(`Account at index ${index} missing name`);
      }
    });
  }

  // Basic validation of transactions structure
  if (Array.isArray(data.transactions)) {
    data.transactions.forEach((transaction, index) => {
      if (!transaction.id) {
        errors.push(`Transaction at index ${index} missing id`);
      }
      if (transaction.amount === undefined) {
        errors.push(`Transaction at index ${index} missing amount`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
