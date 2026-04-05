import { deleteEncryptedRecord } from '@/crypto/database';
import { selectors as transactionSelectors } from '@/store/transactions';
import { updateTransaction as updateTransactionNormalized } from '@/store/transactions/slice';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import {
  getLinkedTransactionId,
  validateTransactionLinkCandidate,
} from '@/utils/linking';
import { generateTransactionLink } from './generators';
import {
  addTransactionLink,
  removeTransactionLink,
  updateTransactionLink,
} from './slice';
import {
  selectActiveTransactionLinks,
  selectTransactionLinkByTransactionId,
} from './selectors';

const applyAbsoluteAmountWithExistingSign = (currentAmount, absoluteAmount) => {
  const normalizedAbsoluteAmount = Math.abs(absoluteAmount || 0);
  const sign = Math.sign(currentAmount) || 1;
  return normalizedAbsoluteAmount * sign;
};

export const createTransactionLinkRecord =
  (linkData) => (dispatch) => {
    const transactionLink = generateTransactionLink(linkData);
    if (!transactionLink) {
      console.error('Failed to create transaction link');
      return null;
    }

    dispatch(addTransactionLink(transactionLink));
    return transactionLink;
  };

export const replaceTransactionLinkRecord =
  (link) => (dispatch) => {
    dispatch(updateTransactionLink(link));
  };

export const removeTransactionLinkById =
  (transactionLinkId) => async (dispatch, getState) => {
    const state = getState();
    const isEncrypted = state.encryption?.status === 'encrypted';

    if (isEncrypted) {
      try {
        await deleteEncryptedRecord('transactionLinks', transactionLinkId);
      } catch (error) {
        console.error('Failed to delete encrypted transaction link:', error);
        throw error;
      }
    }

    dispatch(removeTransactionLink(transactionLinkId));
  };

export const unlinkTransactionByTransactionId =
  (transactionId) => async (dispatch, getState) => {
    const state = getState();
    const transactionLink = selectTransactionLinkByTransactionId(transactionId)(
      state,
    );

    if (!transactionLink) return null;

    await dispatch(removeTransactionLinkById(transactionLink.id));
    return transactionLink;
  };

export const saveTransactionLinkPair =
  ({ sourceTransactionId, destinationTransactionId }) =>
  async (dispatch, getState) => {
    const state = getState();
    const sourceTransaction =
      transactionSelectors.selectTransactionById(sourceTransactionId)(state);
    const destinationTransaction =
      transactionSelectors.selectTransactionById(destinationTransactionId)(
        state,
      );
    const activeLinks = selectActiveTransactionLinks(state);
    const sourceExistingLink = selectTransactionLinkByTransactionId(
      sourceTransactionId,
    )(state);
    const sourceHasSplits =
      transactionSplitSelectors.selectSplitsByTransactionId(sourceTransactionId)(
        state,
      ).length > 0;
    const destinationHasSplits =
      transactionSplitSelectors.selectSplitsByTransactionId(
        destinationTransactionId,
      )(state).length > 0;

    const filteredLinks = activeLinks.filter(
      (link) => link.id !== sourceExistingLink?.id,
    );
    const validation = validateTransactionLinkCandidate({
      sourceTransaction,
      destinationTransaction,
      transactionLinks: filteredLinks,
      sourceHasSplits,
      destinationHasSplits,
    });

    if (!validation.valid) {
      return {
        valid: false,
        reason: validation.reason,
      };
    }

    if (
      sourceExistingLink &&
      getLinkedTransactionId(sourceExistingLink, sourceTransactionId) ===
        destinationTransactionId
    ) {
      return {
        valid: true,
        reason: null,
        link: sourceExistingLink,
      };
    }

    if (sourceExistingLink) {
      await dispatch(removeTransactionLinkById(sourceExistingLink.id));
    }

    const transactionLink = dispatch(
      createTransactionLinkRecord({
        sourceTransactionId,
        destinationTransactionId,
      }),
    );

    return {
      valid: Boolean(transactionLink),
      reason: transactionLink ? null : 'Failed to create transaction link.',
      link: transactionLink,
    };
  };

export const reconcileAndSaveTransactionLinkPair =
  ({
    sourceTransactionId,
    destinationTransactionId,
    reconciledDate = null,
    reconciledAbsoluteAmount = null,
    reconciledDescription = null,
    reconciledTransactionState = null,
  }) =>
  async (dispatch, getState) => {
    const state = getState();
    const sourceTransaction =
      transactionSelectors.selectTransactionById(sourceTransactionId)(state);
    const destinationTransaction =
      transactionSelectors.selectTransactionById(destinationTransactionId)(
        state,
      );

    if (!sourceTransaction || !destinationTransaction) {
      return {
        valid: false,
        reason: 'Both transactions must exist before linking.',
      };
    }

    const nextSourceTransaction = { ...sourceTransaction };
    const nextDestinationTransaction = { ...destinationTransaction };

    if (reconciledDate) {
      nextSourceTransaction.date = reconciledDate;
      nextDestinationTransaction.date = reconciledDate;
    }

    if (typeof reconciledAbsoluteAmount === 'number') {
      nextSourceTransaction.amount = applyAbsoluteAmountWithExistingSign(
        sourceTransaction.amount,
        reconciledAbsoluteAmount,
      );
      nextDestinationTransaction.amount = applyAbsoluteAmountWithExistingSign(
        destinationTransaction.amount,
        reconciledAbsoluteAmount,
      );
    }

    if (typeof reconciledDescription === 'string') {
      const trimmedDescription = reconciledDescription.trim();
      nextSourceTransaction.description = trimmedDescription;
      nextDestinationTransaction.description = trimmedDescription;
    }

    if (reconciledTransactionState) {
      nextSourceTransaction.transactionState = reconciledTransactionState;
      nextDestinationTransaction.transactionState = reconciledTransactionState;
    }

    if (
      nextSourceTransaction.date !== sourceTransaction.date ||
      nextSourceTransaction.amount !== sourceTransaction.amount ||
      nextSourceTransaction.description !== sourceTransaction.description ||
      nextSourceTransaction.transactionState !== sourceTransaction.transactionState
    ) {
      dispatch(updateTransactionNormalized(nextSourceTransaction));
    }

    if (
      nextDestinationTransaction.date !== destinationTransaction.date ||
      nextDestinationTransaction.amount !== destinationTransaction.amount ||
      nextDestinationTransaction.description !==
        destinationTransaction.description ||
      nextDestinationTransaction.transactionState !==
        destinationTransaction.transactionState
    ) {
      dispatch(updateTransactionNormalized(nextDestinationTransaction));
    }

    return dispatch(
      saveTransactionLinkPair({
        sourceTransactionId,
        destinationTransactionId,
      }),
    );
  };
