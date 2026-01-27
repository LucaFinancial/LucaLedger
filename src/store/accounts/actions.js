import { v4 as uuid } from 'uuid';

import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import { selectors as accountSelectors } from '@/store/accounts';
import { setCategories } from '@/store/categories';
import {
  setRecurringTransactions,
  selectors as recurringTransactionSelectors,
} from '@/store/recurringTransactions';
import {
  setRecurringTransactionEvents,
  selectors as recurringTransactionEventSelectors,
} from '@/store/recurringTransactionEvents';
import {
  setStatements,
  selectors as statementSelectors,
} from '@/store/statements';
import { selectors as transactionSelectors } from '@/store/transactions';
import {
  addTransaction,
  removeTransaction,
  setTransactions,
} from '@/store/transactions/slice';
import {
  setTransactionSplits,
  selectors as transactionSplitSelectors,
} from '@/store/transactionSplits';
import { migrateDataToSchema } from '@/utils/dataMigration';
import { validateSchema } from '@/utils/schemaValidation';
import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import {
  addAccount,
  addLoadingAccountId,
  clearLoadingAccountIds,
  removeAccount,
  setAccounts,
  setError,
  setLoading,
  updateAccount as updateAccountNormalized,
} from './slice';

export const createNewAccount = () => (dispatch) => {
  const account = generateAccountObject(
    uuid(),
    'New Account',
    AccountType.CHECKING,
    null,
  );

  dispatch(addAccount(account));
};

