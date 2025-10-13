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
