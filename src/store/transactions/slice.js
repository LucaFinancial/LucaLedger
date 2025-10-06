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
    removeTransaction: (state, action) => {
      const transactionId = action.payload;
      return state.filter((t) => t.id !== transactionId);
    },
  },
});

export default transactions.reducer;

export const { addTransaction, updateTransaction, removeTransaction } =
  transactions.actions;