export const loadAccount =
  (data, shouldOverwriteCategories = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(clearLoadingAccountIds());

      // Add a small delay to ensure UI updates before processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Determine schema version - must be present
      const schemaVersion = data.schemaVersion;

      if (!schemaVersion) {
        throw new Error(
          'Invalid file format: No schema version found. File must contain a "schemaVersion" field.',
        );
      }

      let accountsToLoad = [];
      let transactionsToLoad = [];
      let categoriesToLoad = null;
      let statementsToLoad = [];
      let recurringTransactionsToLoad = [];
      let recurringTransactionEventsToLoad = [];
      let transactionSplitsToLoad = [];
      let shouldLoadCategories = false;

      if (schemaVersion === '2.1.0') {
        // Schema 2.1.0+: includes categories
        accountsToLoad = data.accounts;
        transactionsToLoad = data.transactions;
        categoriesToLoad = data.categories;
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
          : [];
        // New fields (may not be present in older 2.1.0 exports)
        recurringTransactionsToLoad = Array.isArray(data.recurringTransactions)
          ? data.recurringTransactions
          : [];
        recurringTransactionEventsToLoad = Array.isArray(
          data.recurringTransactionEvents,
        )
          ? data.recurringTransactionEvents
          : [];
        transactionSplitsToLoad = Array.isArray(data.transactionSplits)
          ? data.transactionSplits
          : [];

        // Check if user wants to import categories
        if (categoriesToLoad && categoriesToLoad.length > 0) {
          const currentState = getState();
          const existingCategories = currentState.categories;

          // If user has existing categories, use the provided decision or ask
          if (existingCategories && existingCategories.length > 0) {
            if (shouldOverwriteCategories !== null) {
              // Decision was already made (from UI modal)
              shouldLoadCategories = shouldOverwriteCategories;
            } else {
              // Fallback to window.confirm for backwards compatibility
              shouldLoadCategories = window.confirm(
                'This file contains category data. Do you want to overwrite your existing categories with the categories from this file?\n\n' +
                  'Click "OK" to replace your current categories with the imported ones.\n' +
                  'Click "Cancel" to keep your current categories.',
              );
            }
          } else {
            // No existing categories, load them automatically
            shouldLoadCategories = true;
          }
        }
      } else if (schemaVersion === '2.0.2' || schemaVersion === '2.0.1') {
        // Schema 2.0.1+: amounts in cents, no categories
        accountsToLoad = data.accounts;
        transactionsToLoad = data.transactions;
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
          : [];
      } else if (
        schemaVersion === '2.0.0' &&
        data.accounts &&
        data.transactions
      ) {
        // Schema 2.0.0: amounts in dollars, no categories
        accountsToLoad = data.accounts;
        transactionsToLoad = data.transactions;
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
          : [];
      } else {
        throw new Error(
          `Unsupported schema version: ${schemaVersion}. Please export data from a supported version.`,
        );
      }

      const migrationTimestamp = new Date().toISOString();
      const migrated = migrateDataToSchema(
        {
          accounts: accountsToLoad,
          transactions: transactionsToLoad,
          categories: categoriesToLoad || [],
          statements: statementsToLoad,
          recurringTransactions: recurringTransactionsToLoad,
          recurringTransactionEvents: recurringTransactionEventsToLoad,
          transactionSplits: transactionSplitsToLoad,
        },
        {
          // ...existing code...
          timestamp: migrationTimestamp,
        },
      );

      accountsToLoad = migrated.data.accounts;
      transactionsToLoad = migrated.data.transactions;
      statementsToLoad = migrated.data.statements;
      recurringTransactionsToLoad = migrated.data.recurringTransactions;
      recurringTransactionEventsToLoad =
        migrated.data.recurringTransactionEvents;
      transactionSplitsToLoad = migrated.data.transactionSplits;
      if (categoriesToLoad) {
        categoriesToLoad = migrated.data.categories;
      }

      // Get current state for idempotent merge
      const currentState = getState();
      const existingAccounts = accountSelectors.selectAccounts(currentState);
      const existingTransactions =
        transactionSelectors.selectTransactions(currentState);
      const existingStatements =
        statementSelectors.selectStatements(currentState);
      const existingRecurringTransactions =
        recurringTransactionSelectors.selectRecurringTransactions(currentState);
      const existingRecurringTransactionEvents =
        recurringTransactionEventSelectors.selectRecurringTransactionEvents(
          currentState,
        );
      const existingTransactionSplits =
        transactionSplitSelectors.selectTransactionSplits(currentState);

      // Idempotent upsert: merge imported data with existing data by ID
      // Create a map of existing items for efficient lookup
      const accountsMap = new Map(existingAccounts.map((acc) => [acc.id, acc]));
      const transactionsMap = new Map(
        existingTransactions.map((txn) => [txn.id, txn]),
      );
      const statementsMap = new Map(
        existingStatements.map((statement) => [statement.id, statement]),
      );
      const recurringTransactionsMap = new Map(
        existingRecurringTransactions.map((rt) => [rt.id, rt]),
      );
      const recurringTransactionEventsMap = new Map(
        existingRecurringTransactionEvents.map((rte) => [rte.id, rte]),
      );
      const transactionSplitsMap = new Map(
        existingTransactionSplits.map((split) => [split.id, split]),
      );

      // Upsert imported accounts (overwrites existing by ID)
      accountsToLoad.forEach((accountData) => {
        accountsMap.set(accountData.id, accountData);
        dispatch(addLoadingAccountId(accountData.id));
      });

      // Upsert imported transactions (overwrites existing by ID)
      transactionsToLoad.forEach((transaction) => {
        transactionsMap.set(transaction.id, transaction);
      });

      // Upsert imported statements (overwrites existing by ID)
      statementsToLoad.forEach((statement) => {
        statementsMap.set(statement.id, statement);
      });

      // Upsert imported recurring transactions (overwrites existing by ID)
      recurringTransactionsToLoad.forEach((recurringTransaction) => {
        recurringTransactionsMap.set(
          recurringTransaction.id,
          recurringTransaction,
        );
      });

      // Upsert imported recurring transaction events (overwrites existing by ID)
      recurringTransactionEventsToLoad.forEach((event) => {
        recurringTransactionEventsMap.set(event.id, event);
      });

      // Upsert imported transaction splits (overwrites existing by ID)
      transactionSplitsToLoad.forEach((split) => {
        transactionSplitsMap.set(split.id, split);
      });

      // Replace entire collections with merged data
      dispatch(setAccounts(Array.from(accountsMap.values())));
      dispatch(setTransactions(Array.from(transactionsMap.values())));
      if (statementsToLoad.length > 0 || existingStatements.length > 0) {
        dispatch(setStatements(Array.from(statementsMap.values())));
      }
      if (
        recurringTransactionsToLoad.length > 0 ||
        existingRecurringTransactions.length > 0
      ) {
        dispatch(
          setRecurringTransactions(
            Array.from(recurringTransactionsMap.values()),
          ),
        );
      }
      if (
        recurringTransactionEventsToLoad.length > 0 ||
        existingRecurringTransactionEvents.length > 0
      ) {
        dispatch(
          setRecurringTransactionEvents(
            Array.from(recurringTransactionEventsMap.values()),
          ),
        );
      }
      if (
        transactionSplitsToLoad.length > 0 ||
        existingTransactionSplits.length > 0
      ) {
        dispatch(
          setTransactionSplits(Array.from(transactionSplitsMap.values())),
        );
      }

      // Load categories if user confirmed or no existing categories
      if (shouldLoadCategories && categoriesToLoad) {
        dispatch(setCategories(categoriesToLoad));
      }

      dispatch(clearLoadingAccountIds());
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error loading account:', error);
      dispatch(setError(error.message || 'Failed to load account'));
      dispatch(clearLoadingAccountIds());
      dispatch(setLoading(false));
      throw error;
    }
  };

const loadAccountFromFile = async () => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const fileContent = await file.text();
  return JSON.parse(fileContent);
};

