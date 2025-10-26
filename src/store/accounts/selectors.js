import { createSelector } from '@reduxjs/toolkit';

/**
 * Memoized Redux Selectors for Accounts
 *
 * These selectors use createSelector from Redux Toolkit to prevent unnecessary
 * re-renders by memoizing their results. A memoized selector only returns a new
 * reference when its input dependencies actually change, not on every call.
 *
 * This is critical for performance because:
 * 1. React components re-render when their props change by reference
 * 2. Unmemoized selectors that filter/find arrays return new references every call
 * 3. This causes unnecessary re-renders even when the underlying data is unchanged
 *
 * Pattern for parametric selectors:
 * - We use a factory function that returns a memoized selector
 * - The parameter (e.g., accountId) is passed as part of the input selector
 * - This ensures proper memoization based on both state AND parameter changes
 */

// Basic selectors with migration-safe fallbacks
export const selectAccounts = (state) => {
  // Handle migration transition: accounts might still be an array during load
  if (Array.isArray(state.accounts)) {
    return state.accounts;
  }
  return state.accounts?.data || [];
};

export const selectAccountsLoading = (state) => {
  if (Array.isArray(state.accounts)) {
    return false;
  }
  return state.accounts?.loading || false;
};

export const selectAccountsError = (state) => {
  if (Array.isArray(state.accounts)) {
    return null;
  }
  return state.accounts?.error || null;
};

export const selectLoadingAccountIds = (state) => {
  if (Array.isArray(state.accounts)) {
    return [];
  }
  return state.accounts?.loadingAccountIds || [];
};

/**
 * Memoized selector factory for checking if an account is loading
 * Returns a memoized selector that checks if a specific account ID is in the loading list.
 *
 * Usage in components:
 *   const isLoading = useSelector(selectIsAccountLoading(accountId));
 *
 * The selector properly memoizes based on both the loading IDs array AND the accountId.
 */
export const selectIsAccountLoading = (accountId) =>
  createSelector(
    [selectLoadingAccountIds, () => accountId],
    (loadingAccountIds, id) => loadingAccountIds.includes(id)
  );

/**
 * Memoized selector factory for finding an account by ID
 * Returns a memoized selector that finds an account with the given ID.
 *
 * The selector properly memoizes based on both the accounts array AND the accountId.
 */
export const selectAccountById = (accountId) =>
  createSelector([selectAccounts, () => accountId], (accounts, id) =>
    accounts.find((account) => account.id === id)
  );
