// Basic selectors
export const selectAccounts = (state) => state.accounts;
export const selectTransactions = (state) => state.transactions;

// Account selectors
export const selectAccountById = (accountId) => (state) =>
  state.accounts.find((account) => account.id === accountId);

// Transaction selectors
export const selectTransactionsByAccountId = (accountId) => (state) =>
  state.transactions.filter(
    (transaction) => transaction.accountId === accountId
  );

// Combined selectors - for components that need account with transactions
export const selectAccountWithTransactions = (accountId) => (state) => {
  const account = state.accounts.find((a) => a.id === accountId);
  if (!account) return null;

  const transactions = state.transactions.filter(
    (t) => t.accountId === accountId
  );

  return {
    ...account,
    transactions,
  };
};

// Selector for all accounts with their transactions
export const selectAccountsWithTransactions = (state) => {
  return state.accounts.map((account) => ({
    ...account,
    transactions: state.transactions.filter((t) => t.accountId === account.id),
  }));
};
