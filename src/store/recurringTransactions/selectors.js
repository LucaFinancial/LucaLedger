import { createSelector } from '@reduxjs/toolkit';

/**
 * Memoized Redux Selectors for Recurring Transactions
 *
 * These selectors use createSelector from Redux Toolkit to prevent unnecessary
 * re-renders by memoizing their results.
 */

// Basic selectors
export const selectRecurringTransactions = (state) =>
  state.recurringTransactions;

/**
 * Memoized selector factory for recurring transactions by account ID
 * Returns a memoized selector that filters recurring transactions for a specific account.
 *
 * Usage in components:
 *   const recurringTransactions = useSelector(selectRecurringTransactionsByAccountId(accountId));
 */
export const selectRecurringTransactionsByAccountId = (accountId) =>
  createSelector(
    [selectRecurringTransactions, () => accountId],
    (recurringTransactions, id) =>
      recurringTransactions.filter((rt) => rt.accountId === id),
  );

/**
 * Memoized selector for a single recurring transaction by ID
 * Returns the recurring transaction matching the given ID, or undefined if not found.
 */
export const selectRecurringTransactionById = (recurringTransactionId) =>
  createSelector(
    [selectRecurringTransactions, () => recurringTransactionId],
    (recurringTransactions, id) =>
      recurringTransactions.find((rt) => rt.id === id),
  );
