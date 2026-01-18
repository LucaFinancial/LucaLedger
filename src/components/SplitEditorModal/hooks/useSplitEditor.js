import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { dollarsToCents } from '@/utils';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';

/**
 * Custom hook for managing split editor state
 */
export function useSplitEditor(open, transaction) {
  const [splits, setSplits] = useState([]);
  const [errors, setErrors] = useState({});
  const existingSplits = useSelector(
    transaction?.id
      ? transactionSplitSelectors.selectSplitsByTransactionId(transaction.id)
      : () => []
  );

  // Initialize splits from transaction when modal opens
  useEffect(() => {
    if (open && transaction) {
      if (existingSplits.length > 0) {
        // Load existing splits
        setSplits(existingSplits.map((split) => ({ ...split })));
      } else {
        // Start with one empty split
        setSplits([
          {
            id: uuid(),
            categoryId: transaction.categoryId || '',
            amount: Math.abs(transaction.amount),
          },
        ]);
      }
      setErrors({});
    }
  }, [open, transaction, existingSplits]);

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      {
        id: uuid(),
        categoryId: '',
        amount: 0,
      },
    ]);
  };

  const handleRemoveSplit = (splitId) => {
    setSplits(splits.filter((split) => split.id !== splitId));
  };

  const handleCategoryChange = (splitId, categoryId) => {
    setSplits(
      splits.map((split) =>
        split.id === splitId ? { ...split, categoryId } : split
      )
    );
    // Clear error for this split when category changes
    if (errors[splitId]) {
      setErrors({ ...errors, [splitId]: undefined });
    }
  };

  const handleAmountChange = (splitId, value) => {
    // Allow empty, numbers with up to 2 decimals, and negative sign
    const validNumberRegex = /^\d*\.?\d{0,2}$/;

    if (value === '' || validNumberRegex.test(value)) {
      const amountInCents =
        value === '' ? 0 : dollarsToCents(parseFloat(value));
      setSplits(
        splits.map((split) =>
          split.id === splitId ? { ...split, amount: amountInCents } : split
        )
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
        splits.length - 1
      );

      setSplits(
        splits.map((split, idx) =>
          idx === lastEmptyIndex
            ? { ...split, amount: split.amount + remaining }
            : split
        )
      );
    }
  };

  return {
    splits,
    errors,
    setErrors,
    handleAddSplit,
    handleRemoveSplit,
    handleCategoryChange,
    handleAmountChange,
    handleDistributeRemaining,
  };
}
