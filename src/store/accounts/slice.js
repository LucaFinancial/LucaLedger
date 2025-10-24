import { createSlice } from '@reduxjs/toolkit';

const accounts = createSlice({
  name: 'accounts',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    addAccount: (state, action) => {
      state.data.push(action.payload);
    },
    updateAccount: (state, action) => {
      const updatedAccount = action.payload;
      const index = state.data.findIndex((a) => a.id === updatedAccount.id);
      if (index !== -1) {
        state.data[index] = updatedAccount;
      }
    },
    removeAccount: (state, action) => {
      const accountId = action.payload;
      state.data = state.data.filter((a) => a.id !== accountId);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export default accounts.reducer;

export const {
  addAccount,
  updateAccount,
  removeAccount,
  setLoading,
  setError,
} = accounts.actions;
