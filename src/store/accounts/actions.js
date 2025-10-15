import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import schemas from './schemas';
import {
  addAccount,
  updateAccount as updateAccountNormalized,
  removeAccount,
} from './slice';
import { selectors as transactionSelectors } from '@/store/transactions';

// Legacy actions for dual-write
import {
  addAccount as addAccountLegacy,
  updateAccount as updateAccountLegacy,
  removeAccount as removeAccountLegacy,
} from '@/store/accountsLegacy/slice';

// Transaction actions for dual-write
import { addTransaction, removeTransaction } from '@/store/transactions/slice';

export const createNewAccount = () => (dispatch) => {
  const account = generateAccountObject(
    uuid(),
    'New Account',
    AccountType.CHECKING,
    null
  );

  // Dispatch to normalized store
  dispatch(addAccount(account));

  // Dispatch to legacy store with transactions array
  dispatch(addAccountLegacy({ ...account, transactions: [] }));
};

export const loadAccount = (data) => (dispatch) => {
  // Check if this is v2 format (has schemaVersion and separate accounts/transactions)
  if (data.schemaVersion === '2.0.0' && data.accounts && data.transactions) {
    // Load v2 format: accounts and transactions are separate arrays
    data.accounts.forEach((accountData) => {
      // Dispatch account to normalized store
      dispatch(addAccount(accountData));

      // Create account with transactions for legacy store
      const accountTransactions = data.transactions.filter(
        (t) => t.accountId === accountData.id
      );
      dispatch(
        addAccountLegacy({ ...accountData, transactions: accountTransactions })
      );
    });

    // Dispatch all transactions to normalized store
    data.transactions.forEach((transaction) => {
      dispatch(addTransaction(transaction));
    });
  } else {
    // Load v1 format: account with embedded transactions
    const { transactions, ...accountData } = data;

    // Dispatch account to normalized store (without transactions)
    dispatch(addAccount(accountData));

    // Dispatch account to legacy store (with transactions)
    dispatch(addAccountLegacy(data));

    // Dispatch transactions to normalized store
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach((transaction) => {
        dispatch(addTransaction({ ...transaction, accountId: data.id }));
      });
    }
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

  // Dispatch account to normalized store (without transactions)
  dispatch(addAccount(account));

  // Dispatch account to legacy store (with transactions)
  dispatch(addAccountLegacy({ ...account, transactions }));

  // Dispatch transactions to normalized store
  transactions.forEach((transaction) => {
    dispatch(addTransaction(transaction));
  });
};

export const removeAccountById = (id) => (dispatch, getState) => {
  const state = getState();
  const transactions =
    transactionSelectors.selectTransactionsByAccountId(id)(state);

  // Remove transactions from normalized store
  transactions.forEach((transaction) => {
    dispatch(removeTransaction(transaction.id));
  });

  // Remove account from normalized store
  dispatch(removeAccount(id));

  // Remove account from legacy store
  dispatch(removeAccountLegacy(id));
};

export const updateAccount = (account) => (dispatch, getState) => {
  const state = getState();
  const transactions = transactionSelectors.selectTransactionsByAccountId(
    account.id
  )(state);

  // Update in normalized store
  dispatch(updateAccountNormalized(account));

  // Update in legacy store with transactions
  dispatch(updateAccountLegacy({ ...account, transactions }));
};

export const updateAccountProperty =
  (account, property, value) => (dispatch) => {
    const updatedAccount = {
      ...account,
      [property]: value,
    };
    dispatch(updateAccount(updatedAccount));
  };

// Save all accounts in new v2 format
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
  link.download = `luca-ledger-${timestamp}.ll`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Save single account with transactions
export const saveAccountWithTransactions =
  (accountId) => (dispatch, getState) => {
    const state = getState();
    const account = state.accounts.find((a) => a.id === accountId);
    const transactions =
      transactionSelectors.selectTransactionsByAccountId(accountId)(state);

    if (!account) return;

    const accountWithTransactions = {
      ...account,
      transactions,
    };

    const saveString = JSON.stringify(accountWithTransactions, null, 2);
    const saveBlob = new Blob([saveString]);
    const url = URL.createObjectURL(saveBlob);
    const link = document.createElement('a');
    link.download = `${account.name}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };
