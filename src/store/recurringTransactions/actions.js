import { deleteEncryptedRecord } from '@/crypto/database';
import {
  actions as recurringTransactionLinkActions,
  selectors as recurringTransactionLinkSelectors,
} from '@/store/recurringTransactionLinks';
import {
  getCounterpartAmountForLinkedPair,
  getLinkedRecurringTransactionId,
  getSignOrientation,
} from '@/utils/linking';
import { generateRecurringTransaction } from './generators';
import {
  addRecurringTransaction,
  removeRecurringTransaction,
  updateRecurringTransaction as updateRecurringTransactionNormalized,
} from './slice';

const LINKED_RECURRING_SYNC_FIELDS = new Set([
  'amount',
  'startOn',
  'frequency',
  'interval',
  'endOn',
  'recurringTransactionState',
]);

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
  (recurringTransactionId, updates) => async (dispatch, getState) => {
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

    const recurringTransactionLink =
      recurringTransactionLinkSelectors.selectRecurringTransactionLinkByRecurringTransactionId(
        recurringTransactionId,
      )(state);
    if (!recurringTransactionLink) return;

    const linkedRecurringTransactionId = getLinkedRecurringTransactionId(
      recurringTransactionLink,
      recurringTransactionId,
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
      return;
    }

    const linkedUpdates = {};

    Object.entries(updates).forEach(([field, value]) => {
      if (!LINKED_RECURRING_SYNC_FIELDS.has(field)) return;

      linkedUpdates[field] =
        field === 'amount'
          ? getCounterpartAmountForLinkedPair({
              sourceAmount: value,
              counterpartAmount: linkedRecurringTransaction.amount,
              orientation: getSignOrientation(
                recurringTransaction.amount,
                linkedRecurringTransaction.amount,
              ),
            })
          : value;
    });

    if (Object.keys(linkedUpdates).length === 0) return;

    dispatch(
      updateRecurringTransactionNormalized({
        ...linkedRecurringTransaction,
        ...linkedUpdates,
      }),
    );
  };

/**
 * Removes a recurring transaction by ID
 * @param {string} recurringTransactionId - Recurring transaction ID
 */
export const removeRecurringTransactionById =
  (recurringTransactionId) => async (dispatch, getState) => {
    const state = getState();
    const recurringTransactionLink =
      recurringTransactionLinkSelectors.selectRecurringTransactionLinkByRecurringTransactionId(
        recurringTransactionId,
      )(state);

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

    if (recurringTransactionLink) {
      await dispatch(
        recurringTransactionLinkActions.removeRecurringTransactionLinkById(
          recurringTransactionLink.id,
        ),
      );
    }

    dispatch(removeRecurringTransaction(recurringTransactionId));
  };
