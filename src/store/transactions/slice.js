import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';
import { format, parseISO, isValid } from 'date-fns';
import { v4 as uuid } from 'uuid';

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

  // Fix date format if needed
  if (sanitized.date) {
    try {
      // Try to parse the date
      const parsed = parseISO(sanitized.date.replace(/\//g, '-'));
      if (isValid(parsed)) {
        // Ensure it's in yyyy-MM-dd format
        sanitized.date = format(parsed, 'yyyy-MM-dd');
      } else {
        // Invalid date, use today's date as fallback
        sanitized.date = format(new Date(), 'yyyy-MM-dd');
      }
    } catch (error) {
      // Error parsing date, use today's date as fallback
      sanitized.date = format(new Date(), 'yyyy-MM-dd');
    }
  } else {
    // No date provided, use today's date
    sanitized.date = format(new Date(), 'yyyy-MM-dd');
  }

  // Validate UUID fields - ensure they're valid UUIDs or null/generate new
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // accountId is required - generate new UUID if invalid
  if (
    !sanitized.accountId ||
    typeof sanitized.accountId !== 'string' ||
    !uuidRegex.test(sanitized.accountId)
  ) {
    sanitized.accountId = uuid();
  }

  // id is required - generate new UUID if invalid
  if (
    !sanitized.id ||
    typeof sanitized.id !== 'string' ||
    !uuidRegex.test(sanitized.id)
  ) {
    sanitized.id = uuid();
  }

  // categoryId should be null or valid UUID
  if (sanitized.categoryId !== null && sanitized.categoryId !== undefined) {
    if (
      typeof sanitized.categoryId !== 'string' ||
      !uuidRegex.test(sanitized.categoryId)
    ) {
      sanitized.categoryId = null;
    }
  }

  // statementId should be null or valid UUID
  if (sanitized.statementId !== null && sanitized.statementId !== undefined) {
    if (
      typeof sanitized.statementId !== 'string' ||
      !uuidRegex.test(sanitized.statementId)
    ) {
      sanitized.statementId = null;
    }
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
    return validateSchemaSync('transaction', sanitized);
  } catch (error) {
    // Silently return the sanitized version if validation fails
    // Sanitization already handles fixing dates and UUIDs
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
        updatedTransaction.updatedAt = new Date().toISOString();
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
          const merged = {
            ...state[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
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
