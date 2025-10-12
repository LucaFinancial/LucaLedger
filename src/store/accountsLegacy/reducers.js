import { reducers } from '@/store/transactionsLegacy';
import * as accountsActions from '@/store/accounts/slice';
import * as transactionsActions from '@/store/transactions/slice';

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

// Dual-write middleware actions to also update the new unified slices
export const dualWriteAccountAdd = (account) => (dispatch) => {
  // Write to new accounts slice (without transactions and without version)
  const accountWithoutTransactions = {
    id: account.id,
    name: account.name,
    type: account.type,
    statementDay: account.statementDay,
  };
  dispatch(accountsActions.addAccount(accountWithoutTransactions));

  // Write transactions to unified slice
  if (account.transactions && Array.isArray(account.transactions)) {
    account.transactions.forEach((transaction) => {
      dispatch(
        transactionsActions.addTransaction({
          ...transaction,
          accountId: account.id,
        })
      );
    });
  }
};

export const dualWriteAccountUpdate = (account) => (dispatch) => {
  // Update in new accounts slice (without version)
  const accountWithoutTransactions = {
    id: account.id,
    name: account.name,
    type: account.type,
    statementDay: account.statementDay,
  };
  dispatch(accountsActions.updateAccount(accountWithoutTransactions));
};

export const dualWriteAccountRemove = (accountId) => (dispatch, getState) => {
  // Remove from new accounts slice
  dispatch(accountsActions.removeAccount(accountId));

  // Remove all transactions for this account from unified slice
  const state = getState();
  const transactionsToRemove = state.transactions.filter(
    (t) => t.accountId === accountId
  );
  transactionsToRemove.forEach((t) => {
    dispatch(transactionsActions.removeTransaction(t.id));
  });
};

export const dualWriteTransactionAdd =
  (accountId, transaction) => (dispatch) => {
    // Add to unified transactions slice
    dispatch(
      transactionsActions.addTransaction({
        ...transaction,
        accountId,
      })
    );
  };

export const dualWriteTransactionUpdate =
  (accountId, transaction) => (dispatch) => {
    // Update in unified transactions slice
    dispatch(
      transactionsActions.updateTransaction({
        ...transaction,
        accountId,
      })
    );
  };

export const dualWriteTransactionRemove = (transactionId) => (dispatch) => {
  // Remove from unified transactions slice
  dispatch(transactionsActions.removeTransaction(transactionId));
};
