import { createSelector } from '@reduxjs/toolkit';
import { parseISO, differenceInDays } from 'date-fns';
import { selectTransactions } from '../transactions/selectors';
import { calculateStatementBalances, isStatementOutOfSync } from './utils';

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

/**
 * Detect issues with a statement (duplicates, overlaps, gaps)
 * Returns an object with issue details or null if no issues
 */
export const selectStatementIssues = (statementId) =>
  createSelector([selectStatements, () => statementId], (statements, id) => {
    const statement = statements.find((s) => s.id === id);
    if (!statement) return null;

    const accountStatements = statements
      .filter((s) => s.accountId === statement.accountId && s.id !== id)
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const issues = {
      hasDuplicate: false,
      hasOverlap: false,
      hasGap: false,
      duplicateStatement: null,
      duplicateStatements: [],
      overlapStatement: null,
      gapStatement: null,
      overlapDays: 0,
      gapDays: 0,
    };

    // Check for duplicate period - find ALL duplicates
    const duplicates = accountStatements.filter(
      (s) => s.statementPeriod === statement.statementPeriod
    );
    if (duplicates.length > 0) {
      issues.hasDuplicate = true;
      issues.duplicateStatement = duplicates[0]; // Keep for backwards compatibility
      issues.duplicateStatements = duplicates;
    }

    // Parse dates for this statement
    const thisStart = parseISO(statement.periodStart.replace(/\//g, '-'));
    const thisEnd = parseISO(statement.periodEnd.replace(/\//g, '-'));

    let previousStatement = null;
    let nextStatement = null;

    accountStatements.forEach((otherStmt) => {
      const otherStartDate = parseISO(
        otherStmt.periodStart.replace(/\//g, '-')
      );

      if (otherStartDate < thisStart) {
        previousStatement = otherStmt;
        return;
      }

      if (!nextStatement && otherStartDate > thisStart) {
        nextStatement = otherStmt;
      }
    });

    const analyzeNeighbor = (neighbor, position) => {
      if (!neighbor) return;

      const neighborStart = parseISO(neighbor.periodStart.replace(/\//g, '-'));
      const neighborEnd = parseISO(neighbor.periodEnd.replace(/\//g, '-'));

      const overlaps =
        thisStart <= neighborEnd &&
        thisEnd >= neighborStart &&
        !issues.hasDuplicate;

      if (overlaps) {
        const overlapStart =
          thisStart > neighborStart ? thisStart : neighborStart;
        const overlapEnd = thisEnd < neighborEnd ? thisEnd : neighborEnd;
        const days = differenceInDays(overlapEnd, overlapStart) + 1;

        if (days > 0) {
          issues.hasOverlap = true;
          issues.overlapStatement = neighbor;
          issues.overlapDays = days;
          return;
        }
      }

      if (position === 'previous' && neighborEnd < thisStart) {
        const daysBetween = differenceInDays(thisStart, neighborEnd);
        if (daysBetween > 1 && !issues.hasGap) {
          issues.hasGap = true;
          issues.gapStatement = neighbor;
          issues.gapDays = daysBetween - 1;
        }
      } else if (position === 'next' && thisEnd < neighborStart) {
        const daysBetween = differenceInDays(neighborStart, thisEnd);
        if (daysBetween > 1 && !issues.hasGap) {
          issues.hasGap = true;
          issues.gapStatement = neighbor;
          issues.gapDays = daysBetween - 1;
        }
      }
    };

    analyzeNeighbor(previousStatement, 'previous');
    analyzeNeighbor(nextStatement, 'next');

    // Return null if no issues found
    if (!issues.hasDuplicate && !issues.hasOverlap && !issues.hasGap) {
      return null;
    }

    return issues;
  });

const EMPTY_SUMMARY = {
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
};

/**
 * Memoized selector for statement summary with centralized calculation
 * Respects locked state and provides consistent calculations across all views
 */
export const selectStatementSummary = (statementId) =>
  createSelector(
    [selectStatements, selectTransactions, () => statementId],
    (statements, transactions, id) => {
      const statement = statements.find((s) => s.id === id);
      if (!statement) {
        return EMPTY_SUMMARY;
      }

      // Use centralized calculation logic
      return calculateStatementBalances(
        statement,
        transactions,
        statements,
        false // Don't force recalculation for locked statements
      );
    }
  );

/**
 * Memoized selector to check if a statement is out of sync
 * Only relevant for locked statements
 */
export const selectIsStatementOutOfSync = (statementId) =>
  createSelector(
    [selectStatements, selectTransactions, () => statementId],
    (statements, transactions, id) => {
      const statement = statements.find((s) => s.id === id);
      if (!statement) {
        return false;
      }

      return isStatementOutOfSync(statement, transactions, statements);
    }
  );
