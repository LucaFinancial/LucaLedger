/**
 * Tests for Account Export/Import functionality
 * Verifies that export includes all necessary data stores
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { SCHEMA_VERSION } from '@luca-financial/luca-schema';
import rootReducer from '@/store/rootReducer';
import {
  saveAllAccounts,
  saveAccountWithTransactions,
} from '@/store/accounts/actions';

describe('Account Export', () => {
  // Store original globals
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let originalCreateElement;
  let originalAlert;
  let originalStringify;

  beforeEach(() => {
    // Save original implementations
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalCreateElement = global.document.createElement;
    originalAlert = global.alert;
    originalStringify = global.JSON.stringify;

    // Mock window methods
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    global.document.createElement = vi.fn(() => ({
      click: vi.fn(),
    }));
    global.alert = vi.fn();
  });

  afterEach(() => {
    // Restore original implementations
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    global.document.createElement = originalCreateElement;
    global.alert = originalAlert;
    global.JSON.stringify = originalStringify;
  });
  it('should include all data stores in export', () => {
    // Create store with sample data
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        accounts: {
          data: [
            {
              id: 'acc1',
              name: 'Test Account',
              type: 'checking',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: null,
            },
          ],
          loading: false,
          error: null,
          loadingAccountIds: [],
        },
        transactions: [
          {
            id: 'txn1',
            accountId: 'acc1',
            amount: 1000,
            date: '2026-01-15',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        categories: [
          {
            id: 'cat1',
            name: 'Test Category',
            slug: 'test-category',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        statements: [
          {
            id: 'stmt1',
            accountId: 'acc1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactions: [
          {
            id: 'rt1',
            accountId: 'acc1',
            amount: 500,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionEvents: [
          {
            id: 'rte1',
            recurringTransactionId: 'rt1',
            expectedDate: '2026-02-01',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        transactionSplits: [
          {
            id: 'split1',
            transactionId: 'txn1',
            amount: 500,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        settings: {},
        encryption: { status: 'uninitialized' },
      },
    });

    // Spy on JSON.stringify to capture the export data
    let capturedData = null;
    global.JSON.stringify = vi.fn((data, ...args) => {
      if (data && data.schemaVersion) {
        capturedData = data;
      }
      return originalStringify(data, ...args);
    });

    // Execute export
    store.dispatch(saveAllAccounts());

    // Verify export data structure
    expect(capturedData).toBeDefined();
    expect(capturedData.schemaVersion).toBe(SCHEMA_VERSION);
    expect(capturedData.accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'acc1', name: 'Test Account' }),
      ]),
    );
    expect(capturedData.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'txn1', accountId: 'acc1' }),
      ]),
    );
    expect(capturedData.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cat1', name: 'Test Category' }),
      ]),
    );
    expect(capturedData.statements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'stmt1', accountId: 'acc1' }),
      ]),
    );

    // Verify new data stores are included
    expect(capturedData.recurringTransactions).toBeDefined();
    expect(capturedData.recurringTransactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'rt1', accountId: 'acc1' }),
      ]),
    );

    expect(capturedData.recurringTransactionEvents).toBeDefined();
    expect(capturedData.recurringTransactionEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'rte1', recurringTransactionId: 'rt1' }),
      ]),
    );

    expect(capturedData.transactionSplits).toBeDefined();
    expect(capturedData.transactionSplits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'split1', transactionId: 'txn1' }),
      ]),
    );
  });

  it('should filter data correctly in single account export', () => {
    // Create store with data for multiple accounts
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        accounts: {
          data: [
            {
              id: 'acc1',
              name: 'Account 1',
              type: 'checking',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: null,
            },
            {
              id: 'acc2',
              name: 'Account 2',
              type: 'savings',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: null,
            },
          ],
          loading: false,
          error: null,
          loadingAccountIds: [],
        },
        transactions: [
          {
            id: 'txn1',
            accountId: 'acc1',
            amount: 1000,
            date: '2026-01-15',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'txn2',
            accountId: 'acc2',
            amount: 2000,
            date: '2026-01-15',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        categories: [
          {
            id: 'cat1',
            name: 'Test Category',
            slug: 'test-category',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        statements: [
          {
            id: 'stmt1',
            accountId: 'acc1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'stmt2',
            accountId: 'acc2',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactions: [
          {
            id: 'rt1',
            accountId: 'acc1',
            amount: 500,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rt2',
            accountId: 'acc2',
            amount: 600,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionEvents: [
          {
            id: 'rte1',
            recurringTransactionId: 'rt1',
            expectedDate: '2026-02-01',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rte2',
            recurringTransactionId: 'rt2',
            expectedDate: '2026-02-01',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        transactionSplits: [
          {
            id: 'split1',
            transactionId: 'txn1',
            amount: 500,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'split2',
            transactionId: 'txn2',
            amount: 1000,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        settings: {},
        encryption: { status: 'uninitialized' },
      },
    });

    // Spy on JSON.stringify to capture the export data
    let capturedData = null;
    global.JSON.stringify = vi.fn((data, ...args) => {
      if (data && data.schemaVersion) {
        capturedData = data;
      }
      return originalStringify(data, ...args);
    });

    // Execute single account export for acc1
    store.dispatch(saveAccountWithTransactions('acc1'));

    // Verify only acc1 data is included
    expect(capturedData).toBeDefined();
    expect(capturedData.accounts).toHaveLength(1);
    expect(capturedData.accounts[0].id).toBe('acc1');

    expect(capturedData.transactions).toHaveLength(1);
    expect(capturedData.transactions[0].id).toBe('txn1');

    expect(capturedData.statements).toHaveLength(1);
    expect(capturedData.statements[0].id).toBe('stmt1');

    // Verify filtering of new data stores
    expect(capturedData.recurringTransactions).toHaveLength(1);
    expect(capturedData.recurringTransactions[0].id).toBe('rt1');

    // Should only include events for acc1's recurring transactions
    expect(capturedData.recurringTransactionEvents).toHaveLength(1);
    expect(capturedData.recurringTransactionEvents[0].id).toBe('rte1');

    // Should only include splits for acc1's transactions
    expect(capturedData.transactionSplits).toHaveLength(1);
    expect(capturedData.transactionSplits[0].id).toBe('split1');

    // Categories should be included for all accounts (not filtered)
    expect(capturedData.categories).toHaveLength(1);
  });
});
