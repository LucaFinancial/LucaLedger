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
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let originalCreateElement;
  let originalAlert;
  let originalStringify;

  beforeEach(() => {
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalCreateElement = global.document.createElement;
    originalAlert = global.alert;
    originalStringify = global.JSON.stringify;

    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    global.document.createElement = vi.fn(() => ({
      click: vi.fn(),
    }));
    global.alert = vi.fn();
  });

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    global.document.createElement = originalCreateElement;
    global.alert = originalAlert;
    global.JSON.stringify = originalStringify;
  });

  it('includes link collections in full export', () => {
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
            description: 'Recurring',
            categoryId: null,
            frequency: 'MONTH',
            interval: 1,
            startOn: '2026-01-01',
            endOn: null,
            recurringTransactionState: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionEvents: [
          {
            id: 'rte1',
            recurringTransactionId: 'rt1',
            expectedDate: '2026-02-01',
            eventState: 'MODIFIED',
            transactionId: 'txn1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionLinks: [
          {
            id: 'rtl1',
            sourceRecurringTransactionId: 'rt1',
            destinationRecurringTransactionId: 'rt2',
            isSameSign: false,
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
        transactionLinks: [
          {
            id: 'tl1',
            sourceTransactionId: 'txn1',
            destinationTransactionId: 'txn2',
            isSameSign: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        settings: {},
        encryption: { status: 'uninitialized' },
      },
    });

    let capturedData = null;
    global.JSON.stringify = vi.fn((data, ...args) => {
      if (data && data.schemaVersion) {
        capturedData = data;
      }
      return originalStringify(data, ...args);
    });

    store.dispatch(saveAllAccounts());

    expect(capturedData).toBeDefined();
    expect(capturedData.schemaVersion).toBe(SCHEMA_VERSION);
    expect(capturedData.recurringTransactionLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'rtl1',
          sourceRecurringTransactionId: 'rt1',
        }),
      ]),
    );
    expect(capturedData.transactionLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tl1',
          sourceTransactionId: 'txn1',
        }),
      ]),
    );
  });

  it('filters cross-account links out of single-account export unless both endpoints are included', () => {
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
            id: 'txn1b',
            accountId: 'acc1',
            amount: 1500,
            date: '2026-01-20',
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
            description: 'Recurring 1',
            categoryId: null,
            frequency: 'MONTH',
            interval: 1,
            startOn: '2026-01-01',
            endOn: null,
            recurringTransactionState: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rt1b',
            accountId: 'acc1',
            amount: 700,
            description: 'Recurring 1b',
            categoryId: null,
            frequency: 'MONTH',
            interval: 1,
            startOn: '2026-01-01',
            endOn: null,
            recurringTransactionState: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rt2',
            accountId: 'acc2',
            amount: 600,
            description: 'Recurring 2',
            categoryId: null,
            frequency: 'MONTH',
            interval: 1,
            startOn: '2026-01-01',
            endOn: null,
            recurringTransactionState: 'ACTIVE',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionEvents: [
          {
            id: 'rte1',
            recurringTransactionId: 'rt1',
            expectedDate: '2026-02-01',
            eventState: 'MODIFIED',
            transactionId: 'txn1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rte3',
            recurringTransactionId: 'rt1b',
            expectedDate: '2026-02-01',
            eventState: 'MODIFIED',
            transactionId: 'txn1b',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rte2',
            recurringTransactionId: 'rt2',
            expectedDate: '2026-02-01',
            eventState: 'MODIFIED',
            transactionId: 'txn2',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        recurringTransactionLinks: [
          {
            id: 'rtl-keep',
            sourceRecurringTransactionId: 'rt1',
            destinationRecurringTransactionId: 'rt1b',
            isSameSign: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'rtl-drop',
            sourceRecurringTransactionId: 'rt1',
            destinationRecurringTransactionId: 'rt2',
            isSameSign: false,
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
            id: 'split3',
            transactionId: 'txn1b',
            amount: 750,
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
        transactionLinks: [
          {
            id: 'tl-keep',
            sourceTransactionId: 'txn1',
            destinationTransactionId: 'txn1b',
            isSameSign: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
          {
            id: 'tl-drop',
            sourceTransactionId: 'txn1',
            destinationTransactionId: 'txn2',
            isSameSign: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
          },
        ],
        settings: {},
        encryption: { status: 'uninitialized' },
      },
    });

    let capturedData = null;
    global.JSON.stringify = vi.fn((data, ...args) => {
      if (data && data.schemaVersion) {
        capturedData = data;
      }
      return originalStringify(data, ...args);
    });

    store.dispatch(saveAccountWithTransactions('acc1'));

    expect(capturedData).toBeDefined();
    expect(capturedData.accounts).toHaveLength(1);
    expect(capturedData.accounts[0].id).toBe('acc1');
    expect(capturedData.transactions.map((transaction) => transaction.id)).toEqual(
      expect.arrayContaining(['txn1', 'txn1b']),
    );
    expect(capturedData.transactions).toHaveLength(2);
    expect(capturedData.recurringTransactions.map((transaction) => transaction.id)).toEqual(
      expect.arrayContaining(['rt1', 'rt1b']),
    );
    expect(capturedData.recurringTransactions).toHaveLength(2);
    expect(capturedData.recurringTransactionEvents.map((event) => event.id)).toEqual(
      expect.arrayContaining(['rte1', 'rte3']),
    );
    expect(capturedData.recurringTransactionEvents).toHaveLength(2);
    expect(capturedData.recurringTransactionLinks).toEqual([
      expect.objectContaining({ id: 'rtl-keep' }),
    ]);
    expect(capturedData.transactionSplits.map((split) => split.id)).toEqual(
      expect.arrayContaining(['split1', 'split3']),
    );
    expect(capturedData.transactionSplits).toHaveLength(2);
    expect(capturedData.transactionLinks).toEqual([
      expect.objectContaining({ id: 'tl-keep' }),
    ]);
    expect(capturedData.categories).toHaveLength(1);
  });
});
