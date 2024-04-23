import { validateRecurringTransactionEvent } from '../validators';
import { createListSlice } from '../utils/createListSlice';

const recurringTransactionEventsSlice = createListSlice(
  'recurringtransactionevents',
  validateRecurringTransactionEvent
);
export const {
  setLoading: setRecurringTransactionEventsLoading,
  setError: setRecurringTransactionEventsError,
  addItem: addRecurringTransactionEvent,
  updateItem: updateRecurringTransactionEvent,
  removeItem: removeRecurringTransactionEvent,
} = recurringTransactionEventsSlice.actions;
export const recurringTransactionEventsReducer =
  recurringTransactionEventsSlice.reducer;
