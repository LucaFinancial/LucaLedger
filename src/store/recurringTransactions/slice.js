import { validateRecurringTransaction } from '../validators';
import { createListSlice } from '../utils/createListSlice';

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
