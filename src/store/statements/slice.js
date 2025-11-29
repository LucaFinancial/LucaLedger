import { createSlice } from '@reduxjs/toolkit';
import { validateStatementSync } from '@/validation/validator';

/**
 * Validates and cleans a statement object
 * Removes any properties not defined in the schema
 */
const cleanStatement = (statement) => {
  try {
    return validateStatementSync(statement);
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
      state.push(cleanStatement(action.payload));
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
