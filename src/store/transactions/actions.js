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
import { deleteEncryptedRecord } from '@/crypto/database';
import { removeRecurringTransactionEvent } from '@/store/recurringTransactionEvents/slice';
import { actions as transactionLinkActions, selectors as transactionLinkSelectors } from '@/store/transactionLinks';
import {
  getCounterpartAmountForLinkedPair,
  getLinkedTransactionId,
  getSignOrientation,
} from '@/utils/linking';
import { generateTransaction } from './generators';
import {
  addTransaction,
  updateTransaction as updateTransactionNormalized,
  updateMultipleTransactions,
  removeTransaction,
} from './slice';

const LINKED_TRANSACTION_SYNC_FIELDS = new Set([
  'date',
  'amount',
  'transactionState',
  'description',
]);

const buildProcessedUpdates = (updates) => {
  const processedUpdates = { ...updates };
  if (
    updates.date &&
    typeof updates.date === 'object' &&
    updates.date instanceof Date
  ) {
    processedUpdates.date = format(updates.date, config.dateFormatString);
  }

  return processedUpdates;
};

const removeDanglingTransactionLinkIfNeeded = async (
  dispatch,
  transactionLink,
  linkedTransaction,
) => {
  if (transactionLink && !linkedTransaction) {
    await dispatch(transactionLinkActions.removeTransactionLinkById(transactionLink.id));
  }
};

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
  (accountId, transaction, property, value) => async (dispatch, getState) => {
    const state = getState();
    const transactionLink = transactionLinkSelectors.selectTransactionLinkByTransactionId(
      transaction.id,
    )(state);
    const linkedTransactionId = getLinkedTransactionId(
      transactionLink,
      transaction.id,
    );
    const linkedTransaction = linkedTransactionId
      ? state.transactions.find((candidate) => candidate.id === linkedTransactionId)
      : null;

    await removeDanglingTransactionLinkIfNeeded(
      dispatch,
      transactionLink,
      linkedTransaction,
    );

    const updatedTransaction = {
      ...transaction,
      [property]: value,
    };

    dispatch(updateTransactionNormalized(updatedTransaction));

    if (
      !LINKED_TRANSACTION_SYNC_FIELDS.has(property) ||
      !transactionLink ||
      !linkedTransaction
    ) {
      return;
    }

    const linkedUpdates =
      property === 'amount'
        ? {
            amount: getCounterpartAmountForLinkedPair({
              sourceAmount: value,
              counterpartAmount: linkedTransaction.amount,
              orientation: getSignOrientation(
                transaction.amount,
                linkedTransaction.amount,
              ),
            }),
          }
        : property === 'date'
          ? { date: value }
          : { [property]: value };

    dispatch(
      updateTransactionNormalized({
        ...linkedTransaction,
        ...linkedUpdates,
      }),
    );
  };

export const removeTransactionById =
  (accountId, transaction) => async (dispatch, getState) => {
    const state = getState();

    // Check if this transaction is linked to a recurring transaction event
    const recurringEvent = state.recurringTransactionEvents?.find(
      (event) => event.transactionId === transaction.id,
    );
    const transactionLink =
      transactionLinkSelectors.selectTransactionLinkByTransactionId(
        transaction.id,
      )(state);

    // Handle encrypted data if enabled
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      try {
        await deleteEncryptedRecord('transactions', transaction.id);

        // Also delete the linked recurring transaction event if it exists
        if (recurringEvent) {
          await deleteEncryptedRecord(
            'recurringTransactionEvents',
            recurringEvent.id,
          );
        }
      } catch (error) {
        console.error('Failed to delete encrypted transaction:', error);
        // Don't proceed with Redux state update if encrypted deletion fails
        throw error;
      }
    }

    // Remove the transaction from state
    dispatch(removeTransaction(transaction.id));

    if (transactionLink) {
      await dispatch(transactionLinkActions.removeTransactionLinkById(transactionLink.id));
    }

    // Remove the linked recurring transaction event if it exists
    if (recurringEvent) {
      dispatch(removeRecurringTransactionEvent(recurringEvent.id));
    }
  };

export const updateMultipleTransactionsStatus =
  (transactionIds, newStatus) => (dispatch) =>
    dispatch(
      updateMultipleTransactionsFields(transactionIds, {
        transactionState: newStatus,
      }),
    );

export const updateMultipleTransactionsFields =
  (transactionIds, updates) => async (dispatch, getState) => {
    const processedUpdates = buildProcessedUpdates(updates);
    const state = getState();
    const hasLinkedFieldUpdate = Object.keys(processedUpdates).some((field) =>
      LINKED_TRANSACTION_SYNC_FIELDS.has(field),
    );

    if (!hasLinkedFieldUpdate) {
      dispatch(
        updateMultipleTransactions({
          transactionIds,
          updates: processedUpdates,
        }),
      );
      return;
    }

    const transactionLinkMap =
      transactionLinkSelectors.selectTransactionLinkMapByTransactionId(state);
    const updatesByTransactionId = new Map();
    const processedLinkIds = new Set();

    transactionIds.forEach((transactionId) => {
      const transaction = state.transactions.find(
        (candidate) => candidate.id === transactionId,
      );
      if (!transaction) return;

      const transactionLink = transactionLinkMap.get(transactionId) || null;

      if (!transactionLink) {
        updatesByTransactionId.set(transaction.id, {
          ...(updatesByTransactionId.get(transaction.id) || {}),
          ...processedUpdates,
        });
        return;
      }

      if (processedLinkIds.has(transactionLink.id)) {
        return;
      }

      processedLinkIds.add(transactionLink.id);

      const linkedTransactionId = getLinkedTransactionId(
        transactionLink,
        transaction.id,
      );
      const linkedTransaction = state.transactions.find(
        (candidate) => candidate.id === linkedTransactionId,
      );

      if (!linkedTransaction) {
        updatesByTransactionId.set(transaction.id, {
          ...(updatesByTransactionId.get(transaction.id) || {}),
          ...processedUpdates,
        });
        dispatch(transactionLinkActions.removeTransactionLinkById(transactionLink.id));
        return;
      }

      updatesByTransactionId.set(transaction.id, {
        ...(updatesByTransactionId.get(transaction.id) || {}),
        ...processedUpdates,
      });

      const linkedUpdates = { ...(updatesByTransactionId.get(linkedTransaction.id) || {}) };

      if (typeof processedUpdates.date !== 'undefined') {
        linkedUpdates.date = processedUpdates.date;
      }

      if (typeof processedUpdates.amount !== 'undefined') {
        linkedUpdates.amount = getCounterpartAmountForLinkedPair({
          sourceAmount: processedUpdates.amount,
          counterpartAmount: linkedTransaction.amount,
          orientation: getSignOrientation(
            transaction.amount,
            linkedTransaction.amount,
          ),
        });
      }

      Object.entries(processedUpdates).forEach(([field, fieldValue]) => {
        if (!LINKED_TRANSACTION_SYNC_FIELDS.has(field)) {
          // Non-sync fields stay local to the transaction that was explicitly edited.
          return;
        }
        linkedUpdates[field] = linkedUpdates[field] ?? fieldValue;
      });

      updatesByTransactionId.set(linkedTransaction.id, linkedUpdates);
    });

    updatesByTransactionId.forEach((transactionUpdates, transactionId) => {
      const transaction = state.transactions.find(
        (candidate) => candidate.id === transactionId,
      );
      if (!transaction) return;

      dispatch(
        updateTransactionNormalized({
          ...transaction,
          ...transactionUpdates,
        }),
      );
    });
  };
