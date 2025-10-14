import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import schemas from './schemas';
import {
  addAccount,
  updateAccount as updateAccountNormalized,
  removeAccount,
} from './slice';
import { selectors } from '@/store/transactions';

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

export const loadAccount = (account) => (dispatch) => {
  const { transactions, ...accountData } = account;

  // Dispatch account to normalized store (without transactions)
  dispatch(addAccount(accountData));

  // Dispatch account to legacy store (with transactions)
  dispatch(addAccountLegacy(account));

  // Dispatch transactions to normalized store
  if (transactions && Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      dispatch(addTransaction({ ...transaction, accountId: account.id }));
    });
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
  const transactions = selectors.selectTransactionsByAccountId(id)(state);

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
  const transactions = selectors.selectTransactionsByAccountId(account.id)(
    state
  );

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
