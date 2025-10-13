// Basic selectors
export const selectTransactions = (state) => state.transactions;

// Transaction selectors
export const selectTransactionsByAccountId = (accountId) => (state) =>
  state.transactions.filter(
    (transaction) => transaction.accountId === accountId
  );

export const selectTransactionById = (transactionId) => (state) =>
  state.transactions.find((transaction) => transaction.id === transactionId);
