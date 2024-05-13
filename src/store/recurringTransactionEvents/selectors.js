import { createSelector } from '@reduxjs/toolkit';

export const selectRecurringTransactionEvents = (state) =>
  state.recurringtransactionevents;

export const selectAllRecurringTransactionEvents = createSelector(
  selectRecurringTransactionEvents,
  (recurringTransactionEvents) =>
    recurringTransactionEvents.recurringTransactionEventsList
);