export const loadAccountAsync = () => async (dispatch) => {
  const data = await loadAccountFromFile();
  if (!data) return;
  const account = generateAccountObject(
    data.id,
    data.name,
    data.type || AccountType.CHECKING,
    data.statementClosingDay ||
      (data.type === AccountType.CREDIT_CARD ? 1 : null),
  );

  const validationResult = await validateSchema('account', account);
  if (!validationResult.valid) {
    console.error(validationResult.errors);
    return;
  }

  const transactions = data.transactions
    ? data.transactions.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
        accountId: account.id,
      }))
    : [];

  dispatch(addAccount(account));

  transactions.forEach((transaction) => {
    dispatch(addTransaction(transaction));
  });
};

export const removeAccountById = (id) => async (dispatch, getState) => {
  const state = getState();
  const transactions =
    transactionSelectors.selectTransactionsByAccountId(id)(state);

  // Handle encrypted data if enabled
  const isEncrypted = state.encryption?.status === 'encrypted';
  if (isEncrypted) {
    const { deleteEncryptedRecord } = await import('@/crypto/database');
    try {
      // Delete account from encrypted database
      await deleteEncryptedRecord('accounts', id);

      // Delete all related transactions from encrypted database
      await Promise.all(
        transactions.map((transaction) =>
          deleteEncryptedRecord('transactions', transaction.id),
        ),
      );
    } catch (error) {
      console.error('Failed to delete encrypted data:', error);
      // Don't proceed with Redux state update if encrypted deletion fails
      throw error;
    }
  }

  transactions.forEach((transaction) => {
    dispatch(removeTransaction(transaction.id));
  });

  dispatch(removeAccount(id));
};

export const updateAccount = (account) => (dispatch) => {
  dispatch(updateAccountNormalized(account));
};

export const updateAccountProperty =
  (account, property, value) => (dispatch) => {
    const updatedAccount = {
      ...account,
      [property]: value,
    };
    dispatch(updateAccount(updatedAccount));
  };

export const saveAllAccounts = () => (dispatch, getState) => {
  const state = getState();
  const accounts = state.accounts.data;
  const transactions = state.transactions;
  const categories = state.categories;
  const statements = state.statements;
  const recurringTransactions = state.recurringTransactions;
  const recurringTransactionEvents = state.recurringTransactionEvents;
  const transactionSplits = state.transactionSplits;

  const data = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    accounts,
    transactions,
    categories,
    statements,
    recurringTransactions,
    recurringTransactionEvents,
    transactionSplits,
  };

  const saveString = JSON.stringify(data, null, 2);
  const saveBlob = new Blob([saveString], { type: 'application/json' });
  const url = URL.createObjectURL(saveBlob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  link.download = `luca-ledger-${timestamp}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);

  // Warning about unencrypted file
  setTimeout(() => {
    alert(
      'Security Notice: The file you downloaded is NOT encrypted. ' +
        'Your financial data is stored in plain text in this file. ' +
        'Please store it securely (e.g., in an encrypted folder or password manager).',
    );
  }, 500);
};

export const saveAccountWithTransactions =
  (accountId) => (dispatch, getState) => {
    const state = getState();
    const account = state.accounts.data.find((a) => a.id === accountId);
    const transactions =
      transactionSelectors.selectTransactionsByAccountId(accountId)(state);
    const categories = state.categories;
    const statements =
      statementSelectors.selectStatementsByAccountId(accountId)(state);
    const recurringTransactions =
      recurringTransactionSelectors.selectRecurringTransactionsByAccountId(
        accountId,
      )(state);

    if (!account) return;

    // Get recurring transaction IDs for this account
    const recurringTransactionIds = new Set(
      recurringTransactions.map((rt) => rt.id),
    );

    // Filter recurring transaction events for this account's recurring transactions
    const recurringTransactionEvents = state.recurringTransactionEvents.filter(
      (event) => recurringTransactionIds.has(event.recurringTransactionId),
    );

    // Get transaction IDs for this account
    const transactionIds = new Set(transactions.map((t) => t.id));

    // Filter transaction splits for this account's transactions
    const transactionSplits = state.transactionSplits.filter((split) =>
      transactionIds.has(split.transactionId),
    );

    const data = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      accounts: [account],
      transactions,
      categories,
      statements,
      recurringTransactions,
      recurringTransactionEvents,
      transactionSplits,
    };

    const saveString = JSON.stringify(data, null, 2);
    const saveBlob = new Blob([saveString], { type: 'application/json' });
    const url = URL.createObjectURL(saveBlob);
    const link = document.createElement('a');
    link.download = `${account.name}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Warning about unencrypted file
    setTimeout(() => {
      alert(
        'Security Notice: The file you downloaded is NOT encrypted. ' +
          'Your financial data is stored in plain text in this file. ' +
          'Please store it securely (e.g., in an encrypted folder or password manager).',
      );
    }, 500);
  };
