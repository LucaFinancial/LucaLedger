import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import config from '@/config';
import { generateTransaction } from './generators';
import schemas from './schemas';
import {
  addTransaction,
  updateTransaction as updateTransactionNormalized,
  removeTransaction,
} from './slice';

// Legacy transaction actions (these are in accountsLegacy extraReducers)
import {
  addTransaction as addTransactionLegacy,
  updateTransaction as updateTransactionLegacy,
  removeTransaction as removeTransactionLegacy,
} from '@/store/transactionsLegacy/slice';

export const createNewTransaction = (accountId) => (dispatch) => {
  const newTransaction = generateTransaction({ accountId });

  // Dispatch to normalized store
  dispatch(addTransaction(newTransaction));

  // Dispatch to legacy store (accountsLegacy extraReducers will handle it)
  dispatch(addTransactionLegacy({ accountId, transaction: newTransaction }));
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
        dispatch(
          addTransactionLegacy({ accountId, transaction: firstTransaction })
        );

        // Create transaction for the 15th of the month
        let secondTransactionDate = nextDate.date(15);
        let secondTransaction = generateTransaction({
          accountId,
          date: secondTransactionDate.format(config.dateFormatString),
        });
        secondTransaction.amount = amount;
        secondTransaction.description = description;

        dispatch(addTransaction(secondTransaction));
        dispatch(
          addTransactionLegacy({ accountId, transaction: secondTransaction })
        );

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
        dispatch(
          addTransactionLegacy({ accountId, transaction: newTransaction })
        );

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

    // Dispatch to normalized store
    dispatch(updateTransactionNormalized(updatedTransaction));

    // Dispatch to legacy store
    dispatch(
      updateTransactionLegacy({ accountId, transaction: updatedTransaction })
    );
  };

export const removeTransactionById = (accountId, transaction) => (dispatch) => {
  // Dispatch to normalized store
  dispatch(removeTransaction(transaction.id));

  // Dispatch to legacy store
  dispatch(
    removeTransactionLegacy({ accountId, transactionId: transaction.id })
  );
};
