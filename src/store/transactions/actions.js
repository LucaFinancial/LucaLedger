import { v4 as uuidv4 } from 'uuid';

import { addTransaction, updateTransaction } from './slice';
import { TransactionStateEnum } from '@/store/constants';

export const createNewTransaction = (accountId) => (dispatch) => {
  const newTransaction = {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0],
    description: `New transaction for account ${accountId}`,
    amount: 0,
    payorId: accountId,
    payeeId: accountId,
    categoryId: null,
    transactionState: TransactionStateEnum.PLANNED,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  dispatch(addTransaction(newTransaction));
};

export const updateTransactionById = (id, updatedTransaction) => (dispatch) => {
  dispatch(
    updateTransaction({
      id,
      ...updatedTransaction,
      updatedAt: new Date().toISOString(),
    })
  );
};

export const removeTransactionById = (id) => (dispatch) => {
  dispatch(
    updateTransaction({
      id,
      transactionState: TransactionStateEnum.DELETED,
      updatedAt: new Date().toISOString(),
    })
  );
};
