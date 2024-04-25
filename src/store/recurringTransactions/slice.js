import { validators } from '@luca-financial/luca-schema';
import { createListSlice } from '../utils/createListSlice';

const { validateRecurringTransaction } = validators;

const recurringTransactionsSlice = createListSlice(
  'recurringtransactions',
  validateRecurringTransaction
);
export const {
  setLoading: setRecurringTransactionsLoading,
  setError: setRecurringTransactionsError,
  addItem: addRecurringTransaction,
  updateItem: updateRecurringTransaction,
  removeItem: removeRecurringTransaction,
} = recurringTransactionsSlice.actions;
export const recurringTransactionsReducer = recurringTransactionsSlice.reducer;
