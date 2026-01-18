import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';
import { calculateStatementPeriod } from './utils';

/**
 * Validates and cleans a statement object
 * Removes any properties not defined in the schema
 * Normalizes legacy statement fields to startDate/endDate
 */
const cleanStatement = (statement) => {
  try {
    const normalized = { ...statement };

    if (!normalized.startDate && normalized.periodStart) {
      normalized.startDate = normalized.periodStart;
    }
    if (!normalized.endDate) {
      normalized.endDate = normalized.periodEnd || normalized.closingDate;
    }

    delete normalized.periodStart;
    delete normalized.periodEnd;
    delete normalized.closingDate;
    delete normalized.statementPeriod;
    delete normalized.transactionIds;
    delete normalized.isStartDateModified;
    delete normalized.isEndDateModified;
    delete normalized.isTotalModified;
    delete normalized.lockedAt;

    if (
      typeof normalized.total === 'number' &&
      typeof normalized.endingBalance !== 'number'
    ) {
      normalized.endingBalance = normalized.total;
    }
    delete normalized.total;

    const validated = validateSchemaSync('statement', normalized);

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
      const newStatementPeriod = calculateStatementPeriod(newStatement.endDate);
      const isDuplicate = state.some((s) => {
        if (
          s.accountId !== newStatement.accountId ||
          s.id === newStatement.id
        ) {
          return false;
        }
        return calculateStatementPeriod(s.endDate) === newStatementPeriod;
      });

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
        state[index].updatedAt = new Date().toISOString();
      }
    },
    unlockStatement: (state, action) => {
      const statementId = action.payload;
      const index = state.findIndex((s) => s.id === statementId);
      if (index !== -1) {
        // Restore to 'past' status when unlocking
        state[index].status = 'past';
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
