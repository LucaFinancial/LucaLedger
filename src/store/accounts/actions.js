import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import { validateAccount } from '@/validation/validator';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import {
  addAccount,
  setAccounts,
  updateAccount as updateAccountNormalized,
  removeAccount,
  setLoading,
  setError,
  addLoadingAccountId,
  clearLoadingAccountIds,
} from './slice';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import {
  addTransaction,
  setTransactions,
  removeTransaction,
} from '@/store/transactions/slice';
import { setCategories } from '@/store/categories';
import { setStatements } from '@/store/statements';
import { selectors as statementSelectors } from '@/store/statements';
import { dollarsToCents } from '@/utils';

export const createNewAccount = () => (dispatch) => {
  const account = generateAccountObject(
    uuid(),
    'New Account',
    AccountType.CHECKING,
    null
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
      const schemaVersion = data.schemaVersion || data.version;

      if (!schemaVersion) {
        throw new Error(
          'Invalid file format: No schema version found. File must contain either "schemaVersion" or "version" field.'
        );
      }

      let accountsToLoad = [];
      let transactionsToLoad = [];
      let categoriesToLoad = null;
      let statementsToLoad = [];
      let shouldLoadCategories = false;

      if (schemaVersion === '2.1.0') {
        // Schema 2.1.0+: includes categories
        accountsToLoad = data.accounts;
        transactionsToLoad = data.transactions;
        categoriesToLoad = data.categories;
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
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
                  'Click "Cancel" to keep your current categories.'
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
        // Schema 2.0.0: amounts in dollars, convert to cents, no categories
        accountsToLoad = data.accounts;
        transactionsToLoad = data.transactions.map((transaction) => ({
          ...transaction,
          amount: dollarsToCents(transaction.amount),
        }));
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
          : [];
      } else {
        // Schema 1.0.0: single account with nested transactions, no categories
        // eslint-disable-next-line no-unused-vars
        const { transactions, version, ...accountData } = data;
        accountsToLoad = [accountData];
        transactionsToLoad = (transactions || []).map((transaction) => ({
          ...transaction,
          accountId: data.id,
          amount: dollarsToCents(transaction.amount),
        }));
        statementsToLoad = Array.isArray(data.statements)
          ? data.statements
          : [];
      }

      // Get current state for idempotent merge
      const currentState = getState();
      const existingAccounts = accountSelectors.selectAccounts(currentState);
      const existingTransactions =
        transactionSelectors.selectTransactions(currentState);
      const existingStatements =
        statementSelectors.selectStatements(currentState);

      // Idempotent upsert: merge imported data with existing data by ID
      // Create a map of existing items for efficient lookup
      const accountsMap = new Map(existingAccounts.map((acc) => [acc.id, acc]));
      const transactionsMap = new Map(
        existingTransactions.map((txn) => [txn.id, txn])
      );
      const statementsMap = new Map(
        existingStatements.map((statement) => [statement.id, statement])
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

      // Replace entire collections with merged data
      dispatch(setAccounts(Array.from(accountsMap.values())));
      dispatch(setTransactions(Array.from(transactionsMap.values())));
      if (statementsToLoad.length > 0 || existingStatements.length > 0) {
        dispatch(setStatements(Array.from(statementsMap.values())));
      }

      // Load categories if user confirmed or no existing categories
      if (shouldLoadCategories && categoriesToLoad) {
        dispatch(setCategories(categoriesToLoad));
      }

      // Update schema version in localStorage to current version
      // This prevents migrations from running on already-converted data
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);

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
    data.statementDay || (data.type === AccountType.CREDIT_CARD ? 1 : null)
  );

  const validationResult = await validateAccount(account, account.type);
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
          deleteEncryptedRecord('transactions', transaction.id)
        )
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

  const data = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    accounts,
    transactions,
    categories,
    statements,
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
        'Please store it securely (e.g., in an encrypted folder or password manager).'
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

    if (!account) return;

    const data = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      accounts: [account],
      transactions,
      categories,
      statements,
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
          'Please store it securely (e.g., in an encrypted folder or password manager).'
      );
    }, 500);
  };
