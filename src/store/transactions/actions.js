import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import config from '@/config';
import { generateTransaction } from './generators';
import schemas from './schemas';
import {
  addTransaction,
  updateTransaction as updateTransactionNormalized,
  updateMultipleTransactions,
  removeTransaction,
} from './slice';

export const createNewTransaction = (accountId) => (dispatch) => {
  const newTransaction = generateTransaction({ accountId });

  dispatch(addTransaction(newTransaction));
};

export const createRepeatTransaction = createAsyncThunk(
  'transactions/createRepeat',
  async (
    {
      startDate,
      amount,
      description,
      frequency,
      frequencyCount,
      occurrences,
      accountId,
    },
    { dispatch }
  ) => {
    const startDay = dayjs(startDate).date();
    let nextDate = dayjs(startDate);

    for (let i = 0; i < occurrences; i++) {
      if (frequency === 'Bi-Monthly') {
        // Create transaction for the 1st of the month
        let firstTransactionDate = nextDate.date(1);
        let firstTransaction = generateTransaction({
          accountId,
          date: firstTransactionDate.format(config.dateFormatString),
        });
        firstTransaction.amount = amount;
        firstTransaction.description = description;

        dispatch(addTransaction(firstTransaction));

        // Create transaction for the 15th of the month
        let secondTransactionDate = nextDate.date(15);
        let secondTransaction = generateTransaction({
          accountId,
          date: secondTransactionDate.format(config.dateFormatString),
        });
        secondTransaction.amount = amount;
        secondTransaction.description = description;

        dispatch(addTransaction(secondTransaction));

        // Advance to the next month
        nextDate = nextDate.add(1, 'month');
      } else {
        const initialData = {
          accountId,
          date: nextDate.format(config.dateFormatString),
          amount: amount,
          description,
        };
        const newTransaction = generateTransaction(initialData);
        schemas.transaction.validateSync(newTransaction);

        dispatch(addTransaction(newTransaction));

        if (frequency === 'Days') {
          nextDate = nextDate.add(frequencyCount, 'day');
        } else if (frequency === 'Weeks') {
          nextDate = nextDate.add(frequencyCount, 'week');
        } else if (frequency === 'Months') {
          const nextMonth = nextDate.add(frequencyCount, 'month');
          const nextMonthDays = nextMonth.daysInMonth();
          let nextDay = startDay;
          if (startDay > nextMonthDays) {
            nextDay = nextMonthDays;
          }
          nextDate = nextMonth.date(nextDay);
        } else if (frequency === 'Years') {
          nextDate = nextDate.add(frequencyCount, 'year');
        }
      }
    }
  }
);

export const updateTransactionProperty =
  (accountId, transaction, property, value) => (dispatch) => {
    const updatedTransaction = {
      ...transaction,
      [property]: value,
    };

    dispatch(updateTransactionNormalized(updatedTransaction));
  };

export const removeTransactionById =
  (accountId, transaction) => async (dispatch, getState) => {
    const state = getState();

    // Handle encrypted data if enabled
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      const { deleteEncryptedRecord } = await import('@/crypto/database');
      try {
        await deleteEncryptedRecord('transactions', transaction.id);
      } catch (error) {
        console.error('Failed to delete encrypted transaction:', error);
        // Don't proceed with Redux state update if encrypted deletion fails
        throw error;
      }
    }

    dispatch(removeTransaction(transaction.id));
  };

export const updateMultipleTransactionsStatus =
  (transactionIds, newStatus) => (dispatch) => {
    dispatch(
      updateMultipleTransactions({
        transactionIds,
        updates: { status: newStatus },
      })
    );
  };

export const updateMultipleTransactionsFields =
  (transactionIds, updates) => (dispatch) => {
    // Process date if present - convert dayjs to string format
    const processedUpdates = { ...updates };
    if (
      updates.date &&
      typeof updates.date === 'object' &&
      updates.date.format
    ) {
      processedUpdates.date = updates.date.format(config.dateFormatString);
    }

    dispatch(
      updateMultipleTransactions({
        transactionIds,
        updates: processedUpdates,
      })
    );
  };
