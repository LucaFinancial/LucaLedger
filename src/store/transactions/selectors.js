// Basic selectors
export const selectTransactions = (state) => state.transactions;

// Transaction selectors
export const selectTransactionsByAccountId = (accountId) => (state) =>
  state.transactions.filter(
    (transaction) => transaction.accountId === accountId
  );

export const selectTransactionById = (transactionId) => (state) =>
  state.transactions.find((transaction) => transaction.id === transactionId);

// Multi-account transactions selector (for hooks that need transactions for multiple accounts)
export const selectTransactionsByAccountIds = (accountIds) => (state) => {
  const accountIdsSet = new Set(accountIds);
  return state.transactions.filter((transaction) =>
    accountIdsSet.has(transaction.accountId)
  );
};
