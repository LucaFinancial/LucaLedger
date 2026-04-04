import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { centsToDollars, dollarsToCents } from '@/utils';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';

const validSplitAmountRegex = /^\d*(\.\d{0,2})?$/;
const EMPTY_SPLITS = [];
const selectNoSplits = () => EMPTY_SPLITS;

const formatAmountInput = (amountInCents) =>
  amountInCents === 0 ? '' : centsToDollars(amountInCents).toFixed(2);

const createAmountInputs = (nextSplits) =>
  nextSplits.reduce((inputs, split) => {
    inputs[split.id] = formatAmountInput(split.amount);
    return inputs;
  }, {});

const parseAmountInputToCents = (value) => {
  if (value === '' || value === '.') {
    return 0;
  }

  return dollarsToCents(parseFloat(value));
};

/**
 * Custom hook for managing split editor state
 */
export function useSplitEditor(open, transaction) {
  const [splits, setSplits] = useState([]);
  const [amountInputs, setAmountInputs] = useState({});
  const [errors, setErrors] = useState({});
  const transactionId = transaction?.id;
  const transactionCategoryId = transaction?.categoryId;
  const transactionAmount = transaction?.amount;
  const selectExistingSplits = useMemo(
    () =>
      transactionId
        ? transactionSplitSelectors.selectSplitsByTransactionId(transactionId)
        : selectNoSplits,
    [transactionId],
  );
  const existingSplits = useSelector(
    selectExistingSplits,
  );

  // Initialize splits from transaction when modal opens
  useEffect(() => {
    if (open && transactionId) {
      if (existingSplits.length > 0) {
        // Load existing splits
        const nextSplits = existingSplits.map((split) => ({ ...split }));
        setSplits(nextSplits);
        setAmountInputs(createAmountInputs(nextSplits));
      } else {
        // Start with one empty split
        const nextSplits = [
          {
            id: uuid(),
            categoryId: transactionCategoryId || '',
            amount: Math.abs(transactionAmount),
          },
        ];
        setSplits(nextSplits);
        setAmountInputs(createAmountInputs(nextSplits));
      }
      setErrors({});
    }
  }, [
    open,
    transactionId,
    transactionCategoryId,
    transactionAmount,
    existingSplits,
  ]);

  const handleAddSplit = () => {
    const newSplit = {
      id: uuid(),
      categoryId: '',
      amount: 0,
    };

    setSplits([...splits, newSplit]);
    setAmountInputs({
      ...amountInputs,
      [newSplit.id]: '',
    });
  };

  const handleRemoveSplit = (splitId) => {
    setSplits(splits.filter((split) => split.id !== splitId));
    setAmountInputs(
      Object.fromEntries(
        Object.entries(amountInputs).filter(([id]) => id !== splitId),
      ),
    );
  };

  const handleCategoryChange = (splitId, categoryId) => {
    setSplits(
      splits.map((split) =>
        split.id === splitId ? { ...split, categoryId } : split,
      ),
    );
    // Clear error for this split when category changes
    if (errors[splitId]) {
      setErrors({ ...errors, [splitId]: undefined });
    }
  };

  const handleAmountChange = (splitId, value) => {
    if (validSplitAmountRegex.test(value)) {
      const amountInCents = parseAmountInputToCents(value);

      setAmountInputs({
        ...amountInputs,
        [splitId]: value,
      });
      setSplits(
        splits.map((split) =>
          split.id === splitId ? { ...split, amount: amountInCents } : split,
        ),
      );
      // Clear error for this split when amount changes
      if (errors[splitId]) {
        setErrors({ ...errors, [splitId]: undefined });
      }
    }
  };

  const handleDistributeRemaining = (totalAmount) => {
    if (splits.length === 0) return;

    const currentTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    const remaining = totalAmount - currentTotal;

    if (remaining > 0) {
      // Find the last split with amount 0 or the last split overall
      const lastEmptyIndex = splits.reduce(
        (lastIdx, split, idx) => (split.amount === 0 ? idx : lastIdx),
        splits.length - 1,
      );

      setSplits(
        splits.map((split, idx) =>
          idx === lastEmptyIndex
            ? { ...split, amount: split.amount + remaining }
            : split,
        ),
      );
      setAmountInputs(
        createAmountInputs(
          splits.map((split, idx) =>
            idx === lastEmptyIndex
              ? { ...split, amount: split.amount + remaining }
              : split,
          ),
        ),
      );
    }
  };

  return {
    splits,
    amountInputs,
    errors,
    setErrors,
    handleAddSplit,
    handleRemoveSplit,
    handleCategoryChange,
    handleAmountChange,
    handleDistributeRemaining,
  };
}
