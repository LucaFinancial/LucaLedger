import { createAsyncThunk } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import schemas from './schemas';
import { addAccount, removeAccount, updateAccount } from './slice';
import { selectors } from '@/store/accounts';
import * as transactionsActions from '@/store/transactions/slice';

// Dual-write actions
import {
  dualWriteAccountAdd,
  dualWriteAccountUpdate,
  dualWriteAccountRemove,
} from '@/store/accountsLegacy/reducers';

export const createNewAccount = () => (dispatch) => {
  const account = generateAccountObject(
    uuid(),
    'New Account',
    AccountType.CHECKING,
    null
  );
  dispatch(addAccount(account));
  dispatch(dualWriteAccountAdd(account));
};

export const loadAccount = (account) => (dispatch) => {
  // Extract transactions and add account without them
  const { transactions, ...accountData } = account;
  dispatch(addAccount(accountData));
  dispatch(dualWriteAccountAdd(account));

  // Add transactions separately
  if (transactions && Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      dispatch(
        transactionsActions.addTransaction({
          ...transaction,
          accountId: account.id,
        })
      );
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

  dispatch(addAccount(account));
  dispatch(
    dualWriteAccountAdd({ ...account, transactions: data.transactions || [] })
  );

  // Add transactions separately
  if (data.transactions && Array.isArray(data.transactions)) {
    data.transactions.forEach((t) => {
      dispatch(
        transactionsActions.addTransaction({
          ...t,
          amount: parseFloat(t.amount),
          accountId: account.id,
        })
      );
    });
  }
};

export const saveAccount = (accountId, filename) => (dispatch, getState) => {
  const state = getState();
  const account = selectors.selectAccountById(accountId)(state);
  const transactions =
    selectors.selectTransactionsByAccountId(accountId)(state);

  const accountWithTransactions = {
    ...account,
    transactions,
  };

  const saveString = JSON.stringify(accountWithTransactions, null, 2);
  const saveBlob = new Blob([saveString]);
  const url = URL.createObjectURL(saveBlob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export const saveAccountAsync = createAsyncThunk(
  'accounts/saveAccountAsync',
  async ({ accountId, filename }, { dispatch }) => {
    return new Promise((resolve) => {
      try {
        dispatch(saveAccount(accountId, filename));
        resolve();
      } catch (error) {
        console.error('Error saving account:', error);
      }
    });
  }
);

export const saveAllAccounts = () => (dispatch, getState) => {
  const state = getState();
  const accounts = selectors.selectAccounts(state);
  const allTransactions = selectors.selectTransactions(state);

  const zip = new JSZip();
  accounts.forEach((account) => {
    const transactions = allTransactions.filter(
      (t) => t.accountId === account.id
    );
    const accountWithTransactions = {
      ...account,
      transactions,
    };
    const saveString = JSON.stringify(accountWithTransactions, null, 2);
    zip.file(`${account.name}.json`, saveString);
  });
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'accounts.zip';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
};

export const removeAccountById = (id) => (dispatch, getState) => {
  const state = getState();
  const transactions = selectors.selectTransactionsByAccountId(id)(state);

  // Remove all transactions for this account
  transactions.forEach((transaction) => {
    dispatch(transactionsActions.removeTransaction(transaction.id));
  });

  dispatch(removeAccount(id));
  dispatch(dualWriteAccountRemove(id));
};

export { updateAccount };

export const updateAccountProperty =
  (account, property, value) => (dispatch) => {
    const updatedAccount = {
      ...account,
      [property]: value,
    };
    dispatch(updateAccount(updatedAccount));
    dispatch(dualWriteAccountUpdate(updatedAccount));
  };
