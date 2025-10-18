// Basic selectors
export const selectAccounts = (state) => state.accounts;

// Account selectors
export const selectAccountById = (accountId) => (state) =>
  state.accounts.find((account) => account.id === accountId);
