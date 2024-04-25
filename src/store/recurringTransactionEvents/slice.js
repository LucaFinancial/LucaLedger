import { validators } from '@luca-financial/luca-schema';
import { createListSlice } from '../utils/createListSlice';

const { validateRecurringTransactionEvent } = validators;

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
