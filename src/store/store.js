import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import { encryptedPersistenceMiddleware } from './encryptedMiddleware';
import { setCategories } from './categories';
import { NONE_CATEGORY_ID } from './categories/constants';
import config from '@/config';

// Migration: One-time conversion of any remaining legacy data to normalized format
const migrateState = (persistedState) => {
  if (!persistedState) return {};

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

  // Migrate transactions with missing or "0" categoryId to None category
  if (state.transactions && Array.isArray(state.transactions)) {
    let categoryMigrationCount = 0;
    state.transactions = state.transactions.map((transaction) => {
      if (!transaction.categoryId || transaction.categoryId === '0') {
        categoryMigrationCount++;
        return {
          ...transaction,
          categoryId: NONE_CATEGORY_ID,
        };
      }
      return transaction;
    });

    if (categoryMigrationCount > 0) {
      console.log(
        `[Migration] Set categoryId to None for ${categoryMigrationCount} transactions`
      );
      needsPersist = true;
    }
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

// Load categories from config on app initialization
store.dispatch(setCategories(config.categories));

export default store;
