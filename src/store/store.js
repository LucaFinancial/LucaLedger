import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';
import { encryptedPersistenceMiddleware } from './encryptedMiddleware';

// Migration: One-time conversion of any remaining legacy data to normalized format
const migrateState = (persistedState) => {
  console.log(
    '[migrateState] Called with:',
    persistedState ? 'data present' : 'null/undefined'
  );

  if (!persistedState) return {};

  let state = { ...persistedState };
  let needsPersist = false;

  console.log('[migrateState] State structure:', {
    hasAccounts: !!state.accounts,
    hasTransactions: !!state.transactions,
    transactionCount: state.transactions?.length || 0,
    accountsLegacy: !!state.accountsLegacy,
  });

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

  // Convert float amounts to integer cents based on schema version
  // Schema 2.0.0 and below: amounts stored as floats (dollars)
  // Schema 2.0.1 and above: amounts stored as integers (cents)
  const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

  console.log('[Migration Check]', {
    storedSchemaVersion,
    hasTransactions: !!(
      state.transactions && Array.isArray(state.transactions)
    ),
    transactionCount: state.transactions?.length || 0,
    firstAmount: state.transactions?.[0]?.amount,
    needsMigration: !storedSchemaVersion || storedSchemaVersion === '2.0.0',
  });

  if (
    state.transactions &&
    Array.isArray(state.transactions) &&
    state.transactions.length > 0
  ) {
    // If schema version is 2.0.0 or not set (legacy data), convert all amounts
    if (!storedSchemaVersion || storedSchemaVersion === '2.0.0') {
      let convertedCount = 0;
      state.transactions = state.transactions.map((transaction) => {
        const amount = transaction.amount;
        convertedCount++;
        return {
          ...transaction,
          // Convert from dollars to cents (multiply by 100)
          amount: Math.round(amount * 100),
        };
      });

      console.log(
        `Migration v2.0.0→v2.0.1: Converted ${convertedCount} transaction amounts from dollars to cents`
      );
      console.log('[Migration Sample]', {
        before: state.transactions[0]?.amount / 100,
        after: state.transactions[0]?.amount,
      });

      // Update schema version immediately to prevent re-migration
      localStorage.setItem('dataSchemaVersion', '2.0.1');
      needsPersist = true;
    }
  } else if (!storedSchemaVersion) {
    // No transactions yet, but set schema to 2.0.1 for new data
    localStorage.setItem('dataSchemaVersion', '2.0.1');
    console.log(
      'Schema version initialized to 2.0.1 (no existing transactions)'
    );
  }

  if (needsPersist) {
    localStorage.setItem('reduxState', JSON.stringify(state));
  }

  return state;
};

// Helper to safely load persisted state
const loadPersistedState = () => {
  try {
    const serialized = localStorage.getItem('reduxState');
    console.log(
      '[Store Init] localStorage reduxState:',
      serialized ? `${serialized.substring(0, 100)}...` : 'null'
    );
    if (serialized === null) {
      console.log('[Store Init] No persisted state found');
      return null;
    }
    return JSON.parse(serialized);
  } catch (err) {
    console.error('[Store Init] Error loading persisted state:', err);
    return null;
  }
};

export default configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(loadPersistedState()),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(encryptedPersistenceMiddleware),
});
