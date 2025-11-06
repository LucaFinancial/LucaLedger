import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import { encryptedPersistenceMiddleware } from './encryptedMiddleware';
import categoriesData from '@/config/categories.json';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

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
      categories: isEncryptionActive ? [] : categoriesData.categories,
    };

    // Set schema version for new users
    if (!isEncryptionActive) {
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
      console.log(
        `Initialized new user with schema version ${CURRENT_SCHEMA_VERSION}`
      );
    }

    return initialState;
  }

  let state = { ...persistedState };
  let needsPersist = false;

  const hasLegacyData =
    state.accountsLegacy &&
    Array.isArray(state.accountsLegacy) &&
    state.accountsLegacy.length > 0;

  if (hasLegacyData) {
    console.log(
      'Migration: Converting remaining legacy data to normalized format...'
    );

    // Initialize accounts with new structure if needed
    if (!state.accounts || Array.isArray(state.accounts)) {
      state.accounts = {
        data: state.accounts || [],
        loading: false,
        error: null,
        loadingAccountIds: [],
      };
    }
    if (!state.transactions) state.transactions = [];

    const needsMigration =
      state.accounts.data.length === 0 || state.transactions.length === 0;

    if (needsMigration) {
      state.accounts.data = state.accountsLegacy.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        statementDay: account.statementDay,
      }));

      const allTransactions = [];
      state.accountsLegacy.forEach((account) => {
        if (account.transactions && Array.isArray(account.transactions)) {
          account.transactions.forEach((transaction) => {
            allTransactions.push({
              ...transaction,
              accountId: account.id,
            });
          });
        }
      });
      state.transactions = allTransactions;

      console.log(
        `Migration: Converted ${state.accounts.data.length} accounts and ${allTransactions.length} transactions to normalized format`
      );
    }

    delete state.accountsLegacy;
    console.log('Migration: Cleared legacy data from storage');
    needsPersist = true;
  }

  // Migrate old array-based accounts structure to new object structure
  if (state.accounts && Array.isArray(state.accounts)) {
    console.log(
      '[Migration] Converting accounts from array to object structure'
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
      state.accounts
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

  // Remove version field from existing accounts if present
  if (
    state.accounts &&
    state.accounts.data &&
    Array.isArray(state.accounts.data)
  ) {
    const hadVersion = state.accounts.data.some(
      (account) => 'version' in account
    );
    if (hadVersion) {
      state.accounts.data = state.accounts.data.map((account) => {
        // eslint-disable-next-line no-unused-vars
        const { version, ...accountWithoutVersion } = account;
        return accountWithoutVersion;
      });
      console.log('Migration: Removed version field from accounts');
      needsPersist = true;
    }
  }

  // Initialize categories with defaults if none exist
  // BUT only if we're not using encrypted storage (which manages its own categories)
  // Check if encryption is active via localStorage flag (set by EncryptionProvider)
  const hasEncryptionActive = isEncryptionEnabled();

  if (
    !hasEncryptionActive &&
    (!state.categories || state.categories.length === 0)
  ) {
    state.categories = categoriesData.categories;
    console.log('Initialized default categories as user data');
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
