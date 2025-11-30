import { generateStatement } from './generators';
import {
  addStatement,
  updateStatement as updateStatementNormalized,
  removeStatement,
  lockStatement as lockStatementNormalized,
  unlockStatement as unlockStatementNormalized,
} from './slice';
import {
  getMissingStatementPeriods,
  getTransactionsInPeriod,
  summarizeStatementTransactions,
} from './utils';
import { addDays, subDays, parseISO, format } from 'date-fns';

const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  try {
    const parsed = parseISO(dateStr.replace(/\//g, '-'));
    return isNaN(parsed?.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

const getSortDate = (statement, overrideStart) => {
  const candidates = [
    overrideStart,
    statement.periodStart,
    statement.periodEnd,
    statement.closingDate,
  ];
  for (const candidate of candidates) {
    const parsed = parseDateSafe(candidate);
    if (parsed) {
      return parsed;
    }
  }
  return null;
};

const stripSortMetadata = (statement) => {
  if (!statement) return null;
  const rest = { ...statement };
  delete rest.__sortValue;
  return rest;
};

const getStatementEndingBalance = (statement) => {
  if (!statement) return 0;
  if (typeof statement.endingBalance === 'number') {
    return statement.endingBalance;
  }
  if (typeof statement.total === 'number') {
    return statement.total;
  }
  return 0;
};

const getPreviousEndingBalance = (statements, closingDate) => {
  if (!closingDate) return 0;
  const closing = parseDateSafe(closingDate);
  if (!closing) return 0;

  let balance = 0;
  statements.forEach((stmt) => {
    const stmtClosing = parseDateSafe(stmt.closingDate);
    if (stmtClosing && stmtClosing < closing) {
      balance = getStatementEndingBalance(stmt);
    }
  });
  return balance;
};

/**
 * Creates a new statement for an account
 * @param {Object} statementData - Statement data (accountId, closingDate, periodStart, periodEnd, etc.)
 */
export const createNewStatement = (statementData) => (dispatch, getState) => {
  const state = getState();
  const transactions = state.transactions;
  const accountStatements = state.statements.filter(
    (s) => s.accountId === statementData.accountId
  );

  const transactionIds =
    statementData.transactionIds && statementData.transactionIds.length > 0
      ? statementData.transactionIds
      : getTransactionsInPeriod(
          transactions,
          statementData.accountId,
          statementData.periodStart,
          statementData.periodEnd
        );

  const { totalCharges, totalPayments } = summarizeStatementTransactions(
    transactions,
    transactionIds
  );

  const startingBalance = getPreviousEndingBalance(
    accountStatements,
    statementData.closingDate
  );

  const endingBalance = startingBalance + totalCharges - totalPayments;

  const enrichedStatement = {
    ...statementData,
    transactionIds,
    totalCharges,
    totalPayments,
    startingBalance,
    endingBalance,
  };

  const newStatement = generateStatement(enrichedStatement);
  if (newStatement) {
    dispatch(addStatement(newStatement));
  }
  return newStatement;
};

/**
 * Updates a statement property
 * If periodStart or periodEnd changes, automatically adjusts adjacent statements to prevent overlaps
 * @param {string} statementId - Statement ID
 * @param {Object} updates - Object with properties to update
 */
export const updateStatementProperty =
  (statementId, updates) => (dispatch, getState) => {
    const state = getState();
    const statement = state.statements.find((s) => s.id === statementId);

    if (!statement) {
      console.error('Statement not found:', statementId);
      return;
    }

    // Prevent updates to locked statements
    if (statement.status === 'locked') {
      console.error('Cannot update locked statement:', statementId);
      return;
    }

    const accountStatements = state.statements.filter(
      (s) => s.accountId === statement.accountId
    );

    const sortedStatements = accountStatements
      .map((s) => {
        const overrideStart =
          s.id === statementId && updates.periodStart
            ? updates.periodStart
            : undefined;
        const sortDate = getSortDate(s, overrideStart);
        return {
          ...s,
          __sortValue: sortDate ? sortDate.getTime() : Number.NEGATIVE_INFINITY,
        };
      })
      .sort((a, b) => a.__sortValue - b.__sortValue);

    const currentIndex = sortedStatements.findIndex(
      (s) => s.id === statementId
    );
    const previousStatement =
      currentIndex > 0
        ? stripSortMetadata(sortedStatements[currentIndex - 1])
        : null;
    const nextStatement =
      currentIndex !== -1 && currentIndex < sortedStatements.length - 1
        ? stripSortMetadata(sortedStatements[currentIndex + 1])
        : null;

    // Check if periodStart changed
    if (updates.periodStart && updates.periodStart !== statement.periodStart) {
      if (!previousStatement) {
        console.warn('No previous statement found to adjust');
      }

      if (previousStatement) {
        // Check if previous statement is locked
        if (previousStatement.status === 'locked') {
          console.error(
            'Cannot update statement: previous statement is locked',
            previousStatement.id
          );
          return;
        }

        // Calculate the new end date for previous statement (one day before new start)
        const newStartDate = parseDateSafe(updates.periodStart);
        if (!newStartDate) {
          console.error('Invalid new periodStart provided');
          return;
        }
        const newPrevEndDate = format(subDays(newStartDate, 1), 'yyyy/MM/dd');

        // Update previous statement's end date
        dispatch(
          updateStatementNormalized({
            ...previousStatement,
            periodEnd: newPrevEndDate,
            isEndDateModified: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    }

    // Check if periodEnd changed
    if (updates.periodEnd && updates.periodEnd !== statement.periodEnd) {
      if (nextStatement) {
        // Check if next statement is locked
        if (nextStatement.status === 'locked') {
          console.error(
            'Cannot update statement: next statement is locked',
            nextStatement.id
          );
          return;
        }

        // Calculate the new start date for next statement (one day after new end)
        const newEndDate = parseDateSafe(updates.periodEnd);
        if (!newEndDate) {
          console.error('Invalid new periodEnd provided');
          return;
        }
        const newNextStartDate = format(addDays(newEndDate, 1), 'yyyy/MM/dd');

        // Update next statement's start date
        dispatch(
          updateStatementNormalized({
            ...nextStatement,
            periodStart: newNextStartDate,
            isStartDateModified: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    }

    const updatedStatement = {
      ...statement,
      ...updates,
    };

    dispatch(updateStatementNormalized(updatedStatement));
  };

/**
 * Removes a statement by ID
 * @param {string} statementId - Statement ID
 */
export const removeStatementById =
  (statementId) => async (dispatch, getState) => {
    const state = getState();

    // Handle encrypted data if enabled
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      const { deleteEncryptedRecord } = await import('@/crypto/database');
      try {
        await deleteEncryptedRecord('statements', statementId);
      } catch (error) {
        console.error('Failed to delete encrypted statement:', error);
        throw error;
      }
    }

    dispatch(removeStatement(statementId));
  };

/**
 * Locks a statement
 * @param {string} statementId - Statement ID
 */
export const lockStatement = (statementId) => (dispatch) => {
  dispatch(lockStatementNormalized(statementId));
};

/**
 * Unlocks a statement
 * @param {string} statementId - Statement ID
 */
export const unlockStatement = (statementId) => (dispatch) => {
  dispatch(unlockStatementNormalized(statementId));
};

/**
 * Deletes a statement
 * @param {string} statementId - Statement ID
 */
export const deleteStatement = (statementId) => (dispatch) => {
  dispatch(removeStatement(statementId));
};

/**
 * Fixes an overlap issue by adjusting the adjacent statement's dates
 * @param {string} currentStatementId - The statement being viewed
 * @param {string} adjacentStatementId - The statement with overlapping/gap dates
 */
export const fixStatementIssue =
  (currentStatementId, adjacentStatementId) => (dispatch, getState) => {
    const state = getState();
    const currentStmt = state.statements.find(
      (s) => s.id === currentStatementId
    );
    const adjacentStmt = state.statements.find(
      (s) => s.id === adjacentStatementId
    );

    if (!currentStmt || !adjacentStmt) {
      console.error('Statements not found for fix operation');
      return;
    }

    // Determine which statement comes first chronologically
    const currentStart = parseISO(currentStmt.periodStart.replace(/\//g, '-'));
    const adjacentStart = parseISO(
      adjacentStmt.periodStart.replace(/\//g, '-')
    );

    if (currentStart < adjacentStart) {
      // Current statement is before adjacent - adjust adjacent's start date
      const newAdjacentStart = format(
        addDays(parseISO(currentStmt.periodEnd.replace(/\//g, '-')), 1),
        'yyyy/MM/dd'
      );
      dispatch(
        updateStatementNormalized({
          ...adjacentStmt,
          periodStart: newAdjacentStart,
          isStartDateModified: true,
          updatedAt: new Date().toISOString(),
        })
      );
    } else {
      // Current statement is after adjacent - adjust adjacent's end date
      const newAdjacentEnd = format(
        subDays(parseISO(currentStmt.periodStart.replace(/\//g, '-')), 1),
        'yyyy/MM/dd'
      );
      dispatch(
        updateStatementNormalized({
          ...adjacentStmt,
          periodEnd: newAdjacentEnd,
          isEndDateModified: true,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  };

/**
 * Auto-generates statements for an account (current + backfill)
 * This is the main entry point for auto-generation
 * @param {string} accountId - Account ID
 * @returns {Array} - Array of created statements
 */
export const autoGenerateStatements = (accountId) => (dispatch, getState) => {
  const state = getState();
  const account = state.accounts.data.find((a) => a.id === accountId);

  if (!account || !account.statementDay) {
    return []; // Not a credit card or no statement day configured
  }

  const statements = state.statements.filter((s) => s.accountId === accountId);
  const transactions = state.transactions.filter(
    (t) => t.accountId === accountId
  );

  // Get all missing periods (includes current)
  const missingPeriods = getMissingStatementPeriods(
    account,
    statements,
    transactions
  );

  // Create statements for each missing period
  const createdStatements = [];
  missingPeriods.forEach((periodData) => {
    const newStatement = generateStatement(periodData);
    if (newStatement) {
      dispatch(addStatement(newStatement));
      createdStatements.push(newStatement);
    }
  });

  return createdStatements;
};
