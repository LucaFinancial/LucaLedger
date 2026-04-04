import { useMemo, useCallback } from 'react';
import { utils as accountUtils } from '@/store/accounts';

export const calculateExpenseContribution = (amount, accountType) => {
  const numericAmount = Number(amount) || 0;

  // Credit cards are liability accounts, so their expense polarity is inverted.
  return accountUtils.isCreditCardAccountType(accountType)
    ? numericAmount
    : -numericAmount;
};

export const categorizeDashboardTransaction = ({
  tx,
  accountType,
  isIncome,
  isTransfer,
}) => {
  if (isTransfer) {
    return { income: 0, expense: 0, creditCardExpense: 0 };
  }

  if (isIncome) {
    return {
      income: Math.abs(Number(tx.amount) || 0),
      expense: 0,
      creditCardExpense: 0,
    };
  }

  const expense = calculateExpenseContribution(tx.amount, accountType);

  return {
    income: 0,
    expense,
    creditCardExpense: accountUtils.isCreditCardAccountType(accountType)
      ? expense
      : 0,
  };
};

/**
 * Custom hook to handle category filtering logic for income and transfers
 * @param {Array} categories - Array of all categories
 * @returns {Object} Category IDs and helper functions
 */
export function useCategoryFilters(categories) {
  // Find the Income and Transfers parent category IDs
  const incomeCategoryId = useMemo(() => {
    const incomeCategory = categories.find(
      (cat) => cat.slug === 'income' && !cat.parentId,
    );
    return incomeCategory?.id;
  }, [categories]);

  const transfersCategoryId = useMemo(() => {
    const transfersCategory = categories.find(
      (cat) => cat.slug === 'transfers' && !cat.parentId,
    );
    return transfersCategory?.id;
  }, [categories]);

  // Get all income category IDs (parent + children)
  const incomeCategoryIds = useMemo(() => {
    if (!incomeCategoryId) return [];
    const subcategories = categories.filter(
      (cat) => cat.parentId === incomeCategoryId,
    );
    return [incomeCategoryId, ...subcategories.map((cat) => cat.id)];
  }, [categories, incomeCategoryId]);

  // Get all transfer category IDs (parent + children)
  const transferCategoryIds = useMemo(() => {
    if (!transfersCategoryId) return [];
    const subcategories = categories.filter(
      (cat) => cat.parentId === transfersCategoryId,
    );
    return [transfersCategoryId, ...subcategories.map((cat) => cat.id)];
  }, [categories, transfersCategoryId]);

  // Helper function to determine if a transaction is income
  const isIncomeTransaction = useCallback(
    (tx) => {
      if (!tx.categoryId) return false;
      return incomeCategoryIds.includes(tx.categoryId);
    },
    [incomeCategoryIds],
  );

  // Helper function to determine if a transaction is a transfer
  const isTransferTransaction = useCallback(
    (tx) => {
      if (!tx.categoryId) return false;
      return transferCategoryIds.includes(tx.categoryId);
    },
    [transferCategoryIds],
  );

  // Helper function to get the display color for a transaction
  const getTransactionColor = useCallback(
    (tx) => {
      if (isIncomeTransaction(tx)) return 'success.main';
      return 'error.main'; // Expense
    },
    [isIncomeTransaction],
  );

  // Helper function to categorize transaction as income or expense amount
  // Expense polarity depends on account type so reimbursements reduce expenses.
  const categorizeTransaction = useCallback(
    (tx, accountType) =>
      categorizeDashboardTransaction({
        tx,
        accountType,
        isIncome: isIncomeTransaction(tx),
        isTransfer: isTransferTransaction(tx),
      }),
    [isIncomeTransaction, isTransferTransaction],
  );

  return {
    incomeCategoryId,
    transfersCategoryId,
    incomeCategoryIds,
    transferCategoryIds,
    isIncomeTransaction,
    isTransferTransaction,
    getTransactionColor,
    categorizeTransaction,
  };
}
