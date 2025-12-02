import { centsToDollars } from '@/utils';

/**
 * Validates transaction splits
 * @param {Array} splits - Array of split objects
 * @param {number} totalAmount - Total transaction amount in cents
 * @returns {Object} Object with isValid boolean and errors object
 */
export function validateSplits(splits, totalAmount) {
  const newErrors = {};
  let isValid = true;

  // Check that we have at least one split
  if (splits.length === 0) {
    isValid = false;
  }

  // Validate each split
  splits.forEach((split) => {
    if (!split.categoryId) {
      newErrors[split.id] = 'Category required';
      isValid = false;
    }
    if (split.amount <= 0) {
      newErrors[split.id] = 'Amount must be > 0';
      isValid = false;
    }
  });

  // Check that sum equals transaction amount
  const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

  if (splitsTotal !== totalAmount) {
    newErrors.sum = `Sum of splits ($${centsToDollars(splitsTotal).toFixed(
      2
    )}) must equal transaction amount ($${centsToDollars(totalAmount).toFixed(
      2
    )})`;
    isValid = false;
  }

  return { isValid, errors: newErrors };
}

/**
 * Calculates the remaining amount to be allocated
 * @param {number} totalAmount - Total transaction amount in cents
 * @param {Array} splits - Array of split objects
 * @returns {number} Remaining amount in cents
 */
export function calculateRemaining(totalAmount, splits) {
  const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);
  return totalAmount - splitsTotal;
}
