// Basic selectors
export const selectAccounts = (state) => state.accounts.data;
export const selectAccountsLoading = (state) => state.accounts.loading;
export const selectAccountsError = (state) => state.accounts.error;

// Account selectors
export const selectAccountById = (accountId) => (state) =>
  state.accounts.data.find((account) => account.id === accountId);
