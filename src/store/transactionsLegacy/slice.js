import { createSlice } from '@reduxjs/toolkit';

import {
  addTransactionReducer,
  removeTransactionReducer,
  updateTransactionReducer,
} from './reducers';

const transactionsLegacy = createSlice({
  name: 'transactionsLegacy',
  reducers: {
    addTransaction: addTransactionReducer,
    updateTransaction: updateTransactionReducer,
    removeTransaction: removeTransactionReducer,
  },
});

export const { addTransaction, updateTransaction, removeTransaction } =
  transactionsLegacy.actions;
