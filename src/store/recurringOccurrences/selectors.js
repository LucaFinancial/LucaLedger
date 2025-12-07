import { createSelector } from '@reduxjs/toolkit';

/**
 * Memoized Redux Selectors for Recurring Occurrences
 *
 * These selectors use createSelector from Redux Toolkit to prevent unnecessary
 * re-renders by memoizing their results.
 */

// Basic selectors
export const selectRecurringOccurrences = (state) => state.recurringOccurrences;

/**
 * Memoized selector factory for occurrences by recurring transaction ID
 * Returns a memoized selector that filters occurrences for a specific recurring transaction.
 */
export const selectOccurrencesByRecurringTransactionId = (
  recurringTransactionId
) =>
  createSelector(
    [selectRecurringOccurrences, () => recurringTransactionId],
    (occurrences, id) =>
      occurrences.filter((occ) => occ.recurringTransactionId === id)
  );

/**
 * Memoized selector to check if a specific occurrence date has been realized
 * Returns the occurrence if found, or undefined if not.
 */
export const selectOccurrenceByRuleAndDate = (recurringTransactionId, date) =>
  createSelector(
    [selectRecurringOccurrences, () => recurringTransactionId, () => date],
    (occurrences, rtId, dateStr) =>
      occurrences.find(
        (occ) =>
          occ.recurringTransactionId === rtId && occ.originalDate === dateStr
      )
  );

/**
 * Creates a Set of realized dates for quick lookup
 * Returns a Set of date strings that have been realized for the given recurring transaction
 */
export const selectRealizedDatesForRecurringTransaction = (
  recurringTransactionId
) =>
  createSelector(
    [selectRecurringOccurrences, () => recurringTransactionId],
    (occurrences, rtId) => {
      const dates = new Set();
      occurrences
        .filter((occ) => occ.recurringTransactionId === rtId)
        .forEach((occ) => dates.add(occ.originalDate));
      return dates;
    }
  );

/**
 * Creates a Map of all realized dates across all recurring transactions
 * Key: "recurringTransactionId:date", Value: realizedTransactionId
 */
export const selectAllRealizedDatesMap = createSelector(
  [selectRecurringOccurrences],
  (occurrences) => {
    const map = new Map();
    occurrences.forEach((occ) => {
      const key = `${occ.recurringTransactionId}:${occ.originalDate}`;
      map.set(key, occ.realizedTransactionId);
    });
    return map;
  }
);
