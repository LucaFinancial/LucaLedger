import { generateStatement } from './generators';
import {
  addStatement,
  updateStatement as updateStatementNormalized,
  removeStatement,
  lockStatement as lockStatementNormalized,
} from './slice';
import {
  getMissingStatementPeriods,
  getCurrentPeriod,
  statementExistsForPeriod,
} from './utils';

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
