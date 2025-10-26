import { createSelector } from '@reduxjs/toolkit';

/**
 * Memoized Redux Selectors for Transactions
 *
 * These selectors use createSelector from Redux Toolkit to prevent unnecessary
 * re-renders by memoizing their results. A memoized selector only returns a new
 * reference when its input dependencies actually change, not on every call.
 *
 * This is critical for performance because:
 * 1. React components re-render when their props change by reference
 * 2. Unmemoized selectors that filter/map arrays return new array references every call
 * 3. This causes unnecessary re-renders even when the underlying data is unchanged
 *
 * Pattern: createSelector([inputSelectors...], resultFunction)
 * - Input selectors extract the minimal data needed
 * - Result function transforms that data
 * - Results are cached and only recomputed when inputs change
 */

// Basic selectors
export const selectTransactions = (state) => state.transactions;

/**
 * Memoized selector factory for transactions by account ID
 * Returns a memoized selector that filters transactions for a specific account.
 * The selector is memoized per accountId to prevent creating new arrays on every call.
 */
export const selectTransactionsByAccountId = (accountId) =>
  createSelector([selectTransactions], (transactions) =>
    transactions.filter((transaction) => transaction.accountId === accountId)
  );

/**
 * Memoized selector for a single transaction by ID
 * Returns the transaction matching the given ID, or undefined if not found.
 */
export const selectTransactionById = (transactionId) =>
  createSelector([selectTransactions], (transactions) =>
    transactions.find((transaction) => transaction.id === transactionId)
  );

/**
 * Memoized selector factory for transactions by multiple account IDs
 * Used by hooks that need transactions for multiple accounts.
 * The selector is memoized per accountIds array to prevent creating new arrays on every call.
 */
export const selectTransactionsByAccountIds = (accountIds) =>
  createSelector([selectTransactions], (transactions) => {
    const accountIdsSet = new Set(accountIds);
    return transactions.filter((transaction) =>
      accountIdsSet.has(transaction.accountId)
    );
  });
