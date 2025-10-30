import { createAsyncThunk } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import { v4 as uuid } from 'uuid';

import { AccountType } from './constants';
import { generateAccountObject } from './generators';
import schemas from './schemas';
import { addAccount, removeAccount, updateAccount } from './slice';

export const createNewAccount = () => (dispatch) => {
  dispatch(
    addAccount(
      generateAccountObject(
        uuid(),
        'New Account',
        AccountType.CHECKING,
        null,
        []
      )
    )
  );
};

export const loadAccount = (account) => (dispatch) => {
  dispatch(addAccount(account));
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
    data.statementDay || (data.type === AccountType.CREDIT_CARD ? 1 : null),
    data.transactions.map((t) => ({ ...t, amount: parseFloat(t.amount) }))
  );
  try {
    await schemas[account.type].validate(account);
  } catch (error) {
    console.error(error);
    return;
  }
  dispatch(addAccount(account));
};

export const saveAccount = (account, filename) => {
  const saveString = JSON.stringify(account, null, 2);
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
  async ({ account, filename }) => {
    return new Promise((resolve) => {
      try {
        saveAccount(account, filename);
        resolve();
      } catch (error) {
        console.error('Error saving account:', error);
      }
    });
  }
);

export const saveAllAccounts = (accounts) => {
  const zip = new JSZip();
  accounts.forEach((account) => {
    const saveString = JSON.stringify(account, null, 2);
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

export const removeAccountById = (id) => (dispatch) => {
  dispatch(removeAccount(id));
};

export { updateAccount };

export const updateAccountProperty =
  (account, property, value) => (dispatch) => {
    const updatedAccount = {
      ...account,
      [property]: value,
    };
    dispatch(updateAccount(updatedAccount));
  };
