import { useMemo } from 'react';
import { parseISO, getDate, getDaysInMonth } from 'date-fns';
import { utils as accountUtils } from '@/store/accounts';
import { constants as transactionConstants } from '@/store/transactions';

export const sumTransactionTotals = (transactions, categorizeTransaction) => {
  let income = 0;
  let expenses = 0;

  transactions.forEach((tx) => {
    const { income: txIncome, expense: txExpense } = categorizeTransaction(tx);
    income += txIncome;
    expenses += txExpense;
  });

  const balance = income - expenses;

  return {
    income,
    expenses,
    balance,
    netFlow: balance,
  };
};

export const buildCurrentMonthOverviewTotals = (
  transactions,
  accountMap,
  isTransferTransaction,
  isCreditCardPaymentTransaction,
) => {
  let income = 0;
  let expenses = 0;
  let creditCardPayments = 0;
  let creditCardExpenses = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const accountType = accountMap[tx.accountId]?.type;
    const isTransfer = isTransferTransaction(tx);
    const isCreditCardPayment = isCreditCardPaymentTransaction(tx);

    if (accountUtils.isIncludedInBalanceTotals(accountType)) {
      if (isCreditCardPayment) {
        const paymentAmount = -amount;
        expenses += paymentAmount;
        creditCardPayments += paymentAmount;
        return;
      }

      if (isTransfer) {
        return;
      }

      if (amount > 0) {
        income += amount;
      } else if (amount < 0) {
        expenses += Math.abs(amount);
      }

      return;
    }

    if (accountUtils.isCreditCardAccountType(accountType) && !isTransfer) {
      creditCardExpenses += amount;
    }
  });

  const netFlow = income - expenses;

  return {
    income,
    expenses,
    creditCardPayments,
    creditCardExpenses,
    balance: netFlow,
    netFlow,
  };
};

export const isRemainingMonthTransaction = (
  tx,
  dateRanges,
  isTransferTransaction,
) => {
  const txDate = parseISO(tx.date.replace(/\//g, '-'));

  if (isTransferTransaction(tx)) {
    return false;
  }

  return (
    txDate >= dateRanges.currentMonthStart &&
    txDate <= dateRanges.currentMonthEnd &&
    (tx.transactionState ===
      transactionConstants.TransactionStateEnum.PENDING ||
      tx.transactionState ===
        transactionConstants.TransactionStateEnum.SCHEDULED ||
      tx.transactionState === transactionConstants.TransactionStateEnum.PLANNED)
  );
};

export const buildMonthEndProjections = (projectedMonthTotals, dateRanges) => {
  const totalIncome = projectedMonthTotals.income;
  const totalExpenses = projectedMonthTotals.expenses;
  const totalBalance = projectedMonthTotals.balance;

  const daysInMonth = getDaysInMonth(dateRanges.currentMonthEnd);
  const currentDay = getDate(dateRanges.today);
  const daysRemaining = daysInMonth - currentDay;
  const monthProgress = (currentDay / daysInMonth) * 100;

  return {
    totalIncome,
    totalExpenses,
    totalBalance,
    projectedIncome: totalIncome,
    projectedExpenses: totalExpenses,
    projectedBalance: totalBalance,
    projectedNetFlow: totalBalance,
    daysInMonth,
    currentDay,
    daysRemaining,
    monthProgress,
  };
};

/**
 * Custom hook to calculate various transaction totals and projections
 * @param {Object} params - Parameters object
 * @param {Array} params.recentTransactions - Recent transactions
 * @param {Array} params.futureTransactions - Future transactions
 * @param {Array} params.currentMonthTransactions - Current month completed transactions
 * @param {Array} params.allMonthTransactions - All current month transactions
 * @param {Array} params.allTransactions - All transactions
 * @param {Object} params.accountMap - Account lookup keyed by account ID
 * @param {Object} params.dateRanges - Date ranges for filtering
 * @param {Function} params.categorizeTransaction - Function to categorize transaction
 * @param {Function} params.isTransferTransaction - Function to check if transfer
 * @param {Function} params.isCreditCardPaymentTransaction - Function to check if credit card payment
 * @returns {Object} Various calculated totals and projections
 */
export function useTransactionTotals({
  recentTransactions,
  futureTransactions,
  currentMonthTransactions,
  allMonthTransactions,
  allTransactions,
  accountMap,
  dateRanges,
  categorizeTransaction,
  isTransferTransaction,
  isCreditCardPaymentTransaction,
}) {
  // Calculate current month totals (completed only)
  const currentMonthTotals = useMemo(() => {
    return buildCurrentMonthOverviewTotals(
      currentMonthTransactions,
      accountMap,
      isTransferTransaction,
      isCreditCardPaymentTransaction,
    );
  }, [
    currentMonthTransactions,
    accountMap,
    isTransferTransaction,
    isCreditCardPaymentTransaction,
  ]);

  // Calculate total projected month totals (all statuses)
  const projectedMonthTotals = useMemo(() => {
    return sumTransactionTotals(allMonthTransactions, categorizeTransaction);
  }, [allMonthTransactions, categorizeTransaction]);

  // Calculate future totals (for next 30 days section)
  const futureTotals = useMemo(() => {
    let scheduledTotal = 0;

    futureTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      const netFlow = txIncome - txExpense;

      if (
        tx.transactionState ===
        transactionConstants.TransactionStateEnum.SCHEDULED
      ) {
        scheduledTotal += netFlow;
      }
    });

    return { scheduled: scheduledTotal, planned: 0 };
  }, [futureTransactions, categorizeTransaction]);

  // Calculate recent totals (for last 14 days section)
  const recentTotals = useMemo(() => {
    let completedTotal = 0;
    let pendingTotal = 0;

    recentTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      const netFlow = txIncome - txExpense;

      if (
        tx.transactionState ===
        transactionConstants.TransactionStateEnum.COMPLETED
      ) {
        completedTotal += netFlow;
      } else if (
        tx.transactionState ===
        transactionConstants.TransactionStateEnum.PENDING
      ) {
        pendingTotal += netFlow;
      }
    });

    return { completed: completedTotal, pending: pendingTotal };
  }, [recentTransactions, categorizeTransaction]);

  // Calculate remaining current month pending/scheduled/planned transactions
  const remainingMonthTotals = useMemo(() => {
    const remainingMonthTransactions = allTransactions.filter((tx) =>
      isRemainingMonthTransaction(tx, dateRanges, isTransferTransaction),
    );

    return sumTransactionTotals(
      remainingMonthTransactions,
      categorizeTransaction,
    );
  }, [
    allTransactions,
    dateRanges,
    categorizeTransaction,
    isTransferTransaction,
  ]);

  // Calculate month-end projections
  const monthEndProjections = useMemo(() => {
    return buildMonthEndProjections(projectedMonthTotals, dateRanges);
  }, [projectedMonthTotals, dateRanges]);

  return {
    currentMonthTotals,
    projectedMonthTotals,
    futureTotals,
    recentTotals,
    remainingMonthTotals,
    monthEndProjections,
  };
}
