import { createSlice } from '@reduxjs/toolkit';

const accounts = createSlice({
  name: 'accounts',
  initialState: [],
  reducers: {
    addAccount: (state, action) => {
      state.push(action.payload);
    },
    updateAccount: (state, action) => {
      const updatedAccount = action.payload;
      const index = state.findIndex((a) => a.id === updatedAccount.id);
      if (index !== -1) {
        state[index] = updatedAccount;
      }
    },
    removeAccount: (state, action) => {
      const accountId = action.payload;
      return state.filter((a) => a.id !== accountId);
    },
  },
});

export default accounts.reducer;

export const { addAccount, updateAccount, removeAccount } = accounts.actions;
