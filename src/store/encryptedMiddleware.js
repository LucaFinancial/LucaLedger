/**
 * Middleware to persist Redux state to IndexedDB when encryption is enabled
 * Falls back to localStorage when encryption is disabled
 */

import { getActiveDEK } from '@/crypto/keyManager';
import {
  storeEncryptedRecord,
  getAllEncryptedRecords,
} from '@/crypto/database';
import { EncryptionStatus } from './encryption';

let writeQueue = [];
let writeTimeout = null;
const WRITE_DELAY = 1000; // 1 second throttle

/**
 * Flush the write queue to IndexedDB
 */
async function flushWriteQueue() {
  if (writeQueue.length === 0) return;

  const dek = getActiveDEK();
  if (!dek) return;

  const queue = [...writeQueue];
  writeQueue = [];

  try {
    // Process all queued writes
    for (const { storeName, id, data } of queue) {
      await storeEncryptedRecord(storeName, id, data, dek);
    }
  } catch (error) {
    console.error('Failed to persist encrypted data:', error);
  }
}

/**
 * Queue a write to IndexedDB (throttled)
 */
function queueWrite(storeName, id, data) {
  // Add or update in queue
  const existingIndex = writeQueue.findIndex(
    (item) => item.storeName === storeName && item.id === id
  );

  if (existingIndex >= 0) {
    writeQueue[existingIndex] = { storeName, id, data };
  } else {
    writeQueue.push({ storeName, id, data });
  }

  // Reset the timeout
  if (writeTimeout) {
    clearTimeout(writeTimeout);
  }

  writeTimeout = setTimeout(() => {
    flushWriteQueue();
    writeTimeout = null;
  }, WRITE_DELAY);
}

/**
 * Middleware to handle encrypted persistence
 */
export const encryptedPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Check if encryption is enabled and authenticated
  const isEncrypted = state.encryption.status === EncryptionStatus.ENCRYPTED;
  const isAuthenticated = state.encryption.authStatus === 'authenticated';

  if (isEncrypted && isAuthenticated) {
    // Handle encrypted persistence
    handleEncryptedPersistence(action, state);
  } else if (!isEncrypted) {
    // Fall back to localStorage persistence
    localStorage.setItem('reduxState', JSON.stringify(state));
  }

  return result;
};

/**
 * Handle persistence for encrypted data
 */
function handleEncryptedPersistence(action, state) {
  const dek = getActiveDEK();
  if (!dek) return;

  // Handle account actions
  if (action.type === 'accounts/addAccount') {
    queueWrite('accounts', action.payload.id, action.payload);
  } else if (action.type === 'accounts/updateAccount') {
    queueWrite('accounts', action.payload.id, action.payload);
  } else if (action.type === 'accounts/removeAccount') {
    // Note: We don't handle deletes in the queue, they happen immediately
    // This is handled in the actions themselves
  }

  // Handle transaction actions
  if (action.type === 'transactions/addTransaction') {
    queueWrite('transactions', action.payload.id, action.payload);
  } else if (action.type === 'transactions/updateTransaction') {
    queueWrite('transactions', action.payload.id, action.payload);
  } else if (action.type === 'transactions/updateMultipleTransactions') {
    // Queue all updated transactions
    const { transactionIds } = action.payload;
    transactionIds.forEach((id) => {
      const transaction = state.transactions.find((t) => t.id === id);
      if (transaction) {
        queueWrite('transactions', id, transaction);
      }
    });
  } else if (action.type === 'transactions/removeTransaction') {
    // Note: Deletes are handled immediately in the actions
  }
}

/**
 * Load initial state from IndexedDB if encrypted
 */
export async function loadEncryptedState(dek) {
  try {
    const accounts = await getAllEncryptedRecords('accounts', dek);
    const transactions = await getAllEncryptedRecords('transactions', dek);

    return {
      accounts: accounts || [],
      transactions: transactions || [],
    };
  } catch (error) {
    console.error('Failed to load encrypted state:', error);
    return null;
  }
}
