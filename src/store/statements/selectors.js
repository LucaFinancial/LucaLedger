import { createSelector } from '@reduxjs/toolkit';

/**
 * Memoized Redux Selectors for Statements
 *
 * These selectors use createSelector from Redux Toolkit to prevent unnecessary
 * re-renders by memoizing their results.
 */

// Basic selectors
export const selectStatements = (state) => state.statements;

/**
 * Memoized selector factory for statements by account ID
 * Returns a memoized selector that filters statements for a specific account.
 *
 * Usage in components:
 *   const statements = useSelector(selectStatementsByAccountId(accountId));
 *
 * The selector properly memoizes based on both the statements array AND the accountId.
 */
export const selectStatementsByAccountId = (accountId) =>
  createSelector([selectStatements, () => accountId], (statements, id) =>
    statements.filter((statement) => statement.accountId === id)
  );

/**
 * Memoized selector for a single statement by ID
 * Returns the statement matching the given ID, or undefined if not found.
 *
 * The selector properly memoizes based on both the statements array AND the statementId.
 */
export const selectStatementById = (statementId) =>
  createSelector([selectStatements, () => statementId], (statements, id) =>
    statements.find((statement) => statement.id === id)
  );

/**
 * Memoized selector factory for statements by account ID and status
 * Returns statements for a specific account filtered by status.
 *
 * Usage:
 *   const currentStatements = useSelector(selectStatementsByAccountIdAndStatus(accountId, 'current'));
 */
export const selectStatementsByAccountIdAndStatus = (accountId, status) =>
  createSelector(
    [selectStatements, () => accountId, () => status],
    (statements, id, statusValue) =>
      statements.filter(
        (statement) =>
          statement.accountId === id && statement.status === statusValue
      )
  );

/**
 * Memoized selector factory for statement by account and closing date
 * Returns the statement for a specific account with a specific closing date.
 *
 * Usage:
 *   const statement = useSelector(selectStatementByAccountIdAndClosingDate(accountId, '2025/11/25'));
 */
export const selectStatementByAccountIdAndClosingDate = (
  accountId,
  closingDate
) =>
  createSelector(
    [selectStatements, () => accountId, () => closingDate],
    (statements, id, date) =>
      statements.find(
        (statement) =>
          statement.accountId === id && statement.closingDate === date
      )
  );

/**
 * Helper function to find the statement that ends just before the given statement starts
 * Returns the previous statement or null if not found
 */
export const selectPreviousStatement = (accountId, periodStart) =>
  createSelector(
    [selectStatements, () => accountId, () => periodStart],
    (statements, id, startDate) => {
      const accountStatements = statements.filter((s) => s.accountId === id);
      // Find statement where periodEnd is one day before this periodStart
      return accountStatements.find((s) => {
        // Parse dates and compare
        const endDate = new Date(s.periodEnd.replace(/\//g, '-'));
        const checkDate = new Date(startDate.replace(/\//g, '-'));
        checkDate.setDate(checkDate.getDate() - 1);
        return endDate.getTime() === checkDate.getTime();
      });
    }
  );

/**
 * Helper function to find the statement that starts just after the given statement ends
 * Returns the next statement or null if not found
 */
export const selectNextStatement = (accountId, periodEnd) =>
  createSelector(
    [selectStatements, () => accountId, () => periodEnd],
    (statements, id, endDate) => {
      const accountStatements = statements.filter((s) => s.accountId === id);
      // Find statement where periodStart is one day after this periodEnd
      return accountStatements.find((s) => {
        // Parse dates and compare
        const startDate = new Date(s.periodStart.replace(/\//g, '-'));
        const checkDate = new Date(endDate.replace(/\//g, '-'));
        checkDate.setDate(checkDate.getDate() + 1);
        return startDate.getTime() === checkDate.getTime();
      });
    }
  );
