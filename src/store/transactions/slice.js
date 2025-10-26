import { createSlice } from '@reduxjs/toolkit';

const transactions = createSlice({
  name: 'transactions',
  initialState: [],
  reducers: {
    setTransactions: (state, action) => {
      // Replace all transactions (used when loading from encrypted storage)
      return action.payload;
    },
    addTransaction: (state, action) => {
      state.push(action.payload);
    },
    updateTransaction: (state, action) => {
      const updatedTransaction = action.payload;
      const index = state.findIndex((t) => t.id === updatedTransaction.id);
      if (index !== -1) {
        // Remove balance property if it exists (it's a computed value, not stored)
        // eslint-disable-next-line no-unused-vars
        const { balance, ...cleanTransaction } = updatedTransaction;
        state[index] = { ...state[index], ...cleanTransaction };
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
  setTransactions,
  addTransaction,
  updateTransaction,
  updateMultipleTransactions,
  removeTransaction,
} = transactions.actions;
