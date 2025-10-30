export const selectAccountById = (id) => (state) =>
  state.accountsLegacy.find((account) => account.id === id);

export const selectAccounts = (state) => state.accountsLegacy;
