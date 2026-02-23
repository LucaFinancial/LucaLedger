import { deleteEncryptedRecord } from '@/crypto/database';
import { getCurrentUserForMiddleware } from '@/store/encryptedMiddleware';
import { TransactionStateEnum } from '@/store/transactions/constants';
import { generateTransaction } from '@/store/transactions/generators';
import { addTransaction } from '@/store/transactions/slice';
import { generateRecurringTransactionEvent } from './generators';
import {
  addRecurringTransactionEvent,
  removeRecurringTransactionEvent,
} from './slice';

export const realizeRecurringTransaction =
  (recurringTransaction, occurrenceDate) => (dispatch) => {
    const newTransaction = generateTransaction({
      accountId: recurringTransaction.accountId,
      date: occurrenceDate,
      amount: recurringTransaction.amount,
      description: recurringTransaction.description,
      categoryId: recurringTransaction.categoryId,
      transactionState: TransactionStateEnum.SCHEDULED,
    });

    if (!newTransaction) {
      console.error('Failed to create transaction for recurring occurrence');
      return null;
    }

    const event = generateRecurringTransactionEvent({
      recurringTransactionId: recurringTransaction.id,
      expectedDate: occurrenceDate,
      eventState: 'MODIFIED',
      transactionId: newTransaction.id,
    });

    if (!event) {
      console.error('Failed to create recurring transaction event');
      return null;
    }

    dispatch(addTransaction(newTransaction));
    dispatch(addRecurringTransactionEvent(event));

    return newTransaction;
  };

export const removeRecurringTransactionEventById =
  (eventId) => async (dispatch, getState) => {
    const state = getState();
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      const { userId } = getCurrentUserForMiddleware();
      try {
        await deleteEncryptedRecord('recurringTransactionEvents', eventId, userId);
      } catch (error) {
        console.error('Failed to delete encrypted recurring event:', error);
        throw error;
      }
    }

    dispatch(removeRecurringTransactionEvent(eventId));
  };
