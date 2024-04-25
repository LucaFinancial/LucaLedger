import { createSelector } from '@reduxjs/toolkit';

export const selectTransactionsSlice = (state) => state.transactions;

export const selectAllTransactions = createSelector(
  selectTransactionsSlice,
  (transactions) => transactions.transactionsList
);

export const selectTransactionsByAccountId = (accountId) =>
  createSelector(selectTransactionsSlice, (transactions) =>
    transactions.transactionsList.filter(
      (transaction) =>
        transaction.payorId === accountId || transaction.payeeId === accountId
    )
  );
