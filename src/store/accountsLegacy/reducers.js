import { reducers } from '@/store/transactionsLegacy';

export const addAccountReducer = (state, action) => {
  const account = action.payload;
  // Normalize transaction amounts to numbers
  const normalizedAccount = {
    ...account,
    transactions: account.transactions.map((t) => ({
      ...t,
      amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
    })),
  };
  state.push(normalizedAccount);
};

export const updateAccountReducer = (state, action) => {
  const updatedAccount = action.payload;
  const accountIndex = state.findIndex(
    (account) => account.id === updatedAccount.id
  );
  if (accountIndex !== -1) {
    state[accountIndex] = updatedAccount;
  }
};

export const removeAccountReducer = (state, action) => {
  const accountId = action.payload;
  return state.filter((account) => account.id !== accountId);
};

export const extraReducers = (builder) => {
  builder.addCase(reducers.addTransaction, (state, action) => {
    const { accountId, transaction } = action.payload;
    const accountIndex = state.findIndex((account) => account.id === accountId);
    if (accountIndex !== -1) {
      // Ensure accountId is set on the transaction
      const transactionWithAccountId = {
        ...transaction,
        accountId,
      };
      state[accountIndex].transactions.push(transactionWithAccountId);
    }
  });
  builder.addCase(reducers.updateTransaction, (state, action) => {
    const { accountId, transaction: updatedTransaction } = action.payload;
    const accountIndex = state.findIndex((account) => account.id === accountId);
    if (accountIndex !== -1) {
      const transactionIndex = state[accountIndex].transactions.findIndex(
        (t) => t.id === updatedTransaction.id
      );
      if (transactionIndex !== -1) {
        const existing = state[accountIndex].transactions[transactionIndex];
        state[accountIndex].transactions[transactionIndex] = {
          ...existing,
          ...updatedTransaction,
          // Ensure accountId is preserved
          accountId,
        };
      }
    }
  });
  builder.addCase(reducers.removeTransaction, (state, action) => {
    const { accountId, transactionId } = action.payload;
    const accountIndex = state.findIndex((account) => account.id === accountId);
    if (accountIndex !== -1) {
      state[accountIndex].transactions = state[
        accountIndex
      ].transactions.filter((t) => t.id !== transactionId);
    }
  });
};
