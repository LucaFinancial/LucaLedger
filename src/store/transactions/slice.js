import { createSlice } from '@reduxjs/toolkit';

import {
  addTransactionReducer,
  removeTransactionReducer,
  updateTransactionReducer,
} from './reducers';

const transactions = createSlice({
  name: 'transactions',
  reducers: {
    addTransaction: addTransactionReducer,
    updateTransaction: updateTransactionReducer,
    removeTransaction: removeTransactionReducer,
  },
});

export const { addTransaction, updateTransaction, removeTransaction } =
  transactions.actions;
