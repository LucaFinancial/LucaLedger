import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import { encryptedPersistenceMiddleware } from './encryptedMiddleware';

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

    if (!state.accounts) state.accounts = [];
    if (!state.transactions) state.transactions = [];

    const needsMigration =
      state.accounts.length === 0 || state.transactions.length === 0;

    if (needsMigration) {
      state.accounts = state.accountsLegacy.map((account) => ({
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
        `Migration: Converted ${state.accounts.length} accounts and ${allTransactions.length} transactions to normalized format`
      );
    }

    delete state.accountsLegacy;
    console.log('Migration: Cleared legacy data from storage');
    needsPersist = true;
  }

  // Remove version field from existing accounts if present
  if (state.accounts && Array.isArray(state.accounts)) {
    const hadVersion = state.accounts.some((account) => 'version' in account);
    if (hadVersion) {
      state.accounts = state.accounts.map((account) => {
        // eslint-disable-next-line no-unused-vars
        const { version, ...accountWithoutVersion } = account;
        return accountWithoutVersion;
      });
      console.log('Migration: Removed version field from accounts');
      needsPersist = true;
    }
  }

  // Convert float amounts to integer cents (v2 format)
  if (state.transactions && Array.isArray(state.transactions)) {
    let convertedCount = 0;
    state.transactions = state.transactions.map((transaction) => {
      const amount = transaction.amount;
      // If amount is not an integer, convert from dollars to cents
      if (!Number.isInteger(amount)) {
        convertedCount++;
        return {
          ...transaction,
          amount: Math.round(amount * 100),
        };
      }
      return transaction;
    });
    if (convertedCount > 0) {
      console.log(
        `Migration: Converted ${convertedCount} transaction amounts from float to integer cents`
      );
      needsPersist = true;
    }
  }

  if (needsPersist) {
    localStorage.setItem('reduxState', JSON.stringify(state));
  }

  return state;
};

export default configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(JSON.parse(localStorage.getItem('reduxState'))),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(encryptedPersistenceMiddleware),
});
