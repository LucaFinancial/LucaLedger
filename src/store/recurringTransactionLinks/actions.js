import { deleteEncryptedRecord } from '@/crypto/database';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { updateRecurringTransaction as updateRecurringTransactionNormalized } from '@/store/recurringTransactions/slice';
import {
  getLinkedRecurringTransactionId,
  validateRecurringLinkCandidate,
} from '@/utils/linking';
import { generateRecurringTransactionLink } from './generators';
import {
  addRecurringTransactionLink,
  removeRecurringTransactionLink,
  updateRecurringTransactionLink,
} from './slice';
import {
  selectActiveRecurringTransactionLinks,
  selectRecurringTransactionLinkByRecurringTransactionId,
} from './selectors';

const applyAbsoluteAmountWithExistingSign = (currentAmount, absoluteAmount) => {
  const normalizedAbsoluteAmount = Math.abs(absoluteAmount || 0);
  const sign = Math.sign(currentAmount) || 1;
  return normalizedAbsoluteAmount * sign;
};

export const createRecurringTransactionLinkRecord =
  (linkData) => (dispatch) => {
    const recurringTransactionLink = generateRecurringTransactionLink(linkData);
    if (!recurringTransactionLink) {
      console.error('Failed to create recurring transaction link');
      return null;
    }

    dispatch(addRecurringTransactionLink(recurringTransactionLink));
    return recurringTransactionLink;
  };

export const replaceRecurringTransactionLinkRecord =
  (link) => (dispatch) => {
    dispatch(updateRecurringTransactionLink(link));
  };

export const removeRecurringTransactionLinkById =
  (recurringTransactionLinkId) => async (dispatch, getState) => {
    const state = getState();
    const isEncrypted = state.encryption?.status === 'encrypted';

    if (isEncrypted) {
      try {
        await deleteEncryptedRecord(
          'recurringTransactionLinks',
          recurringTransactionLinkId,
        );
      } catch (error) {
        console.error(
          'Failed to delete encrypted recurring transaction link:',
          error,
        );
        throw error;
      }
    }

    dispatch(removeRecurringTransactionLink(recurringTransactionLinkId));
  };

export const unlinkRecurringTransactionByRecurringTransactionId =
  (recurringTransactionId) => async (dispatch, getState) => {
    const state = getState();
    const recurringTransactionLink =
      selectRecurringTransactionLinkByRecurringTransactionId(
        recurringTransactionId,
      )(state);

    if (!recurringTransactionLink) return null;

    await dispatch(removeRecurringTransactionLinkById(recurringTransactionLink.id));
    return recurringTransactionLink;
  };

export const saveRecurringTransactionLinkPair =
  ({ sourceRecurringTransactionId, destinationRecurringTransactionId }) =>
  async (dispatch, getState) => {
    const state = getState();
    const sourceRecurringTransaction =
      recurringTransactionSelectors.selectRecurringTransactionById(
        sourceRecurringTransactionId,
      )(state);
    const destinationRecurringTransaction =
      recurringTransactionSelectors.selectRecurringTransactionById(
        destinationRecurringTransactionId,
      )(state);
    const activeLinks = selectActiveRecurringTransactionLinks(state);
    const sourceExistingLink =
      selectRecurringTransactionLinkByRecurringTransactionId(
        sourceRecurringTransactionId,
      )(state);
    const filteredLinks = activeLinks.filter(
      (link) => link.id !== sourceExistingLink?.id,
    );
    const validation = validateRecurringLinkCandidate({
      sourceRecurringTransaction,
      destinationRecurringTransaction,
      recurringTransactionLinks: filteredLinks,
    });

    if (!validation.valid) {
      return {
        valid: false,
        reason: validation.reason,
      };
    }

    if (
      sourceExistingLink &&
      getLinkedRecurringTransactionId(
        sourceExistingLink,
        sourceRecurringTransactionId,
      ) === destinationRecurringTransactionId
    ) {
      return {
        valid: true,
        reason: null,
        link: sourceExistingLink,
      };
    }

    if (sourceExistingLink) {
      await dispatch(removeRecurringTransactionLinkById(sourceExistingLink.id));
    }

    const recurringTransactionLink = dispatch(
      createRecurringTransactionLinkRecord({
        sourceRecurringTransactionId,
        destinationRecurringTransactionId,
      }),
    );

    return {
      valid: Boolean(recurringTransactionLink),
      reason: recurringTransactionLink
        ? null
        : 'Failed to create recurring transaction link.',
      link: recurringTransactionLink,
    };
  };

export const reconcileAndSaveRecurringTransactionLinkPair =
  ({
    sourceRecurringTransactionId,
    destinationRecurringTransactionId,
    reconciledAbsoluteAmount = null,
    reconciledScheduleSource = null,
    reconciledDescription = null,
  }) =>
  async (dispatch, getState) => {
    const state = getState();
    const sourceRecurringTransaction =
      recurringTransactionSelectors.selectRecurringTransactionById(
        sourceRecurringTransactionId,
      )(state);
    const destinationRecurringTransaction =
      recurringTransactionSelectors.selectRecurringTransactionById(
        destinationRecurringTransactionId,
      )(state);

    if (!sourceRecurringTransaction || !destinationRecurringTransaction) {
      return {
        valid: false,
        reason: 'Both recurring transactions must exist before linking.',
      };
    }

    const nextSourceRecurringTransaction = { ...sourceRecurringTransaction };
    const nextDestinationRecurringTransaction = {
      ...destinationRecurringTransaction,
    };

    if (reconciledScheduleSource === 'source' || reconciledScheduleSource === 'destination') {
      const scheduleSource =
        reconciledScheduleSource === 'destination'
          ? destinationRecurringTransaction
          : sourceRecurringTransaction;

      [
        'startOn',
        'frequency',
        'interval',
        'endOn',
        'recurringTransactionState',
      ].forEach((field) => {
        nextSourceRecurringTransaction[field] = scheduleSource[field] ?? null;
        nextDestinationRecurringTransaction[field] =
          scheduleSource[field] ?? null;
      });
    }

    if (typeof reconciledAbsoluteAmount === 'number') {
      nextSourceRecurringTransaction.amount = applyAbsoluteAmountWithExistingSign(
        sourceRecurringTransaction.amount,
        reconciledAbsoluteAmount,
      );
      nextDestinationRecurringTransaction.amount =
        applyAbsoluteAmountWithExistingSign(
          destinationRecurringTransaction.amount,
          reconciledAbsoluteAmount,
        );
    }

    if (typeof reconciledDescription === 'string') {
      const trimmedDescription = reconciledDescription.trim();
      if (trimmedDescription !== '') {
        nextSourceRecurringTransaction.description = trimmedDescription;
        nextDestinationRecurringTransaction.description = trimmedDescription;
      }
    }

    if (
      JSON.stringify(nextSourceRecurringTransaction) !==
      JSON.stringify(sourceRecurringTransaction)
    ) {
      dispatch(updateRecurringTransactionNormalized(nextSourceRecurringTransaction));
    }

    if (
      JSON.stringify(nextDestinationRecurringTransaction) !==
      JSON.stringify(destinationRecurringTransaction)
    ) {
      dispatch(
        updateRecurringTransactionNormalized(nextDestinationRecurringTransaction),
      );
    }

    return dispatch(
      saveRecurringTransactionLinkPair({
        sourceRecurringTransactionId,
        destinationRecurringTransactionId,
      }),
    );
  };
