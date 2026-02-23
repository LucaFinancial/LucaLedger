/**
 * Middleware to persist Redux state to IndexedDB when encryption is enabled
 * Falls back to localStorage when encryption is disabled
 * Updated for multi-user support
 */

import {
  storeUserEncryptedRecord,
  batchStoreUserEncryptedRecords,
  db,
} from '@/crypto/database';
import { EncryptionStatus } from './encryption';

let writeQueue = [];
let writeTimeout = null;
const WRITE_DELAY = 1000; // 1 second throttle

// Store for current user info - set by AuthContext
let currentUserId = null;
let currentDEK = null;
let activeSessionId = 0;

function clearScheduledFlush() {
  if (writeTimeout) {
    clearTimeout(writeTimeout);
    writeTimeout = null;
  }
}

/**
 * Clear all queued writes and cancel any scheduled flush.
 */
export function clearWriteQueue() {
  writeQueue = [];
  clearScheduledFlush();
}

/**
 * Set the current user for middleware operations
 * @param {string} userId - Current user ID
 * @param {CryptoKey} dek - Data Encryption Key
 */
export function setCurrentUserForMiddleware(userId, dek) {
  // Start a fresh session scope for queued writes.
  activeSessionId += 1;
  clearWriteQueue();
  currentUserId = userId;
  currentDEK = dek;
}

/**
 * Clear current user info (on logout)
 */
export function clearCurrentUserFromMiddleware() {
  activeSessionId += 1;
  clearWriteQueue();
  currentUserId = null;
  currentDEK = null;
}

/**
 * Flush the write queue to IndexedDB
 */
async function flushWriteQueue({ sessionId, timeoutMs = null } = {}) {
  if (writeQueue.length === 0) return;

  const targetSessionId = sessionId ?? activeSessionId;
  const queuedWrites = writeQueue.filter(
    (item) => item.sessionId === targetSessionId,
  );
  if (queuedWrites.length === 0) return;

  // Remove this session's writes from the queue up front to avoid replay.
  writeQueue = writeQueue.filter((item) => item.sessionId !== targetSessionId);

  // If auth context changed, drop stale queued writes for safety.
  if (
    !currentDEK ||
    !currentUserId ||
    targetSessionId !== activeSessionId ||
    queuedWrites.some((item) => item.userId !== currentUserId)
  ) {
    return;
  }

  const persistWrites = async () => {
    for (const { storeName, id, data } of queuedWrites) {
      await storeUserEncryptedRecord(storeName, id, data, currentDEK, currentUserId);
    }
  };

  try {
    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      await Promise.race([
        persistWrites(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Write queue flush timed out')), timeoutMs);
        }),
      ]);
      return;
    }
    await persistWrites();
  } catch (error) {
    console.error('Failed to persist encrypted data:', error);
  }
}

/**
 * Best-effort flush for the active session.
 * Used by logout to reduce data loss before auth state is cleared.
 */
export async function flushWriteQueueForCurrentSession({ timeoutMs = 1500 } = {}) {
  const sessionId = activeSessionId;
  await flushWriteQueue({ sessionId, timeoutMs });
}

/**
 * Queue a write to IndexedDB (throttled)
 */
