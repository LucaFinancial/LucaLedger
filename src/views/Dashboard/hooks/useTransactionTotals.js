import { useMemo } from 'react';
import { parseISO, getDate, getDaysInMonth } from 'date-fns';
import { constants as transactionConstants } from '@/store/transactions';

export const sumTransactionTotals = (transactions, categorizeTransaction) => {
  let income = 0;
  let expenses = 0;
  let creditCardExpenses = 0;

  transactions.forEach((tx) => {
    const {
      income: txIncome,
      expense: txExpense,
      creditCardExpense = 0,
    } = categorizeTransaction(tx);
    income += txIncome;
    expenses += txExpense;
    creditCardExpenses += creditCardExpense;
  });

  const balance = income - expenses;

  return {
    income,
    expenses,
    creditCardExpenses,
    balance,
    netFlow: balance,
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
  const totalCreditCardExpenses = projectedMonthTotals.creditCardExpenses;
  const totalBalance = projectedMonthTotals.balance;

  const daysInMonth = getDaysInMonth(dateRanges.currentMonthEnd);
  const currentDay = getDate(dateRanges.today);
  const daysRemaining = daysInMonth - currentDay;
  const monthProgress = (currentDay / daysInMonth) * 100;

  return {
    totalIncome,
    totalExpenses,
    totalCreditCardExpenses,
    totalBalance,
    projectedIncome: totalIncome,
    projectedExpenses: totalExpenses,
    projectedCreditCardExpenses: totalCreditCardExpenses,
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
}) {
  // Calculate current month totals (completed only)
  const currentMonthTotals = useMemo(() => {
    return sumTransactionTotals(currentMonthTransactions, (tx) =>
      categorizeTransaction(tx, accountMap[tx.accountId]?.type),
    );
  }, [currentMonthTransactions, categorizeTransaction, accountMap]);

  // Calculate total projected month totals (all statuses)
  const projectedMonthTotals = useMemo(() => {
    return sumTransactionTotals(allMonthTransactions, (tx) =>
      categorizeTransaction(tx, accountMap[tx.accountId]?.type),
    );
  }, [allMonthTransactions, categorizeTransaction, accountMap]);

  // Calculate future totals (for next 30 days section)
  const futureTotals = useMemo(() => {
    let scheduledTotal = 0;

    futureTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } = categorizeTransaction(
        tx,
        accountMap[tx.accountId]?.type,
      );
      const netFlow = txIncome - txExpense;

      if (
        tx.transactionState ===
        transactionConstants.TransactionStateEnum.SCHEDULED
      ) {
        scheduledTotal += netFlow;
      }
    });

    return { scheduled: scheduledTotal, planned: 0 };
  }, [futureTransactions, categorizeTransaction, accountMap]);

  // Calculate recent totals (for last 14 days section)
  const recentTotals = useMemo(() => {
    let completedTotal = 0;
    let pendingTotal = 0;

    recentTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } = categorizeTransaction(
        tx,
        accountMap[tx.accountId]?.type,
      );
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
  }, [recentTransactions, categorizeTransaction, accountMap]);

  // Calculate remaining current month pending/scheduled/planned transactions
  const remainingMonthTotals = useMemo(() => {
    const remainingMonthTransactions = allTransactions.filter((tx) =>
      isRemainingMonthTransaction(tx, dateRanges, isTransferTransaction),
    );

    return sumTransactionTotals(remainingMonthTransactions, (tx) =>
      categorizeTransaction(tx, accountMap[tx.accountId]?.type),
    );
  }, [
    allTransactions,
    accountMap,
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
