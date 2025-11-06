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
 * Pattern for parametric selectors:
 * - Each call to the factory function creates a new selector instance
 * - In React components using useSelector, the instance is created once and reused
 * - Each instance memoizes based on both the transactions array AND the parameter
 * - This is the standard Redux pattern for selectors with runtime parameters
 * - Results are cached within each selector instance, preventing unnecessary array creation
 *
 * Note: For shared memoization across components with the same parameter, consider
 * using a library like re-reselect. For this application, per-instance memoization
 * is sufficient and follows Redux best practices.
 */

// Basic selectors
export const selectTransactions = (state) => state.transactions;

/**
 * Memoized selector factory for transactions by account ID
 * Returns a memoized selector that filters transactions for a specific account.
 *
 * Usage in components:
 *   const transactions = useSelector(selectTransactionsByAccountId(accountId));
 *
 * The selector properly memoizes based on both the transactions array AND the accountId.
 */
export const selectTransactionsByAccountId = (accountId) =>
  createSelector([selectTransactions, () => accountId], (transactions, id) =>
    transactions.filter((transaction) => transaction.accountId === id)
  );

/**
 * Memoized selector for a single transaction by ID
 * Returns the transaction matching the given ID, or undefined if not found.
 *
 * The selector properly memoizes based on both the transactions array AND the transactionId.
 */
export const selectTransactionById = (transactionId) =>
  createSelector(
    [selectTransactions, () => transactionId],
    (transactions, id) =>
      transactions.find((transaction) => transaction.id === id)
  );

/**
 * Memoized selector factory for transactions by multiple account IDs
 * Used by hooks that need transactions for multiple accounts.
 *
 * The selector properly memoizes based on both the transactions array AND the accountIds.
 */
export const selectTransactionsByAccountIds = (accountIds) =>
  createSelector(
    [selectTransactions, () => accountIds],
    (transactions, ids) => {
      const accountIdsSet = new Set(ids);
      return transactions.filter((transaction) =>
        accountIdsSet.has(transaction.accountId)
      );
    }
  );
