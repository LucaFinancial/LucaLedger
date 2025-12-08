/**
 * Tests for Encrypted Export/Import functionality
 * Tests data export, import, encryption, compression, and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportEncryptedData,
  importEncryptedData,
  validateImportedData,
} from '@/crypto/exportImport';
import { generateDataEncryptionKey } from '@/crypto/encryption';

describe('Encrypted Export/Import', () => {
  let testDEK;
  let testUserData;

  // Helper function to read blob as text in test environment
  async function blobToText(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(blob);
    });
  }

  beforeEach(async () => {
    // Generate a test DEK
    testDEK = await generateDataEncryptionKey();

    // Create test user data
    testUserData = {
      accounts: [
        {
          id: 'acc1',
          name: 'Test Account',
          type: 'checking',
          balance: 1000,
        },
        {
          id: 'acc2',
          name: 'Savings Account',
          type: 'savings',
          balance: 5000,
        },
      ],
      transactions: [
        {
          id: 'tx1',
          accountId: 'acc1',
          amount: -50,
          description: 'Test Transaction',
          date: '2024-01-01',
        },
        {
          id: 'tx2',
          accountId: 'acc2',
          amount: 100,
          description: 'Deposit',
          date: '2024-01-02',
        },
      ],
      categories: {
        cat1: { id: 'cat1', name: 'Groceries', color: '#FF0000' },
        cat2: { id: 'cat2', name: 'Utilities', color: '#00FF00' },
      },
    };
  });

  describe('exportEncryptedData', () => {
    it('should export data as an encrypted blob', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should include proper metadata in export', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);
      const reader = new FileReader();
      const text = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(blob);
      });
      const exportData = JSON.parse(text);

      expect(exportData.version).toBeDefined();
      expect(exportData.iv).toBeDefined();
      expect(exportData.ciphertext).toBeDefined();
      expect(exportData.createdAt).toBeDefined();
    });

    it('should call progress callback if provided', async () => {
      const progressValues = [];
      await exportEncryptedData(testUserData, testDEK, {
        onProgress: (percent) => progressValues.push(percent),
      });

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[0]).toBeGreaterThanOrEqual(0);
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it('should handle empty data', async () => {
      const emptyData = {
        accounts: [],
        transactions: [],
        categories: {},
      };

      const blob = await exportEncryptedData(emptyData, testDEK);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle large datasets with compression', async () => {
      // Create a large dataset
      const largeData = {
        accounts: Array.from({ length: 100 }, (_, i) => ({
          id: `acc${i}`,
          name: `Account ${i}`,
          type: 'checking',
          balance: Math.random() * 10000,
        })),
        transactions: Array.from({ length: 1000 }, (_, i) => ({
          id: `tx${i}`,
          accountId: `acc${i % 100}`,
          amount: Math.random() * 100 - 50,
          description: `Transaction ${i}`,
          date: '2024-01-01',
        })),
        categories: {},
      };

      const blob = await exportEncryptedData(largeData, testDEK);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('importEncryptedData', () => {
    it('should import and decrypt exported data', async () => {
      // Export data
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);

      // Import data
      const importedData = await importEncryptedData(text, testDEK);

      // Verify data matches (excluding importMetadata)
      expect(importedData.accounts).toEqual(testUserData.accounts);
      expect(importedData.transactions).toEqual(testUserData.transactions);
      expect(importedData.categories).toEqual(testUserData.categories);
    });

    it('should include import metadata', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);

      const importedData = await importEncryptedData(text, testDEK);

      expect(importedData.importMetadata).toBeDefined();
      expect(importedData.importMetadata.exportedAt).toBeDefined();
      expect(importedData.importMetadata.schemaVersion).toBeDefined();
      expect(importedData.importMetadata.formatVersion).toBeDefined();
    });

    it('should call progress callback if provided', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);

      const progressValues = [];
      await importEncryptedData(text, testDEK, {
        onProgress: (percent) => progressValues.push(percent),
      });

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[0]).toBeGreaterThanOrEqual(0);
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it('should throw error for invalid JSON', async () => {
      await expect(
        importEncryptedData('invalid json', testDEK)
      ).rejects.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      const invalidData = {
        version: '1.0',
        // Missing iv and ciphertext
      };

      await expect(
        importEncryptedData(JSON.stringify(invalidData), testDEK)
      ).rejects.toThrow('Invalid backup file format');
    });

    it('should throw error for unsupported format version', async () => {
      const invalidData = {
        version: '99.0',
        iv: 'test',
        ciphertext: 'test',
      };

      await expect(
        importEncryptedData(JSON.stringify(invalidData), testDEK)
      ).rejects.toThrow('Unsupported export format version');
    });

    it('should throw error for wrong decryption key', async () => {
      // Export with one key
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);

      // Try to import with different key
      const wrongDEK = await generateDataEncryptionKey();

      await expect(
        importEncryptedData(text, wrongDEK)
      ).rejects.toThrow('Decryption failed');
    });

    it('should throw error for corrupted data', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);
      const exportData = JSON.parse(text);

      // Corrupt the ciphertext
      exportData.ciphertext = exportData.ciphertext.slice(0, -10) + 'corrupted';

      await expect(
        importEncryptedData(JSON.stringify(exportData), testDEK)
      ).rejects.toThrow();
    });

    it('should handle import of parsed object', async () => {
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);
      const exportData = JSON.parse(text);

      // Import with parsed object instead of string
      const importedData = await importEncryptedData(exportData, testDEK);

      expect(importedData.accounts).toEqual(testUserData.accounts);
      expect(importedData.transactions).toEqual(testUserData.transactions);
    });
  });

  describe('Round-trip tests', () => {
    it('should maintain data equivalence after export and import', async () => {
      // Export
      const blob = await exportEncryptedData(testUserData, testDEK);
      const text = await blobToText(blob);

      // Import
      const importedData = await importEncryptedData(text, testDEK);

      // Verify complete data equivalence
      expect(importedData.accounts).toEqual(testUserData.accounts);
      expect(importedData.transactions).toEqual(testUserData.transactions);
      expect(importedData.categories).toEqual(testUserData.categories);
    });

    it('should handle multiple round trips', async () => {
      let currentData = testUserData;

      for (let i = 0; i < 3; i++) {
        // Export
        const blob = await exportEncryptedData(currentData, testDEK);
        const text = await blobToText(blob);

        // Import
        const importedData = await importEncryptedData(text, testDEK);

        // Remove metadata for next iteration
        delete importedData.importMetadata;
        currentData = importedData;
      }

      // Verify data is still intact after multiple round trips
      expect(currentData.accounts).toEqual(testUserData.accounts);
      expect(currentData.transactions).toEqual(testUserData.transactions);
      expect(currentData.categories).toEqual(testUserData.categories);
    });

    it('should preserve special characters and unicode', async () => {
      const specialData = {
        accounts: [
          {
            id: 'acc1',
            name: 'Test Account with émojis 🎉💰',
            type: 'checking',
            balance: 1000,
          },
        ],
        transactions: [
          {
            id: 'tx1',
            accountId: 'acc1',
            amount: -50,
            description: 'Café ☕ - €20.50',
            date: '2024-01-01',
          },
        ],
        categories: {},
      };

      const blob = await exportEncryptedData(specialData, testDEK);
      const text = await blobToText(blob);
      const importedData = await importEncryptedData(text, testDEK);

      expect(importedData.accounts[0].name).toBe(specialData.accounts[0].name);
      expect(importedData.transactions[0].description).toBe(
        specialData.transactions[0].description
      );
    });

    it('should handle nested objects and arrays', async () => {
      const nestedData = {
        accounts: [
          {
            id: 'acc1',
            name: 'Test',
            metadata: {
              tags: ['important', 'primary'],
              settings: { autoSync: true, limit: 1000 },
            },
          },
        ],
        transactions: [],
        categories: {},
      };

      const blob = await exportEncryptedData(nestedData, testDEK);
      const text = await blobToText(blob);
      const importedData = await importEncryptedData(text, testDEK);

      expect(importedData.accounts[0].metadata).toEqual(
        nestedData.accounts[0].metadata
      );
    });
  });

  describe('validateImportedData', () => {
    it('should validate correct data structure', () => {
      const result = validateImportedData(testUserData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing accounts array', () => {
      const invalidData = {
        transactions: [],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('accounts');
    });

    it('should detect missing transactions array', () => {
      const invalidData = {
        accounts: [],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('transactions');
    });

    it('should detect missing categories object', () => {
      const invalidData = {
        accounts: [],
        transactions: [],
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('categories');
    });

    it('should detect accounts missing id', () => {
      const invalidData = {
        accounts: [{ name: 'Test', type: 'checking' }],
        transactions: [],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing id'))).toBe(true);
    });

    it('should detect accounts missing name', () => {
      const invalidData = {
        accounts: [{ id: 'acc1', type: 'checking' }],
        transactions: [],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing name'))).toBe(true);
    });

    it('should detect transactions missing id', () => {
      const invalidData = {
        accounts: [],
        transactions: [{ accountId: 'acc1', amount: 100 }],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing id'))).toBe(true);
    });

    it('should detect transactions missing amount', () => {
      const invalidData = {
        accounts: [],
        transactions: [{ id: 'tx1', accountId: 'acc1' }],
        categories: {},
      };
      const result = validateImportedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing amount'))).toBe(
        true
      );
    });
  });

  describe('Error handling', () => {
    it('should provide clear error messages', async () => {
      const testCases = [
        {
          data: 'invalid json',
          expectedError: /Failed to import/,
        },
        {
          data: JSON.stringify({ version: '99.0', iv: 'test', ciphertext: 'test' }),
          expectedError: /Unsupported export format version/,
        },
        {
          data: JSON.stringify({ version: '1.0' }),
          expectedError: /Invalid backup file format/,
        },
      ];

      for (const testCase of testCases) {
        try {
          await importEncryptedData(testCase.data, testDEK);
          throw new Error('Should have thrown an error');
        } catch (error) {
          expect(error.message).toMatch(testCase.expectedError);
        }
      }
    });
  });
});
