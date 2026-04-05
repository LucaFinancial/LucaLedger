import { deleteEncryptedRecord } from '@/crypto/database';
import {
  actions as recurringTransactionLinkActions,
  selectors as recurringTransactionLinkSelectors,
} from '@/store/recurringTransactionLinks';
import { actions as transactionLinkActions } from '@/store/transactionLinks';
import { TransactionStateEnum } from '@/store/transactions/constants';
import { generateTransaction } from '@/store/transactions/generators';
import { addTransaction } from '@/store/transactions/slice';
import { getLinkedRecurringTransactionId } from '@/utils/linking';
import { generateRecurringTransactionEvent } from './generators';
import {
  addRecurringTransactionEvent,
  removeRecurringTransactionEvent,
  updateRecurringTransactionEvent,
} from './slice';

const buildRecurringTransactionPayload = (recurringTransaction, occurrenceDate) =>
  generateTransaction({
    accountId: recurringTransaction.accountId,
    date: occurrenceDate,
    amount: recurringTransaction.amount,
    description: recurringTransaction.description,
    categoryId: recurringTransaction.categoryId,
    transactionState: TransactionStateEnum.PLANNED,
  });

const ensureOccurrenceRealized = ({
  dispatch,
  recurringTransaction,
  occurrenceDate,
  existingEvent,
  existingTransaction,
}) => {
  let transaction = existingTransaction || null;

  if (!transaction) {
    transaction = buildRecurringTransactionPayload(recurringTransaction, occurrenceDate);

    if (!transaction) {
      console.error('Failed to create transaction for recurring occurrence');
      return { transaction: null, event: null };
    }

    dispatch(addTransaction(transaction));
  }

  if (existingEvent) {
    const nextEvent = {
      ...existingEvent,
      eventState: 'MODIFIED',
      transactionId: transaction.id,
    };
    dispatch(updateRecurringTransactionEvent(nextEvent));
    return { transaction, event: nextEvent };
  }

  const event = generateRecurringTransactionEvent({
    recurringTransactionId: recurringTransaction.id,
    expectedDate: occurrenceDate,
    eventState: 'MODIFIED',
    transactionId: transaction.id,
  });

  if (!event) {
    console.error('Failed to create recurring transaction event');
    return { transaction: null, event: null };
  }

  dispatch(addRecurringTransactionEvent(event));

  return { transaction, event };
};

export const realizeRecurringTransaction =
  (recurringTransaction, occurrenceDate) => async (dispatch, getState) => {
    const state = getState();
    const recurringTransactionLink =
      recurringTransactionLinkSelectors.selectRecurringTransactionLinkByRecurringTransactionId(
        recurringTransaction.id,
      )(state);

    if (!recurringTransactionLink) {
      return ensureOccurrenceRealized({
        dispatch,
        recurringTransaction,
        occurrenceDate,
      }).transaction;
    }

    const linkedRecurringTransactionId = getLinkedRecurringTransactionId(
      recurringTransactionLink,
      recurringTransaction.id,
    );
    const linkedRecurringTransaction = state.recurringTransactions.find(
      (candidate) => candidate.id === linkedRecurringTransactionId,
    );

    if (!linkedRecurringTransaction) {
      await dispatch(
        recurringTransactionLinkActions.removeRecurringTransactionLinkById(
          recurringTransactionLink.id,
        ),
      );
      return ensureOccurrenceRealized({
        dispatch,
        recurringTransaction,
        occurrenceDate,
      }).transaction;
    }

    const existingSourceEvent = state.recurringTransactionEvents.find(
      (event) =>
        event.recurringTransactionId === recurringTransaction.id &&
        event.expectedDate === occurrenceDate,
    );
    const existingLinkedEvent = state.recurringTransactionEvents.find(
      (event) =>
        event.recurringTransactionId === linkedRecurringTransaction.id &&
        event.expectedDate === occurrenceDate,
    );
    const existingSourceTransaction = existingSourceEvent?.transactionId
      ? state.transactions.find(
          (candidate) => candidate.id === existingSourceEvent.transactionId,
        ) || null
      : null;
    const existingLinkedTransaction = existingLinkedEvent?.transactionId
      ? state.transactions.find(
          (candidate) => candidate.id === existingLinkedEvent.transactionId,
        ) || null
      : null;

    const sourceResult = ensureOccurrenceRealized({
      dispatch,
      recurringTransaction,
      occurrenceDate,
      existingEvent: existingSourceEvent,
      existingTransaction: existingSourceTransaction,
    });
    const linkedResult = ensureOccurrenceRealized({
      dispatch,
      recurringTransaction: linkedRecurringTransaction,
      occurrenceDate,
      existingEvent: existingLinkedEvent,
      existingTransaction: existingLinkedTransaction,
    });

    if (!sourceResult.transaction || !linkedResult.transaction) {
      return sourceResult.transaction;
    }

    await dispatch(
      transactionLinkActions.saveTransactionLinkPair({
        sourceTransactionId: sourceResult.transaction.id,
        destinationTransactionId: linkedResult.transaction.id,
      }),
    );

    return sourceResult.transaction;
  };

export const removeRecurringTransactionEventById =
  (eventId) => async (dispatch, getState) => {
    const state = getState();
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      try {
        await deleteEncryptedRecord('recurringTransactionEvents', eventId);
      } catch (error) {
        console.error('Failed to delete encrypted recurring event:', error);
        throw error;
      }
    }

    dispatch(removeRecurringTransactionEvent(eventId));
  };
