import { generateRecurringOccurrence } from './generators';
import { addRecurringOccurrence, removeRecurringOccurrence } from './slice';
import { generateTransaction } from '@/store/transactions/generators';
import { addTransaction } from '@/store/transactions/slice';
import { TransactionStateEnum } from '@/store/transactions/constants';

/**
 * Realizes a virtual recurring transaction into a real transaction
 * Creates a transaction with status Planned and records the occurrence
 * @param {Object} recurringTransaction - The recurring transaction rule
 * @param {string} occurrenceDate - The date of this occurrence (YYYY/MM/DD format)
 */
export const realizeRecurringTransaction =
  (recurringTransaction, occurrenceDate) => (dispatch) => {
    // Create the real transaction
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

    // Create the occurrence record
    const occurrence = generateRecurringOccurrence({
      recurringTransactionId: recurringTransaction.id,
      originalDate: occurrenceDate,
      realizedTransactionId: newTransaction.id,
    });

    if (!occurrence) {
      console.error('Failed to create occurrence record');
      return null;
    }

    // Dispatch both actions
    dispatch(addTransaction(newTransaction));
    dispatch(addRecurringOccurrence(occurrence));

    return newTransaction;
  };

/**
 * Removes an occurrence record (e.g., when the realized transaction is deleted)
 * @param {string} occurrenceId - The occurrence ID
 */
export const removeOccurrenceById =
  (occurrenceId) => async (dispatch, getState) => {
    const state = getState();

    // Handle encrypted data if enabled
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      const { deleteEncryptedRecord } = await import('@/crypto/database');
      try {
        await deleteEncryptedRecord('recurringOccurrences', occurrenceId);
      } catch (error) {
        console.error('Failed to delete encrypted occurrence:', error);
        throw error;
      }
    }

    dispatch(removeRecurringOccurrence(occurrenceId));
  };
