import { createSlice } from '@reduxjs/toolkit';

const transactions = createSlice({
  name: 'transactions',
  initialState: [],
  reducers: {
    addTransaction: (state, action) => {
      state.push(action.payload);
    },
    updateTransaction: (state, action) => {
      const updatedTransaction = action.payload;
      const index = state.findIndex((t) => t.id === updatedTransaction.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...updatedTransaction };
      }
    },
    updateMultipleTransactions: (state, action) => {
      const { transactionIds, updates } = action.payload;
      transactionIds.forEach((id) => {
        const index = state.findIndex((t) => t.id === id);
        if (index !== -1) {
          state[index] = { ...state[index], ...updates };
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
  addTransaction,
  updateTransaction,
  updateMultipleTransactions,
  removeTransaction,
} = transactions.actions;
