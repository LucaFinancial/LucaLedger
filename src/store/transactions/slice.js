import { validators } from '@luca-financial/luca-schema';
import { createListSlice } from '../utils/createListSlice';

const { validateTransaction } = validators;

const transactionsSlice = createListSlice('transactions', validateTransaction);
export const {
  setLoading: setTransactionsLoading,
  setError: setTransactionsError,
  addItem: addTransaction,
  updateItem: updateTransaction,
  removeItem: removeTransaction,
} = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
