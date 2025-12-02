import { createSlice } from '@reduxjs/toolkit';
import { validateStatementSync } from '@/validation/validator';
import { calculateStatementPeriod } from './utils';

/**
 * Validates and cleans a statement object
 * Removes any properties not defined in the schema
 * Ensures statementPeriod is always set
 */
const cleanStatement = (statement) => {
  try {
    const normalized = { ...statement };

    if (
      typeof normalized.total === 'number' &&
      typeof normalized.endingBalance !== 'number'
    ) {
      normalized.endingBalance = normalized.total;
    }
    delete normalized.total;

    const validated = validateStatementSync(normalized);

    if (validated.closingDate) {
      validated.statementPeriod = calculateStatementPeriod(
        validated.closingDate
      );
    }

    if (typeof validated.endingBalance !== 'number') {
      validated.endingBalance = 0;
    }

    if (typeof validated.startingBalance !== 'number') {
      validated.startingBalance = 0;
    }
    if (typeof validated.totalCharges !== 'number') {
      validated.totalCharges = 0;
    }
    if (typeof validated.totalPayments !== 'number') {
      validated.totalPayments = 0;
    }

    return validated;
  } catch (error) {
    console.error('Invalid statement data:', error);
    // Return the original statement even if validation fails
    // This prevents data loss but logs the issue
    return statement;
  }
};

const statements = createSlice({
  name: 'statements',
  initialState: [],
  reducers: {
    setStatements: (state, action) => {
      // Replace all statements (used when loading from encrypted storage)
      // Validate and clean each statement
      return action.payload.map(cleanStatement);
    },
    addStatement: (state, action) => {
      const newStatement = cleanStatement(action.payload);

      // Prevent duplicate statements for the same account and period
      const isDuplicate = state.some(
        (s) =>
          s.accountId === newStatement.accountId &&
          s.statementPeriod === newStatement.statementPeriod &&
          s.id !== newStatement.id
      );

      if (isDuplicate) {
        return;
      }

      state.push(newStatement);
    },
    updateStatement: (state, action) => {
      const updatedStatement = cleanStatement(action.payload);
      const index = state.findIndex((s) => s.id === updatedStatement.id);
      if (index !== -1) {
        // Update timestamp
        updatedStatement.updatedAt = new Date().toISOString();

        // Recalculate statementPeriod based on current closingDate to ensure consistency
        if (updatedStatement.closingDate) {
          updatedStatement.statementPeriod = calculateStatementPeriod(
            updatedStatement.closingDate
          );
        }

        state[index] = { ...state[index], ...updatedStatement };
      }
    },
    removeStatement: (state, action) => {
      const statementId = action.payload;
      return state.filter((s) => s.id !== statementId);
    },
    lockStatement: (state, action) => {
      const statementId = action.payload;
      const index = state.findIndex((s) => s.id === statementId);
      if (index !== -1) {
        state[index].status = 'locked';
        state[index].lockedAt = new Date().toISOString();
        state[index].updatedAt = new Date().toISOString();
      }
    },
    unlockStatement: (state, action) => {
      const statementId = action.payload;
      const index = state.findIndex((s) => s.id === statementId);
      if (index !== -1) {
        // Restore to 'past' status when unlocking
        state[index].status = 'past';
        state[index].lockedAt = null;
        state[index].updatedAt = new Date().toISOString();
      }
    },
  },
});

export default statements.reducer;

export const {
  setStatements,
  addStatement,
  updateStatement,
  removeStatement,
  lockStatement,
  unlockStatement,
} = statements.actions;
