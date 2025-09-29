export const selectAccountById = (id) => (state) =>
  state.accounts.find((account) => account.id === id);

export const selectAccounts = (state) => state.accounts;
