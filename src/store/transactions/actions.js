import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import config from '@/config';
import { generateTransaction } from './generators';
import schemas from './schemas';
import { addTransaction, removeTransaction, updateTransaction } from './slice';

// Dual-write actions
import {
  dualWriteTransactionAdd,
  dualWriteTransactionUpdate,
  dualWriteTransactionRemove,
} from '@/store/accountsLegacy/reducers';

export const createNewTransaction = (accountId) => (dispatch) => {
  const newTransaction = generateTransaction({ accountId });
  dispatch(addTransaction(newTransaction));
  dispatch(dualWriteTransactionAdd(accountId, newTransaction));
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
        dispatch(dualWriteTransactionAdd(accountId, firstTransaction));

        // Create transaction for the 15th of the month
        let secondTransactionDate = nextDate.date(15);
        let secondTransaction = generateTransaction({
          accountId,
          date: secondTransactionDate.format(config.dateFormatString),
        });
        secondTransaction.amount = amount;
        secondTransaction.description = description;

        dispatch(addTransaction(secondTransaction));
        dispatch(dualWriteTransactionAdd(accountId, secondTransaction));

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
        dispatch(dualWriteTransactionAdd(accountId, newTransaction));

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
    dispatch(updateTransaction(updatedTransaction));
    dispatch(dualWriteTransactionUpdate(accountId, updatedTransaction));
  };

export const removeTransactionById = (accountId, transaction) => (dispatch) => {
  dispatch(removeTransaction(transaction.id));
  dispatch(dualWriteTransactionRemove(transaction.id));
};
