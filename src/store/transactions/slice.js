import { createSlice } from '@reduxjs/toolkit';
import { validateTransactionSync } from '@/validation/validator';

/**
 * Sanitizes transaction data before validation
 * Handles legacy data issues like trailing spaces in status
 */
const sanitizeTransaction = (transaction) => {
  const sanitized = { ...transaction };

  // Remove trailing spaces from transactionState (legacy data cleanup)
  if (typeof sanitized.transactionState === 'string') {
    sanitized.transactionState = sanitized.transactionState.trim();
  }

  return sanitized;
};

/**
 * Validates and cleans a transaction object
 * Removes any properties not defined in the schema
 */
const cleanTransaction = (transaction) => {
  try {
    // Sanitize first to fix legacy data issues
    const sanitized = sanitizeTransaction(transaction);
    // Then validate to remove invalid properties
    return validateTransactionSync(sanitized);
  } catch (error) {
    console.error('Invalid transaction data:', error);
    // Return the sanitized version even if validation fails
    // This prevents data loss but logs the issue
    return sanitizeTransaction(transaction);
  }
};

const transactions = createSlice({
  name: 'transactions',
  initialState: [],
  reducers: {
    setTransactions: (state, action) => {
      // Replace all transactions (used when loading from encrypted storage)
      // Validate and clean each transaction
      return action.payload.map(cleanTransaction);
    },
    addTransaction: (state, action) => {
      state.push(cleanTransaction(action.payload));
    },
    updateTransaction: (state, action) => {
      const updatedTransaction = cleanTransaction(action.payload);
      const index = state.findIndex((t) => t.id === updatedTransaction.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...updatedTransaction };
      }
    },
    updateMultipleTransactions: (state, action) => {
      const { transactionIds, updates } = action.payload;
      // Clean the updates object through a temporary transaction validation
      // We can't validate updates alone since they're partial, but we can clean
      // them by merging with an existing transaction and validating
      transactionIds.forEach((id) => {
        const index = state.findIndex((t) => t.id === id);
        if (index !== -1) {
          const merged = { ...state[index], ...updates };
          state[index] = cleanTransaction(merged);
        }
      });
    },
    removeTransaction: (state, action) => {
      const transactionId = action.payload;
      return state.filter((t) => t.id !== transactionId);
    },
  },
});

export default transactions.reducer;

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  updateMultipleTransactions,
  removeTransaction,
} = transactions.actions;
