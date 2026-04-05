import { deleteEncryptedRecord } from '@/crypto/database';
import { selectors as transactionSelectors } from '@/store/transactions';
import { updateTransaction as updateTransactionNormalized } from '@/store/transactions/slice';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import {
  getCounterpartAmountForLinkedPair,
  getLinkedTransactionId,
  inferLinkIsSameSign,
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

const buildLinkedAmountPair = ({
  sourceCurrentAmount,
  destinationCurrentAmount,
  absoluteAmount,
  isSameSign,
}) => {
  const nextSourceAmount = applyAbsoluteAmountWithExistingSign(
    sourceCurrentAmount,
    absoluteAmount,
  );
  const nextDestinationAmount = getCounterpartAmountForLinkedPair({
    sourceAmount: nextSourceAmount,
    counterpartAmount: destinationCurrentAmount,
    isSameSign,
  });

  return {
    sourceAmount: nextSourceAmount,
    destinationAmount: nextDestinationAmount,
  };
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
  ({ sourceTransactionId, destinationTransactionId, isSameSign = null }) =>
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

    const resolvedIsSameSign =
      typeof isSameSign === 'boolean'
        ? isSameSign
        : inferLinkIsSameSign(
            sourceTransaction?.amount ?? 0,
            destinationTransaction?.amount ?? 0,
          );

    if (
      sourceExistingLink &&
      getLinkedTransactionId(sourceExistingLink, sourceTransactionId) ===
        destinationTransactionId
    ) {
      if (sourceExistingLink.isSameSign !== resolvedIsSameSign) {
        const updatedLink = {
          ...sourceExistingLink,
          isSameSign: resolvedIsSameSign,
        };
        dispatch(replaceTransactionLinkRecord(updatedLink));
        return {
          valid: true,
          reason: null,
          link: updatedLink,
        };
      }

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
        isSameSign: resolvedIsSameSign,
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
    reconciledIsSameSign = null,
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
    const resolvedIsSameSign =
      typeof reconciledIsSameSign === 'boolean'
        ? reconciledIsSameSign
        : inferLinkIsSameSign(
            sourceTransaction.amount,
            destinationTransaction.amount,
          );

    if (reconciledDate) {
      nextSourceTransaction.date = reconciledDate;
      nextDestinationTransaction.date = reconciledDate;
    }

    if (
      typeof reconciledAbsoluteAmount === 'number' ||
      typeof reconciledIsSameSign === 'boolean'
    ) {
      const absoluteAmount =
        typeof reconciledAbsoluteAmount === 'number'
          ? reconciledAbsoluteAmount
          : Math.abs(sourceTransaction.amount);
      const { sourceAmount, destinationAmount } = buildLinkedAmountPair({
        sourceCurrentAmount: sourceTransaction.amount,
        destinationCurrentAmount: destinationTransaction.amount,
        absoluteAmount,
        isSameSign: resolvedIsSameSign,
      });

      nextSourceTransaction.amount = sourceAmount;
      nextDestinationTransaction.amount = destinationAmount;
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
        isSameSign: resolvedIsSameSign,
      }),
    );
  };
