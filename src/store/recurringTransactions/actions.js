import { deleteEncryptedRecord } from '@/crypto/database';
import { generateRecurringTransaction } from './generators';
import {
  addRecurringTransaction,
  updateRecurringTransaction as updateRecurringTransactionNormalized,
  removeRecurringTransaction,
} from './slice';
import { deleteEncryptedRecord } from '@/crypto/database';

/**
 * Creates a new recurring transaction for an account
 * @param {Object} recurringTransactionData - Recurring transaction data
 */
export const createNewRecurringTransaction =
  (recurringTransactionData) => (dispatch) => {
    const newRecurringTransaction = generateRecurringTransaction(
      recurringTransactionData,
    );
    if (newRecurringTransaction) {
      dispatch(addRecurringTransaction(newRecurringTransaction));
    }
    return newRecurringTransaction;
  };

/**
 * Updates a recurring transaction property
 * @param {string} recurringTransactionId - Recurring transaction ID
 * @param {Object} updates - Object with properties to update
 */
export const updateRecurringTransactionProperty =
  (recurringTransactionId, updates) => (dispatch, getState) => {
    const state = getState();
    const recurringTransaction = state.recurringTransactions.find(
      (rt) => rt.id === recurringTransactionId,
    );

    if (!recurringTransaction) {
      console.error('Recurring transaction not found:', recurringTransactionId);
      return;
    }

    const updatedRecurringTransaction = {
      ...recurringTransaction,
      ...updates,
    };

    dispatch(updateRecurringTransactionNormalized(updatedRecurringTransaction));
  };

/**
 * Removes a recurring transaction by ID
 * @param {string} recurringTransactionId - Recurring transaction ID
 */
export const removeRecurringTransactionById =
  (recurringTransactionId) => async (dispatch, getState) => {
    const state = getState();

    // Handle encrypted data if enabled
    const isEncrypted = state.encryption?.status === 'encrypted';
    if (isEncrypted) {
      try {
        await deleteEncryptedRecord(
          'recurringTransactions',
          recurringTransactionId,
        );
      } catch (error) {
        console.error(
          'Failed to delete encrypted recurring transaction:',
          error,
        );
        throw error;
      }
    }

    dispatch(removeRecurringTransaction(recurringTransactionId));
  };
