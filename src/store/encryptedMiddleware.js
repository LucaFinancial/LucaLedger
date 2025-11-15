/**
 * Middleware to persist Redux state to IndexedDB when encryption is enabled
 * Falls back to localStorage when encryption is disabled
 */

import { getActiveDEK } from '@/crypto/keyManager';
import {
  storeEncryptedRecord,
  getAllEncryptedRecords,
  db,
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
    // Exclude encryption from persistence
    // Ensure accounts is in the correct object format before saving
    // eslint-disable-next-line no-unused-vars
    const { encryption, ...stateWithoutEncryption } = state;
    const stateToSave = {
      ...stateWithoutEncryption,
      accounts: Array.isArray(stateWithoutEncryption.accounts)
        ? {
            data: stateWithoutEncryption.accounts,
            loading: false,
            error: null,
            loadingAccountIds: [],
          }
        : stateWithoutEncryption.accounts,
    };
    localStorage.setItem('reduxState', JSON.stringify(stateToSave));
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
  } else if (action.type === 'accounts/setAccounts') {
    // When setting all accounts (e.g., during import), persist all to IndexedDB
    const dek = getActiveDEK();
    if (dek) {
      // Import batchStoreEncryptedRecords for bulk operations
      import('@/crypto/database').then(({ batchStoreEncryptedRecords }) => {
        const accountRecords = action.payload.map((account) => ({
          id: account.id,
          data: account,
        }));
        batchStoreEncryptedRecords('accounts', accountRecords, dek).catch(
          (error) => {
            console.error('Failed to persist accounts to IndexedDB:', error);
          }
        );
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
    const dek = getActiveDEK();
    if (dek) {
      // Import batchStoreEncryptedRecords for bulk operations
      import('@/crypto/database').then(({ batchStoreEncryptedRecords }) => {
        const transactionRecords = action.payload.map((transaction) => ({
          id: transaction.id,
          data: transaction,
        }));
        batchStoreEncryptedRecords('transactions', transactionRecords, dek).catch(
          (error) => {
            console.error(
              'Failed to persist transactions to IndexedDB:',
              error
            );
          }
        );
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
      (cat) => cat.parentId === categoryId
    );
    children.forEach((child) => {
      db.categories.delete(child.id).catch((error) => {
        console.error('Failed to delete subcategory from IndexedDB:', error);
      });
    });
  } else if (action.type === 'categories/setCategories') {
    // When setting all categories, clear existing and add new ones
    const dek = getActiveDEK();
    if (dek) {
      // Clear existing categories and add new ones
      db.categories
        .clear()
        .then(() => {
          // Store each category directly instead of queuing
          const promises = action.payload.map((category) =>
            storeEncryptedRecord('categories', category.id, category, dek)
          );
          return Promise.all(promises);
        })
        .catch((error) => {
          console.error('Failed to reset categories in IndexedDB:', error);
        });
    }
    // For unencrypted mode, let the regular persistence handle it via the state update
    // No special localStorage handling needed here - it will be handled by the main middleware logic
  }
}

/**
 * Load initial state from IndexedDB if encrypted
 */
export async function loadEncryptedState(dek) {
  try {
    const accounts = await getAllEncryptedRecords('accounts', dek);
    const transactions = await getAllEncryptedRecords('transactions', dek);
    const categories = await getAllEncryptedRecords('categories', dek);

    return {
      accounts: accounts || [],
      transactions: transactions || [],
      categories: categories || [],
    };
  } catch (error) {
    console.error('Failed to load encrypted state:', error);
    return null;
  }
}
