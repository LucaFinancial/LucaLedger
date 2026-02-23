import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/crypto/database', () => ({
  storeUserEncryptedRecord: vi.fn().mockResolvedValue(undefined),
  batchStoreUserEncryptedRecords: vi.fn().mockResolvedValue(undefined),
  db: {
    accounts: { delete: vi.fn().mockResolvedValue(undefined) },
    transactions: { delete: vi.fn().mockResolvedValue(undefined) },
    categories: { delete: vi.fn().mockResolvedValue(undefined) },
    statements: { delete: vi.fn().mockResolvedValue(undefined) },
    recurringTransactions: { delete: vi.fn().mockResolvedValue(undefined) },
    recurringTransactionEvents: { delete: vi.fn().mockResolvedValue(undefined) },
    transactionSplits: { delete: vi.fn().mockResolvedValue(undefined) },
  },
}));

import { EncryptionStatus } from '@/store/encryption';
import { storeUserEncryptedRecord } from '@/crypto/database';
import {
  encryptedPersistenceMiddleware,
  setCurrentUserForMiddleware,
  clearCurrentUserFromMiddleware,
  flushWriteQueueForCurrentSession,
  clearWriteQueue,
} from '@/store/encryptedMiddleware';

function makeMiddlewareHarness() {
  const state = {
    encryption: {
      status: EncryptionStatus.ENCRYPTED,
      authStatus: 'authenticated',
    },
    transactions: [],
    categories: [],
    statements: [],
  };

  const store = {
    getState: () => state,
  };
  const next = vi.fn((action) => action);
  const invoke = encryptedPersistenceMiddleware(store)(next);
  return { invoke };
}

describe('encryptedMiddleware queue lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    clearWriteQueue();
    clearCurrentUserFromMiddleware();
  });

  afterEach(() => {
    clearWriteQueue();
    clearCurrentUserFromMiddleware();
    vi.useRealTimers();
  });

  it('does not replay queued writes after logout and subsequent login', async () => {
    const { invoke } = makeMiddlewareHarness();

    setCurrentUserForMiddleware('user-a', { key: 'a' });
    invoke({
      type: 'transactions/addTransaction',
      payload: { id: 'tx-1', amount: 10 },
    });

    // Logout before throttled flush fires, then login as a different user.
    clearCurrentUserFromMiddleware();
    setCurrentUserForMiddleware('user-b', { key: 'b' });

    await vi.advanceTimersByTimeAsync(1000);

    expect(storeUserEncryptedRecord).not.toHaveBeenCalled();
  });

  it('flushes queued writes for the active session before logout', async () => {
    const { invoke } = makeMiddlewareHarness();

    setCurrentUserForMiddleware('user-a', { key: 'a' });
    invoke({
      type: 'accounts/addAccount',
      payload: { id: 'acc-1', name: 'Checking' },
    });

    await flushWriteQueueForCurrentSession({ timeoutMs: 250 });

    expect(storeUserEncryptedRecord).toHaveBeenCalledTimes(1);
    expect(storeUserEncryptedRecord).toHaveBeenCalledWith(
      'accounts',
      'acc-1',
      { id: 'acc-1', name: 'Checking' },
      { key: 'a' },
      'user-a',
    );
  });
});