function queueWrite(storeName, id, data) {
  const sessionId = activeSessionId;
  const userId = currentUserId;

  // Add or update in queue
  const existingIndex = writeQueue.findIndex(
    (item) =>
      item.sessionId === sessionId &&
      item.storeName === storeName &&
      item.id === id,
  );

  if (existingIndex >= 0) {
    writeQueue[existingIndex] = { sessionId, userId, storeName, id, data };
  } else {
    writeQueue.push({ sessionId, userId, storeName, id, data });
  }

  // Reset the timeout
  clearScheduledFlush();

  writeTimeout = setTimeout(() => {
    flushWriteQueue({ sessionId }).finally(() => {
      if (writeTimeout) {
        writeTimeout = null;
      }
    });
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

  if (isEncrypted && isAuthenticated && currentUserId && currentDEK) {
    // Handle encrypted persistence
    handleEncryptedPersistence(action, state);
  }
  // Note: localStorage persistence is now disabled - all data must be encrypted

  return result;
};

/**
 * Handle persistence for encrypted data
 */
function handleEncryptedPersistence(action, state) {
  if (!currentDEK || !currentUserId) return;

  // Handle account actions
  if (action.type === 'accounts/addAccount') {
    queueWrite('accounts', action.payload.id, action.payload);
  } else if (action.type === 'accounts/updateAccount') {
    queueWrite('accounts', action.payload.id, action.payload);
  } else if (action.type === 'accounts/setAccounts') {
    // When setting all accounts (e.g., during import), persist all to IndexedDB
    if (currentDEK && currentUserId) {
      const accountRecords = action.payload.map((account) => ({
        id: account.id,
        data: account,
      }));
      batchStoreUserEncryptedRecords(
        'accounts',
        accountRecords,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error('Failed to persist accounts to IndexedDB:', error);
      });
    }
  } else if (action.type === 'accounts/removeAccount') {
    // Delete from IndexedDB immediately
    const accountId = action.payload;
    db.accounts.delete(accountId).catch((error) => {
      console.error('Failed to delete account from IndexedDB:', error);
    });
  }

  // Handle transaction actions
  if (action.type === 'transactions/addTransaction') {
    queueWrite('transactions', action.payload.id, action.payload);
  } else if (action.type === 'transactions/updateTransaction') {
    queueWrite('transactions', action.payload.id, action.payload);
  } else if (action.type === 'transactions/setTransactions') {
    // When setting all transactions (e.g., during import), persist all to IndexedDB
    if (currentDEK && currentUserId) {
      const transactionRecords = action.payload.map((transaction) => ({
        id: transaction.id,
        data: transaction,
      }));
      batchStoreUserEncryptedRecords(
        'transactions',
        transactionRecords,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error('Failed to persist transactions to IndexedDB:', error);
      });
    }
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
    // Delete from IndexedDB immediately
    const transactionId = action.payload;
    db.transactions.delete(transactionId).catch((error) => {
      console.error('Failed to delete transaction from IndexedDB:', error);
    });
  }

  // Handle category actions
  if (action.type === 'categories/addCategory') {
    queueWrite('categories', action.payload.id, action.payload);
  } else if (action.type === 'categories/updateCategory') {
    queueWrite('categories', action.payload.id, action.payload);
  } else if (action.type === 'categories/removeCategory') {
    // Delete from IndexedDB immediately (category and all its children)
    const categoryId = action.payload;
    // Delete the category itself
    db.categories.delete(categoryId).catch((error) => {
      console.error('Failed to delete category from IndexedDB:', error);
    });
    // Delete all subcategories (children) of this category
    const children = state.categories.filter(
      (cat) => cat.parentId === categoryId,
    );
    children.forEach((child) => {
      db.categories.delete(child.id).catch((error) => {
        console.error('Failed to delete subcategory from IndexedDB:', error);
      });
    });
  } else if (action.type === 'categories/setCategories') {
    // When setting all categories, persist all to IndexedDB
    if (currentDEK && currentUserId) {
      // Note: Don't clear all user data, just update categories
      const categoryRecords = action.payload.map((category) => ({
        id: category.id,
        data: category,
      }));
      batchStoreUserEncryptedRecords(
        'categories',
        categoryRecords,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error('Failed to persist categories to IndexedDB:', error);
      });
    }
  }

  // Handle statement actions
  if (action.type === 'statements/addStatement') {
    queueWrite('statements', action.payload.id, action.payload);
  } else if (action.type === 'statements/updateStatement') {
    queueWrite('statements', action.payload.id, action.payload);
  } else if (
    action.type === 'statements/lockStatement' ||
    action.type === 'statements/unlockStatement'
  ) {
    // lockStatement and unlockStatement actions have statementId as the payload
    const statementId = action.payload;
    const statement = state.statements.find((s) => s.id === statementId);
    if (statement) {
      queueWrite('statements', statementId, statement);
    }
  } else if (action.type === 'statements/setStatements') {
    // When setting all statements (e.g., during import/load), persist all to IndexedDB
    if (currentDEK && currentUserId) {
      const statementRecords = action.payload.map((statement) => ({
        id: statement.id,
        data: statement,
      }));
      batchStoreUserEncryptedRecords(
        'statements',
        statementRecords,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error('Failed to persist statements to IndexedDB:', error);
      });
    }
  } else if (action.type === 'statements/removeStatement') {
    // Delete from IndexedDB immediately
    const statementId = action.payload;
    db.statements.delete(statementId).catch((error) => {
      console.error('Failed to delete statement from IndexedDB:', error);
    });
  }

  // Handle recurring transaction actions
  if (action.type === 'recurringTransactions/addRecurringTransaction') {
    queueWrite('recurringTransactions', action.payload.id, action.payload);
  } else if (
    action.type === 'recurringTransactions/updateRecurringTransaction'
  ) {
    queueWrite('recurringTransactions', action.payload.id, action.payload);
  } else if (action.type === 'recurringTransactions/setRecurringTransactions') {
    if (currentDEK && currentUserId) {
      const records = action.payload.map((rt) => ({
        id: rt.id,
        data: rt,
      }));
      batchStoreUserEncryptedRecords(
        'recurringTransactions',
        records,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error(
          'Failed to persist recurring transactions to IndexedDB:',
          error,
        );
      });
    }
  } else if (
    action.type === 'recurringTransactions/removeRecurringTransaction'
  ) {
    const id = action.payload;
    db.recurringTransactions.delete(id).catch((error) => {
      console.error(
        'Failed to delete recurring transaction from IndexedDB:',
        error,
      );
    });
  }

  // Handle recurring transaction event actions
  if (
    action.type === 'recurringTransactionEvents/addRecurringTransactionEvent'
  ) {
    queueWrite('recurringTransactionEvents', action.payload.id, action.payload);
  } else if (
    action.type === 'recurringTransactionEvents/setRecurringTransactionEvents'
  ) {
    if (currentDEK && currentUserId) {
      const records = action.payload.map((event) => ({
        id: event.id,
        data: event,
      }));
      batchStoreUserEncryptedRecords(
        'recurringTransactionEvents',
        records,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error(
          'Failed to persist recurring transaction events to IndexedDB:',
          error,
        );
      });
    }
  } else if (
    action.type === 'recurringTransactionEvents/removeRecurringTransactionEvent'
  ) {
    const id = action.payload;
    db.recurringTransactionEvents.delete(id).catch((error) => {
      console.error(
        'Failed to delete recurring transaction event from IndexedDB:',
        error,
      );
    });
  }

  // Handle transaction split actions
  if (action.type === 'transactionSplits/addTransactionSplit') {
    queueWrite('transactionSplits', action.payload.id, action.payload);
  } else if (action.type === 'transactionSplits/updateTransactionSplit') {
    queueWrite('transactionSplits', action.payload.id, action.payload);
  } else if (action.type === 'transactionSplits/setTransactionSplits') {
    if (currentDEK && currentUserId) {
      const records = action.payload.map((split) => ({
        id: split.id,
        data: split,
      }));
      batchStoreUserEncryptedRecords(
        'transactionSplits',
        records,
        currentDEK,
        currentUserId,
      ).catch((error) => {
        console.error(
          'Failed to persist transaction splits to IndexedDB:',
          error,
        );
      });
    }
  } else if (
    action.type === 'transactionSplits/setTransactionSplitsForTransaction'
  ) {
    const { splits } = action.payload;
    splits.forEach((split) => {
      queueWrite('transactionSplits', split.id, split);
    });
  } else if (action.type === 'transactionSplits/removeTransactionSplit') {
    const id = action.payload;
    db.transactionSplits.delete(id).catch((error) => {
      console.error(
        'Failed to delete transaction split from IndexedDB:',
        error,
      );
    });
  }
}
