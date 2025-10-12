import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  return result;
};

// Migration function to handle renaming 'accounts' to 'accountsLegacy'
const migrateState = (persistedState) => {
  if (!persistedState) return {};

  let state = { ...persistedState };
  let needsPersist = false;

  // If we have 'accounts' but not 'accountsLegacy', migrate it
  if (state.accounts && !state.accountsLegacy) {
    const { accounts, ...rest } = state;
    state = {
      ...rest,
      accountsLegacy: accounts,
    };
    needsPersist = true;
  }

  // Migration: Add accountId to all transactions
  if (state.accountsLegacy && Array.isArray(state.accountsLegacy)) {
    let totalUpdated = 0;
    const updatedAccounts = state.accountsLegacy.map((account) => {
      if (!account.transactions || !Array.isArray(account.transactions)) {
        return account;
      }

      let accountUpdated = 0;
      const updatedTransactions = account.transactions.map((transaction) => {
        // Only add accountId if it's missing
        if (!transaction.accountId) {
          accountUpdated++;
          return {
            ...transaction,
            accountId: account.id,
          };
        }
        return transaction;
      });

      if (accountUpdated > 0) {
        totalUpdated += accountUpdated;
        console.log(
          `Migration: Added accountId to ${accountUpdated} transactions in account "${
            account.name || account.id
          }"`
        );
      }

      return {
        ...account,
        transactions: updatedTransactions,
      };
    });

    if (totalUpdated > 0) {
      console.log(
        `Migration: Successfully updated ${totalUpdated} transactions across ${state.accountsLegacy.length} accounts`
      );
      state.accountsLegacy = updatedAccounts;
      needsPersist = true;
    }
  }

  // Phase 2 Migration: Copy data from legacy slices to new unified slices
  // Check if we need to migrate by seeing if new slices are empty but legacy has data
  const hasLegacyData =
    state.accountsLegacy &&
    Array.isArray(state.accountsLegacy) &&
    state.accountsLegacy.length > 0;
  const newAccountsEmpty = !state.accounts || state.accounts.length === 0;
  const newTransactionsEmpty =
    !state.transactions || state.transactions.length === 0;

  if (hasLegacyData && (newAccountsEmpty || newTransactionsEmpty)) {
    console.log('Phase 2 Migration: Copying data to unified store...');

    // Copy accounts to new accounts slice (without transactions)
    state.accounts = state.accountsLegacy.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      statementDay: account.statementDay,
      version: '2.0.0', // Update version to reflect new unified schema
    }));

    // Copy all transactions to unified transactions slice with accountId
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
      `Phase 2 Migration: Copied ${state.accounts.length} accounts and ${allTransactions.length} transactions to unified store with updated schema version 2.0.0`
    );
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
