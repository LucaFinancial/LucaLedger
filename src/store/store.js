import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  return result;
};

// Phase 4 Migration: One-time conversion of any remaining legacy data to normalized format
const migrateState = (persistedState) => {
  if (!persistedState) return {};

  let state = { ...persistedState };
  let needsPersist = false;

  // Check if legacy data exists
  const hasLegacyData =
    state.accountsLegacy &&
    Array.isArray(state.accountsLegacy) &&
    state.accountsLegacy.length > 0;

  if (hasLegacyData) {
    console.log(
      'Phase 4 Migration: Converting remaining legacy data to normalized format...'
    );

    // Ensure we have the normalized slices initialized
    if (!state.accounts) state.accounts = [];
    if (!state.transactions) state.transactions = [];

    // Check if we need to migrate (normalized slices are empty or incomplete)
    const needsMigration =
      state.accounts.length === 0 || state.transactions.length === 0;

    if (needsMigration) {
      // Convert legacy accounts to normalized accounts (without transactions)
      state.accounts = state.accountsLegacy.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        statementDay: account.statementDay,
        version: '2.1.0', // Update version to reflect Phase 4 completion
      }));

      // Extract all transactions to unified transactions slice with accountId
      const allTransactions = [];
      state.accountsLegacy.forEach((account) => {
        if (account.transactions && Array.isArray(account.transactions)) {
          account.transactions.forEach((transaction) => {
            allTransactions.push({
              ...transaction,
              accountId: account.id, // Ensure accountId is set
            });
          });
        }
      });
      state.transactions = allTransactions;

      console.log(
        `Phase 4 Migration: Converted ${state.accounts.length} accounts and ${allTransactions.length} transactions to normalized format`
      );
    }

    // Remove legacy data from storage
    delete state.accountsLegacy;
    console.log('Phase 4 Migration: Cleared legacy data from storage');
    needsPersist = true;
  }

  // Persist the migrated state immediately
  if (needsPersist) {
    localStorage.setItem('reduxState', JSON.stringify(state));
  }

  return state;
};

export default configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(JSON.parse(localStorage.getItem('reduxState'))),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
