import { createSlice } from '@reduxjs/toolkit';
import { validateSchemaSync } from '@/utils/schemaValidation';

/**
 * Validates and cleans an account object
 * Removes any properties not defined in the schema
 */
const cleanAccount = (account) => {
  try {
    return validateSchemaSync('account', account);
  } catch (error) {
    console.error('Invalid account data:', error);
    // Return the account as-is if validation fails
    // This prevents data loss but logs the issue
    return account;
  }
};

const accounts = createSlice({
  name: 'accounts',
  initialState: {
    data: [],
    loading: false,
    error: null,
    loadingAccountIds: [],
  },
  reducers: {
    setAccounts: (state, action) => {
      // Replace all accounts (used when loading from encrypted storage)
      // Validate and clean each account
      state.data = action.payload.map(cleanAccount);
    },
    addAccount: (state, action) => {
      state.data.push(cleanAccount(action.payload));
    },
    updateAccount: (state, action) => {
      const updatedAccount = cleanAccount(action.payload);
      const index = state.data.findIndex((a) => a.id === updatedAccount.id);
      if (index !== -1) {
        updatedAccount.updatedAt = new Date().toISOString();
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
    addLoadingAccountId: (state, action) => {
      if (!state.loadingAccountIds.includes(action.payload)) {
        state.loadingAccountIds.push(action.payload);
      }
    },
    removeLoadingAccountId: (state, action) => {
      state.loadingAccountIds = state.loadingAccountIds.filter(
        (id) => id !== action.payload,
      );
    },
    clearLoadingAccountIds: (state) => {
      state.loadingAccountIds = [];
    },
  },
});

export default accounts.reducer;

export const {
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setLoading,
  setError,
  addLoadingAccountId,
  removeLoadingAccountId,
  clearLoadingAccountIds,
} = accounts.actions;
