import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import schemas from './schemas';
import {
  addAccount,
  updateAccount as updateAccountNormalized,
  removeAccount,
  setLoading,
  setError,
} from './slice';
import { selectors as transactionSelectors } from '@/store/transactions';
import { addTransaction, removeTransaction } from '@/store/transactions/slice';

export const createNewAccount = () => (dispatch) => {
  const account = generateAccountObject(
    uuid(),
    'New Account',
    AccountType.CHECKING,
    null
  );

  dispatch(addAccount(account));
};

export const loadAccount = (data) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Add a small delay to ensure UI updates before processing large files
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (data.schemaVersion === '2.0.0' && data.accounts && data.transactions) {
      // Process in chunks to avoid blocking the UI
      const chunkSize = 100;

      // Load accounts
      for (let i = 0; i < data.accounts.length; i += chunkSize) {
        const chunk = data.accounts.slice(i, i + chunkSize);
        chunk.forEach((accountData) => {
          dispatch(addAccount(accountData));
        });
        // Yield to UI thread
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Load transactions
      for (let i = 0; i < data.transactions.length; i += chunkSize) {
        const chunk = data.transactions.slice(i, i + chunkSize);
        chunk.forEach((transaction) => {
          dispatch(addTransaction(transaction));
        });
        // Yield to UI thread
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } else {
      const { transactions, ...accountData } = data;

      dispatch(addAccount(accountData));

      if (transactions && Array.isArray(transactions)) {
        // Process transactions in chunks
        const chunkSize = 100;
        for (let i = 0; i < transactions.length; i += chunkSize) {
          const chunk = transactions.slice(i, i + chunkSize);
          chunk.forEach((transaction) => {
            dispatch(addTransaction({ ...transaction, accountId: data.id }));
          });
          // Yield to UI thread
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }

    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error loading account:', error);
    dispatch(setError(error.message || 'Failed to load account'));
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
  try {
    await schemas[account.type].validate(account);
  } catch (error) {
    console.error(error);
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
  const accounts = state.accounts;
  const transactions = state.transactions;

  const data = {
    schemaVersion: '2.0.0',
    accounts,
    transactions,
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
    const account = state.accounts.find((a) => a.id === accountId);
    const transactions =
      transactionSelectors.selectTransactionsByAccountId(accountId)(state);

    if (!account) return;

    const data = {
      schemaVersion: '2.0.0',
      accounts: [account],
      transactions,
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
