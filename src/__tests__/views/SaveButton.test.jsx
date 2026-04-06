import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SCHEMA_VERSION } from '@luca-financial/luca-schema';
import rootReducer from '@/store/rootReducer';
import SaveButton from '@/views/Accounts/SaveButton';

describe('SaveButton', () => {
  let container = null;
  let root = null;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let originalStringify;
  let createElementSpy;

  beforeEach(() => {
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalStringify = global.JSON.stringify;

    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(async () => {
    if (createElementSpy) {
      createElementSpy.mockRestore();
      createElementSpy = null;
    }

    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    global.JSON.stringify = originalStringify;

    if (root) {
      await act(async () => {
        root.unmount();
      });
      root = null;
    }

    if (container) {
      container.remove();
      container = null;
    }
  });

  it('includes link collections in the Save Accounts export payload', async () => {
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
            expectedDate: '2026-12-01',
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
    const anchor = { click: vi.fn() };
    const originalCreateElement = document.createElement;

    global.JSON.stringify = vi.fn((data, ...args) => {
      if (data?.schemaVersion) {
        capturedData = data;
      }
      return originalStringify(data, ...args);
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
    });

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName, options) => {
        if (tagName === 'a') {
          return anchor;
        }
        return originalCreateElement.call(document, tagName, options);
      });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(capturedData).toBeDefined();
    expect(capturedData.schemaVersion).toBe(SCHEMA_VERSION);
    expect(capturedData.recurringTransactionLinks).toEqual([
      expect.objectContaining({
        id: 'rtl1',
        sourceRecurringTransactionId: 'rt1',
      }),
    ]);
    expect(capturedData.transactionLinks).toEqual([
      expect.objectContaining({
        id: 'tl1',
        sourceTransactionId: 'txn1',
      }),
    ]);
    expect(anchor.click).toHaveBeenCalledTimes(1);
  });
});
