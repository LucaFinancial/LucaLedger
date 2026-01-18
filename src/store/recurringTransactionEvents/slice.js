import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

const cleanRecurringTransactionEvent = (event) => {
  try {
    return validateSchemaSync('recurringTransactionEvent', event);
  } catch (error) {
    console.error('Invalid recurring transaction event data:', error);
    return event;
  }
};

const recurringTransactionEvents = createSlice({
  name: 'recurringTransactionEvents',
  initialState: [],
  reducers: {
    setRecurringTransactionEvents: (state, action) =>
      action.payload.map(cleanRecurringTransactionEvent),
    addRecurringTransactionEvent: (state, action) => {
      state.push(cleanRecurringTransactionEvent(action.payload));
    },
    removeRecurringTransactionEvent: (state, action) =>
      state.filter((event) => event.id !== action.payload),
    pruneOldEvents: (state, action) => {
      const cutoffDate = action.payload;
      return state.filter((event) => event.expectedDate >= cutoffDate);
    },
  },
});

export default recurringTransactionEvents.reducer;

export const {
  setRecurringTransactionEvents,
  addRecurringTransactionEvent,
  removeRecurringTransactionEvent,
  pruneOldEvents,
} = recurringTransactionEvents.actions;
