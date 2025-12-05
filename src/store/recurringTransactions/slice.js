import { createSlice } from '@reduxjs/toolkit';
import { validateRecurringTransactionSync } from '@/validation/validator';

/**
 * Validates and cleans a recurring transaction object
 * Removes any properties not defined in the schema
 */
const cleanRecurringTransaction = (recurringTransaction) => {
  try {
    return validateRecurringTransactionSync(recurringTransaction);
  } catch (error) {
    console.error('Invalid recurring transaction data:', error);
    // Return the recurring transaction as-is if validation fails
    // This prevents data loss but logs the issue
    return recurringTransaction;
  }
};

const recurringTransactions = createSlice({
  name: 'recurringTransactions',
  initialState: [],
  reducers: {
    setRecurringTransactions: (state, action) => {
      // Replace all recurring transactions (used when loading from encrypted storage)
      // Validate and clean each recurring transaction
      return action.payload.map(cleanRecurringTransaction);
    },
    addRecurringTransaction: (state, action) => {
      state.push(cleanRecurringTransaction(action.payload));
    },
    updateRecurringTransaction: (state, action) => {
      const updated = cleanRecurringTransaction(action.payload);
      const index = state.findIndex((rt) => rt.id === updated.id);
      if (index !== -1) {
        // Update timestamp
        updated.updatedAt = new Date().toISOString();
        state[index] = { ...state[index], ...updated };
      }
    },
    removeRecurringTransaction: (state, action) => {
      const id = action.payload;
      return state.filter((rt) => rt.id !== id);
    },
  },
});

export default recurringTransactions.reducer;

export const {
  setRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  removeRecurringTransaction,
} = recurringTransactions.actions;
