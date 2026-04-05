import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import { encryptedPersistenceMiddleware } from './encryptedMiddleware';
import { migrateDataToSchema } from '@/utils/dataMigration';
import { getDefaultCategories } from '@/utils/defaultCategories';

// Check if encryption is enabled by looking at IndexedDB
// This is an async check, so we'll use a synchronous approach via localStorage flag
const isEncryptionEnabled = () => {
  // Check for a localStorage flag that indicates encryption is being used
  // This is set by the EncryptionProvider when encryption is detected
  return localStorage.getItem('encryptionActive') === 'true';
};

// Migration: One-time conversion of any remaining legacy data to normalized format
const migrateState = (persistedState) => {
  // For brand new users, initialize with proper structure
  if (!persistedState) {
    const isEncryptionActive = isEncryptionEnabled();

    const initialState = {
      accounts: {
        data: [],
        loading: false,
        error: null,
        loadingAccountIds: [],
      },
      transactions: [],
      categories: isEncryptionActive ? [] : getDefaultCategories(),
      recurringTransactions: [],
      recurringTransactionEvents: [],
      recurringTransactionLinks: [],
      transactionSplits: [],
      transactionLinks: [],
    };

    return initialState;
  }

  let state = { ...persistedState };
  let needsPersist = false;

  // Migrate old array-based accounts structure to new object structure
  if (state.accounts && Array.isArray(state.accounts)) {
    console.log(
      '[Migration] Converting accounts from array to object structure',
    );
    state.accounts = {
      data: state.accounts,
      loading: false,
      error: null,
      loadingAccountIds: [],
    };
    needsPersist = true;
  }

  // Ensure accounts object structure exists
  if (!state.accounts) {
    state.accounts = {
      data: [],
      loading: false,
      error: null,
      loadingAccountIds: [],
    };
    needsPersist = true;
  }

  // Verify accounts is in correct format
  if (state.accounts && !state.accounts.data) {
    console.warn(
      '[Migration] WARNING: accounts exists but is missing data property!',
      state.accounts,
    );
    // Force correct structure
    state.accounts = {
      data: Array.isArray(state.accounts) ? state.accounts : [],
      loading: false,
      error: null,
      loadingAccountIds: [],
    };
    needsPersist = true;
  }

  // Initialize categories with defaults if none exist
  // BUT only if we're not using encrypted storage (which manages its own categories)
  // Check if encryption is active via localStorage flag (set by EncryptionProvider)
  const hasEncryptionActive = isEncryptionEnabled();

  if (
    !hasEncryptionActive &&
    (!state.categories || state.categories.length === 0)
  ) {
    state.categories = getDefaultCategories();
    console.log('Initialized default categories as user data');
    needsPersist = true;
  }

  if (!state.transactions) {
    state.transactions = [];
    needsPersist = true;
  }

  if (!state.statements) {
    state.statements = [];
    needsPersist = true;
  }

  if (!state.recurringTransactions) {
    state.recurringTransactions = [];
    needsPersist = true;
  }

  if (!state.recurringTransactionEvents) {
    state.recurringTransactionEvents = [];
    needsPersist = true;
  }

  if (!state.recurringTransactionLinks) {
    state.recurringTransactionLinks = [];
    needsPersist = true;
  }

  if (!state.transactionSplits) {
    state.transactionSplits = [];
    needsPersist = true;
  }

  if (!state.transactionLinks) {
    state.transactionLinks = [];
    needsPersist = true;
  }

  const migrationTimestamp = new Date().toISOString();
  const migration = migrateDataToSchema(
    {
      accounts: state.accounts.data || [],
      transactions: state.transactions || [],
      categories: state.categories || [],
      statements: state.statements || [],
      recurringTransactions: state.recurringTransactions || [],
      recurringTransactionEvents: state.recurringTransactionEvents || [],
      recurringTransactionLinks: state.recurringTransactionLinks || [],
      transactionSplits: state.transactionSplits || [],
      transactionLinks: state.transactionLinks || [],
    },
    {
      timestamp: migrationTimestamp,
    },
  );

  if (migration.changed) {
    state.accounts.data = migration.data.accounts;
    state.transactions = migration.data.transactions;
    state.categories = migration.data.categories;
    state.statements = migration.data.statements;
    state.recurringTransactions = migration.data.recurringTransactions;
    state.recurringTransactionEvents =
      migration.data.recurringTransactionEvents;
    state.recurringTransactionLinks = migration.data.recurringTransactionLinks;
    state.transactionSplits = migration.data.transactionSplits;
    state.transactionLinks = migration.data.transactionLinks;
    needsPersist = true;
  }

  if (needsPersist) {
    localStorage.setItem('reduxState', JSON.stringify(state));
  }

  return state;
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(JSON.parse(localStorage.getItem('reduxState'))),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(encryptedPersistenceMiddleware),
});

export default store;
