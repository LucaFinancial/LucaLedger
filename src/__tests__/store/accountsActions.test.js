import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/crypto/database', () => ({
  deleteEncryptedRecord: vi.fn().mockResolvedValue(undefined),
}));

import rootReducer from '@/store/rootReducer';
import { deleteEncryptedRecord } from '@/crypto/database';
import { removeAccountById } from '@/store/accounts/actions';

function createPreloadedState(encryptionStatus = 'unencrypted') {
  return {
    accounts: {
      data: [
        {
          id: 'acc-1',
          name: 'Account 1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
        {
          id: 'acc-2',
          name: 'Account 2',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      loading: false,
      error: null,
      loadingAccountIds: [],
    },
    transactions: [
      { id: 'txn-1', accountId: 'acc-1' },
      { id: 'txn-2', accountId: 'acc-2' },
    ],
    statements: [
      { id: 'stmt-1', accountId: 'acc-1' },
      { id: 'stmt-2', accountId: 'acc-2' },
    ],
    recurringTransactions: [
      { id: 'rt-1', accountId: 'acc-1' },
      { id: 'rt-2', accountId: 'acc-2' },
    ],
    recurringTransactionEvents: [
      { id: 'rte-1', recurringTransactionId: 'rt-1' },
      { id: 'rte-2', recurringTransactionId: 'rt-2' },
    ],
    transactionSplits: [
      { id: 'split-1', transactionId: 'txn-1' },
      { id: 'split-2', transactionId: 'txn-2' },
    ],
    categories: [],
    settings: {},
    encryption: {
      status: encryptionStatus,
      authStatus: 'authenticated',
      showPrompt: false,
      dismissUntil: null,
      error: null,
    },
  };
}

describe('accounts actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removeAccountById cascades Redux removals for dependent records', async () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: createPreloadedState('unencrypted'),
    });

    await store.dispatch(removeAccountById('acc-1'));
    const state = store.getState();

    expect(state.accounts.data.map((a) => a.id)).toEqual(['acc-2']);
    expect(state.transactions.map((t) => t.id)).toEqual(['txn-2']);
    expect(state.statements.map((s) => s.id)).toEqual(['stmt-2']);
    expect(state.recurringTransactions.map((rt) => rt.id)).toEqual(['rt-2']);
    expect(state.recurringTransactionEvents.map((e) => e.id)).toEqual(['rte-2']);
    expect(state.transactionSplits.map((split) => split.id)).toEqual(['split-2']);
  });

  it('removeAccountById deletes all dependent encrypted records before Redux update', async () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: createPreloadedState('encrypted'),
    });

    await store.dispatch(removeAccountById('acc-1'));

    expect(deleteEncryptedRecord).toHaveBeenCalledTimes(6);
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(1, 'accounts', 'acc-1');
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(
      2,
      'transactions',
      'txn-1',
    );
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(3, 'statements', 'stmt-1');
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(
      4,
      'recurringTransactions',
      'rt-1',
    );
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(
      5,
      'recurringTransactionEvents',
      'rte-1',
    );
    expect(deleteEncryptedRecord).toHaveBeenNthCalledWith(
      6,
      'transactionSplits',
      'split-1',
    );
  });
});
