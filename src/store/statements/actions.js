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
  getCurrentPeriod,
  statementExistsForPeriod,
} from './utils';
import { addDays, subDays, parseISO, format } from 'date-fns';

/**
 * Creates a new statement for an account
 * @param {Object} statementData - Statement data (accountId, closingDate, periodStart, periodEnd, etc.)
 */
export const createNewStatement = (statementData) => (dispatch) => {
  const newStatement = generateStatement(statementData);
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

    // Check if periodStart changed
    if (updates.periodStart && updates.periodStart !== statement.periodStart) {
      // Find the previous statement (chronologically before this one by year/month)
      const accountStatements = state.statements.filter(
        (s) => s.accountId === statement.accountId && s.id !== statementId
      );

      // Get year/month of the original statement
      const originalStartDate = parseISO(
        statement.periodStart.replace(/\//g, '-')
      );
      const originalYear = originalStartDate.getFullYear();
      const originalMonth = originalStartDate.getMonth();

      // Find the statement from the previous month
      const prevStatement = accountStatements.find((s) => {
        const sStart = parseISO(s.periodStart.replace(/\//g, '-'));
        const sYear = sStart.getFullYear();
        const sMonth = sStart.getMonth();

        // Check if this statement is from the month before
        if (originalMonth === 0) {
          // Original is January, look for December of previous year
          return sYear === originalYear - 1 && sMonth === 11;
        } else {
          // Look for previous month in same year
          return sYear === originalYear && sMonth === originalMonth - 1;
        }
      });

      if (prevStatement) {
        // Check if previous statement is locked
        if (prevStatement.status === 'locked') {
          console.error(
            'Cannot update statement: previous statement is locked',
            prevStatement.id
          );
          return;
        }

        // Calculate the new end date for previous statement (one day before new start)
        const newStartDate = parseISO(updates.periodStart.replace(/\//g, '-'));
        const newPrevEndDate = format(subDays(newStartDate, 1), 'yyyy/MM/dd');

        // Update previous statement's end date
        dispatch(
          updateStatementNormalized({
            ...prevStatement,
            periodEnd: newPrevEndDate,
            isEndDateModified: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    }

    // Check if periodEnd changed
    if (updates.periodEnd && updates.periodEnd !== statement.periodEnd) {
      // Find the next statement (chronologically after this one by year/month)
      const accountStatements = state.statements.filter(
        (s) => s.accountId === statement.accountId && s.id !== statementId
      );

      // Get year/month of the original statement
      const originalEndDate = parseISO(statement.periodEnd.replace(/\//g, '-'));
      const originalYear = originalEndDate.getFullYear();
      const originalMonth = originalEndDate.getMonth();

      // Find the statement from the next month
      const nextStatement = accountStatements.find((s) => {
        const sStart = parseISO(s.periodStart.replace(/\//g, '-'));
        const sYear = sStart.getFullYear();
        const sMonth = sStart.getMonth();

        // Check if this statement is from the month after
        if (originalMonth === 11) {
          // Original is December, look for January of next year
          return sYear === originalYear + 1 && sMonth === 0;
        } else {
          // Look for next month in same year
          return sYear === originalYear && sMonth === originalMonth + 1;
        }
      });

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
        const newEndDate = parseISO(updates.periodEnd.replace(/\//g, '-'));
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
 * Auto-generates the current period statement if it doesn't exist
 * @param {string} accountId - Account ID
 * @returns {Object|null} - Created statement or null if not needed
 */
export const ensureCurrentStatement = (accountId) => (dispatch, getState) => {
  const state = getState();
  const account = state.accounts.data.find((a) => a.id === accountId);

  if (!account || !account.statementDay) {
    return null; // Not a credit card or no statement day configured
  }

  const statements = state.statements.filter((s) => s.accountId === accountId);
  const transactions = state.transactions.filter(
    (t) => t.accountId === accountId
  );

  // Get current period
  const currentPeriod = getCurrentPeriod(account.statementDay);

  // Check if statement already exists for current period
  if (
    statementExistsForPeriod(statements, accountId, currentPeriod.closingDate)
  ) {
    return null; // Already exists
  }

  // Get missing periods (will include current if missing)
  const missingPeriods = getMissingStatementPeriods(
    account,
    statements,
    transactions
  );

  // Find the current period in missing periods
  const currentMissing = missingPeriods.find(
    (p) => p.closingDate === currentPeriod.closingDate
  );

  if (currentMissing) {
    const newStatement = generateStatement(currentMissing);
    if (newStatement) {
      dispatch(addStatement(newStatement));
      return newStatement;
    }
  }

  return null;
};

/**
 * Auto-generates all missing historical statements for an account
 * @param {string} accountId - Account ID
 * @returns {Array} - Array of created statements
 */
export const backfillStatements = (accountId) => (dispatch, getState) => {
  const state = getState();
  const account = state.accounts.data.find((a) => a.id === accountId);

  if (!account || !account.statementDay) {
    return []; // Not a credit card or no statement day configured
  }

  const statements = state.statements.filter((s) => s.accountId === accountId);
  const transactions = state.transactions.filter(
    (t) => t.accountId === accountId
  );

  // Get all missing periods
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

/**
 * Auto-generates statements for an account (current + backfill)
 * This is the main entry point for auto-generation
 * @param {string} accountId - Account ID
 * @returns {Object} - { current, backfilled }
 */
export const autoGenerateStatements = (accountId) => (dispatch) => {
  // First ensure current statement exists
  const current = dispatch(ensureCurrentStatement(accountId));

  // Then backfill any missing historical statements
  const backfilled = dispatch(backfillStatements(accountId));

  return {
    current,
    backfilled,
  };
};

/**
 * Auto-generates statements for all credit card accounts
 * @returns {Object} - Map of accountId to generation results
 */
export const autoGenerateAllStatements = () => (dispatch, getState) => {
  const state = getState();
  const creditCardAccounts = state.accounts.data.filter(
    (a) => a.type === 'Credit Card' && a.statementDay
  );

  const results = {};
  creditCardAccounts.forEach((account) => {
    results[account.id] = dispatch(autoGenerateStatements(account.id));
  });

  return results;
};
