import { createSelector } from '@reduxjs/toolkit';
import { parseISO, differenceInDays } from 'date-fns';
import { selectTransactions } from '../transactions/selectors';
import { calculateStatementPeriod } from './utils';

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
 * Memoized selector factory for statement by account and end date
 * Returns the statement for a specific account with a specific end date.
 *
 * Usage:
 *   const statement = useSelector(selectStatementByAccountIdAndEndDate(accountId, '2025/11/25'));
 */
export const selectStatementByAccountIdAndEndDate = (accountId, endDate) =>
  createSelector(
    [selectStatements, () => accountId, () => endDate],
    (statements, id, date) =>
      statements.find(
        (statement) => statement.accountId === id && statement.endDate === date
      )
  );

/**
 * Helper function to find the statement that ends just before the given statement starts
 * Returns the previous statement or null if not found
 */
export const selectPreviousStatement = (accountId, startDate) =>
  createSelector(
    [selectStatements, () => accountId, () => startDate],
    (statements, id, startDate) => {
      const accountStatements = statements.filter((s) => s.accountId === id);
      // Find statement where endDate is one day before this startDate
      return accountStatements.find((s) => {
        // Parse dates and compare
        const endDate = new Date(s.endDate.replace(/\//g, '-'));
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
export const selectNextStatement = (accountId, endDate) =>
  createSelector(
    [selectStatements, () => accountId, () => endDate],
    (statements, id, endDate) => {
      const accountStatements = statements.filter((s) => s.accountId === id);
      // Find statement where startDate is one day after this endDate
      return accountStatements.find((s) => {
        // Parse dates and compare
        const startDate = new Date(s.startDate.replace(/\//g, '-'));
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
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

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
    const statementPeriod = calculateStatementPeriod(statement.endDate);
    const duplicates = accountStatements.filter(
      (s) => calculateStatementPeriod(s.endDate) === statementPeriod
    );
    if (duplicates.length > 0) {
      issues.hasDuplicate = true;
      issues.duplicateStatement = duplicates[0]; // Keep for backwards compatibility
      issues.duplicateStatements = duplicates;
    }

    // Parse dates for this statement
    const thisStart = parseISO(statement.startDate.replace(/\//g, '-'));
    const thisEnd = parseISO(statement.endDate.replace(/\//g, '-'));

    let previousStatement = null;
    let nextStatement = null;

    accountStatements.forEach((otherStmt) => {
      const otherStartDate = parseISO(otherStmt.startDate.replace(/\//g, '-'));

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

      const neighborStart = parseISO(neighbor.startDate.replace(/\//g, '-'));
      const neighborEnd = parseISO(neighbor.endDate.replace(/\//g, '-'));

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

/**
 * Empty objects for when statement is not found
 */
const EMPTY_STORED = Object.freeze({
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
});

const EMPTY_CALCULATED = Object.freeze({
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  total: 0,
  transactionIds: [],
});

/**
 * Calculate statement balances from transactions
 * This is the single source of truth for balance calculations
 *
 * @param {Array} transactions - Transactions for this statement's period
 * @param {number} startingBalance - Starting balance from previous statement
 * @returns {Object} Calculated balances
 */
function calculateBalancesFromTransactions(transactions, startingBalance = 0) {
  const totalCharges = transactions
    .filter((t) => Number(t.amount) >= 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayments = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  // Total is the net sum (charges - payments, same as sum of all amounts)
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const endingBalance = startingBalance + total;

  return {
    startingBalance,
    endingBalance,
    totalCharges,
    totalPayments,
    total,
    transactionIds: transactions.map((t) => t.id),
  };
}

/**
 * Get stored balance values from a statement object
 * Returns whatever is stored, with fallbacks to 0
 */
function getStoredBalances(statement) {
  return {
    startingBalance:
      typeof statement.startingBalance === 'number'
        ? statement.startingBalance
        : 0,
    endingBalance:
      typeof statement.endingBalance === 'number'
        ? statement.endingBalance
        : typeof statement.total === 'number'
        ? statement.total
        : 0,
    totalCharges:
      typeof statement.totalCharges === 'number' ? statement.totalCharges : 0,
    totalPayments:
      typeof statement.totalPayments === 'number' ? statement.totalPayments : 0,
  };
}

/**
 * Compare stored and calculated values to determine if out of sync
 * Uses a small threshold to handle floating point differences
 */
function areBalancesOutOfSync(stored, calculated) {
  const threshold = 0.01;
  return (
    Math.abs(stored.startingBalance - calculated.startingBalance) > threshold ||
    Math.abs(stored.endingBalance - calculated.endingBalance) > threshold ||
    Math.abs(stored.totalCharges - calculated.totalCharges) > threshold ||
    Math.abs(stored.totalPayments - calculated.totalPayments) > threshold
  );
}

/**
 * Memoized selector for statement with both stored and calculated values
 *
 * Returns:
 * {
 *   stored: { startingBalance, endingBalance, totalCharges, totalPayments, ...statement },
 *   calculated: { startingBalance, endingBalance, totalCharges, totalPayments, total, transactionIds },
 *   isOutOfSync: boolean
 * }
 *
 * UI components should:
 * - Display values from `stored`
 * - Show "Sync" button when `isOutOfSync` is true
 */
export const selectStatementWithCalculations = (statementId) =>
  createSelector(
    [selectStatements, selectTransactions, () => statementId],
    (statements, allTransactions, id) => {
      const statement = statements.find((s) => s.id === id);
      if (!statement) {
        return {
          stored: null,
          calculated: EMPTY_CALCULATED,
          isOutOfSync: false,
        };
      }

      // Get stored values from statement
      const storedBalances = getStoredBalances(statement);

      // Get transactions for this statement's period
      const periodTransactions = allTransactions.filter((t) => {
        if (t.accountId !== statement.accountId) return false;
        const txDate = new Date(t.date.replace(/\//g, '-'));
        const startDate = new Date(statement.startDate.replace(/\//g, '-'));
        const endDate = new Date(statement.endDate.replace(/\//g, '-'));
        return txDate >= startDate && txDate <= endDate;
      });

      // Calculate starting balance from previous statement
      let calculatedStartingBalance = 0;
      if (statement.endDate) {
        const closingDate = new Date(statement.endDate.replace(/\//g, '-'));
        const previousStatements = statements
          .filter((s) => s.accountId === statement.accountId && s.endDate)
          .filter((s) => {
            const sClosingDate = new Date(s.endDate.replace(/\//g, '-'));
            return sClosingDate < closingDate;
          })
          .sort((a, b) => a.endDate.localeCompare(b.endDate));

        if (previousStatements.length > 0) {
          const prevStatement =
            previousStatements[previousStatements.length - 1];
          calculatedStartingBalance =
            typeof prevStatement.endingBalance === 'number'
              ? prevStatement.endingBalance
              : typeof prevStatement.total === 'number'
              ? prevStatement.total
              : 0;
        }
      }

      // Calculate balances from transactions
      const calculated = calculateBalancesFromTransactions(
        periodTransactions,
        calculatedStartingBalance
      );

      // Check if out of sync
      const isOutOfSync = areBalancesOutOfSync(storedBalances, calculated);

      return {
        stored: { ...statement, ...storedBalances },
        calculated,
        isOutOfSync,
      };
    }
  );

/**
 * @deprecated Use selectStatementWithCalculations instead
 * Kept for backward compatibility during migration
 */
export const selectStatementSummary = (statementId) =>
  createSelector([selectStatementWithCalculations(statementId)], (result) => {
    if (!result.stored) {
      return EMPTY_STORED;
    }
    // Return stored values for display
    return {
      startingBalance: result.stored.startingBalance,
      endingBalance: result.stored.endingBalance,
      totalCharges: result.stored.totalCharges,
      totalPayments: result.stored.totalPayments,
    };
  });

/**
 * @deprecated Use selectStatementWithCalculations instead
 * Kept for backward compatibility during migration
 */
export const selectIsStatementOutOfSync = (statementId) =>
  createSelector(
    [selectStatementWithCalculations(statementId)],
    (result) => result.isOutOfSync
  );
