import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

const cleanSplit = (split) => {
  try {
    return validateSchemaSync('transactionSplit', split);
  } catch (error) {
    console.error('Invalid transaction split data:', error);
    return split;
  }
};

const transactionSplits = createSlice({
  name: 'transactionSplits',
  initialState: [],
  reducers: {
    setTransactionSplits: (state, action) => action.payload.map(cleanSplit),
    addTransactionSplit: (state, action) => {
      state.push(cleanSplit(action.payload));
    },
    updateTransactionSplit: (state, action) => {
      const updated = cleanSplit(action.payload);
      const index = state.findIndex((s) => s.id === updated.id);
      if (index !== -1) {
        updated.updatedAt = new Date().toISOString();
        state[index] = updated;
      }
    },
    removeTransactionSplit: (state, action) =>
      state.filter((split) => split.id !== action.payload),
    setTransactionSplitsForTransaction: (state, action) => {
      const { transactionId, splits } = action.payload;
      const remaining = state.filter((s) => s.transactionId !== transactionId);
      const timestamp = new Date().toISOString();
      return [
        ...remaining,
        ...splits.map((split) => ({
          ...cleanSplit(split),
          updatedAt: timestamp,
        })),
      ];
    },
  },
});

export default transactionSplits.reducer;

export const {
  setTransactionSplits,
  addTransactionSplit,
  updateTransactionSplit,
  removeTransactionSplit,
  setTransactionSplitsForTransaction,
} = transactionSplits.actions;
