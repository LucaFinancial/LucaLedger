import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  format,
  getDate,
  setDate,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  getDaysInMonth,
} from 'date-fns';

import config from '@/config';
import { generateTransaction } from './generators';
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
    { dispatch },
  ) => {
    const startDay = getDate(startDate);
    let nextDate = startDate;

    for (let i = 0; i < occurrences; i++) {
      if (frequency === 'Bi-Monthly') {
        // Create transaction for the 1st of the month
        let firstTransactionDate = setDate(nextDate, 1);
        let firstTransaction = generateTransaction({
          accountId,
          date: format(firstTransactionDate, config.dateFormatString),
        });
        firstTransaction.amount = amount;
        firstTransaction.description = description;

        dispatch(addTransaction(firstTransaction));

        // Create transaction for the 15th of the month
        let secondTransactionDate = setDate(nextDate, 15);
        let secondTransaction = generateTransaction({
          accountId,
          date: format(secondTransactionDate, config.dateFormatString),
        });
        secondTransaction.amount = amount;
        secondTransaction.description = description;

        dispatch(addTransaction(secondTransaction));

        // Advance to the next month
        nextDate = addMonths(nextDate, 1);
      } else {
        const initialData = {
          accountId,
          date: format(nextDate, config.dateFormatString),
          amount: amount,
          description,
        };
        const newTransaction = generateTransaction(initialData);

        dispatch(addTransaction(newTransaction));

        if (frequency === 'Days') {
          nextDate = addDays(nextDate, frequencyCount);
        } else if (frequency === 'Weeks') {
          nextDate = addWeeks(nextDate, frequencyCount);
        } else if (frequency === 'Months') {
          const nextMonth = addMonths(nextDate, frequencyCount);
          const nextMonthDays = getDaysInMonth(nextMonth);
          let nextDay = startDay;
          if (startDay > nextMonthDays) {
            nextDay = nextMonthDays;
          }
          nextDate = setDate(nextMonth, nextDay);
        } else if (frequency === 'Years') {
          nextDate = addYears(nextDate, frequencyCount);
        }
      }
    }
  },
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
        updates: { transactionState: newStatus },
      }),
    );
  };

export const updateMultipleTransactionsFields =
  (transactionIds, updates) => (dispatch) => {
    // Process date if present - convert Date object to string format
    const processedUpdates = { ...updates };
    if (
      updates.date &&
      typeof updates.date === 'object' &&
      updates.date instanceof Date
    ) {
      processedUpdates.date = format(updates.date, config.dateFormatString);
    }

    dispatch(
      updateMultipleTransactions({
        transactionIds,
        updates: processedUpdates,
      }),
    );
  };
