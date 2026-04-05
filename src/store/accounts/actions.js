import { v4 as uuid } from 'uuid';
import { SCHEMA_VERSION } from '@luca-financial/luca-schema';
import { deleteEncryptedRecord } from '@/crypto/database';

import { selectors as accountSelectors } from '@/store/accounts';
import { setCategories } from '@/store/categories';
import {
  selectors as recurringTransactionEventSelectors,
  setRecurringTransactionEvents,
} from '@/store/recurringTransactionEvents';
import {
  selectors as recurringTransactionLinkSelectors,
  setRecurringTransactionLinks,
} from '@/store/recurringTransactionLinks';
import {
  selectors as recurringTransactionSelectors,
  setRecurringTransactions,
} from '@/store/recurringTransactions';
import {
  setStatements,
  selectors as statementSelectors,
} from '@/store/statements';
import { selectors as transactionSelectors } from '@/store/transactions';
import { removeTransaction, setTransactions } from '@/store/transactions/slice';
import {
  setTransactionSplits,
  selectors as transactionSplitSelectors,
} from '@/store/transactionSplits';
import {
  actions as transactionLinkActions,
  selectors as transactionLinkSelectors,
  setTransactionLinks,
} from '@/store/transactionLinks';
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

export const loadData =
  (data, shouldOverwriteCategories = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(clearLoadingAccountIds());

      // Add a small delay to ensure UI updates before processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      const accountsToLoad = data.accounts || [];
      const transactionsToLoad = data.transactions || [];
      const categoriesToLoad = data.categories || [];
      const statementsToLoad = data.statements || [];
      const recurringTransactionsToLoad = data.recurringTransactions || [];
      const recurringTransactionEventsToLoad =
        data.recurringTransactionEvents || [];
      const recurringTransactionLinksToLoad =
        data.recurringTransactionLinks || [];
      const transactionSplitsToLoad = data.transactionSplits || [];
      const transactionLinksToLoad = data.transactionLinks || [];
      const shouldLoadCategories = shouldOverwriteCategories === true;

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
      const existingRecurringTransactionLinks =
        recurringTransactionLinkSelectors.selectRecurringTransactionLinks(
          currentState,
        );
      const existingTransactionSplits =
        transactionSplitSelectors.selectTransactionSplits(currentState);
      const existingTransactionLinks =
        transactionLinkSelectors.selectTransactionLinks(currentState);

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
      const recurringTransactionLinksMap = new Map(
        existingRecurringTransactionLinks.map((link) => [link.id, link]),
      );
      const transactionSplitsMap = new Map(
        existingTransactionSplits.map((split) => [split.id, split]),
      );
      const transactionLinksMap = new Map(
        existingTransactionLinks.map((link) => [link.id, link]),
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

      recurringTransactionLinksToLoad.forEach((link) => {
        recurringTransactionLinksMap.set(link.id, link);
      });

      // Upsert imported transaction splits (overwrites existing by ID)
      transactionSplitsToLoad.forEach((split) => {
        transactionSplitsMap.set(split.id, split);
      });

      transactionLinksToLoad.forEach((link) => {
        transactionLinksMap.set(link.id, link);
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
        recurringTransactionLinksToLoad.length > 0 ||
        existingRecurringTransactionLinks.length > 0
      ) {
        dispatch(
          setRecurringTransactionLinks(
            Array.from(recurringTransactionLinksMap.values()),
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
      if (
        transactionLinksToLoad.length > 0 ||
        existingTransactionLinks.length > 0
      ) {
        dispatch(setTransactionLinks(Array.from(transactionLinksMap.values())));
      }

      // Load categories if user confirmed
      if (shouldLoadCategories && categoriesToLoad.length > 0) {
        dispatch(setCategories(categoriesToLoad));
      }

      dispatch(clearLoadingAccountIds());
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch(setError(error.message || 'Failed to load data'));
      dispatch(clearLoadingAccountIds());
      dispatch(setLoading(false));
      throw error;
    }
  };

export const removeAccountById = (id) => async (dispatch, getState) => {
  const state = getState();
  const transactions =
    transactionSelectors.selectTransactionsByAccountId(id)(state);
  const transactionIds = new Set(transactions.map((transaction) => transaction.id));
  const transactionLinks = transactionLinkSelectors
    .selectTransactionLinks(state)
    .filter(
      (link) =>
        transactionIds.has(link.sourceTransactionId) ||
        transactionIds.has(link.destinationTransactionId),
    );

  // Handle encrypted data if enabled
  const isEncrypted = state.encryption?.status === 'encrypted';
  if (isEncrypted) {
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

  for (const transactionLink of transactionLinks) {
    await dispatch(
      transactionLinkActions.removeTransactionLinkById(transactionLink.id),
    );
  }

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
  const recurringTransactionLinks = state.recurringTransactionLinks;
  const transactionSplits = state.transactionSplits;
  const transactionLinks = state.transactionLinks;

  const data = {
    schemaVersion: SCHEMA_VERSION,
    accounts,
    transactions,
    categories,
    statements,
    recurringTransactions,
    recurringTransactionEvents,
    recurringTransactionLinks,
    transactionSplits,
    transactionLinks,
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
    const recurringTransactionLinks = state.recurringTransactionLinks.filter(
      (link) =>
        recurringTransactionIds.has(link.sourceRecurringTransactionId) &&
        recurringTransactionIds.has(link.destinationRecurringTransactionId),
    );

    // Get transaction IDs for this account
    const transactionIds = new Set(transactions.map((t) => t.id));

    // Filter transaction splits for this account's transactions
    const transactionSplits = state.transactionSplits.filter((split) =>
      transactionIds.has(split.transactionId),
    );
    const transactionLinks = state.transactionLinks.filter(
      (link) =>
        transactionIds.has(link.sourceTransactionId) &&
        transactionIds.has(link.destinationTransactionId),
    );

    const data = {
      schemaVersion: SCHEMA_VERSION,
      accounts: [account],
      transactions,
      categories,
      statements,
      recurringTransactions,
      recurringTransactionEvents,
      recurringTransactionLinks,
      transactionSplits,
      transactionLinks,
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
