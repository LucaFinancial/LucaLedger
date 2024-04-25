import { createSelector } from '@reduxjs/toolkit';

export const selectRecurringTransactions = (state) =>
  state.recurringtransactions;

export const selectAllRecurringTransactions = createSelector(
  selectRecurringTransactions,
  (recurringTransactions) => recurringTransactions.recurringTransactionsList
);
