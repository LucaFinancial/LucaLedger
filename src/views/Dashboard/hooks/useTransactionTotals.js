import { useMemo } from 'react';
import dayjs from 'dayjs';
import { constants as transactionConstants } from '@/store/transactions';

/**
 * Custom hook to calculate various transaction totals and projections
 * @param {Object} params - Parameters object
 * @param {Array} params.recentTransactions - Recent transactions
 * @param {Array} params.futureTransactions - Future transactions
 * @param {Array} params.currentMonthTransactions - Current month completed transactions
 * @param {Array} params.allMonthTransactions - All current month transactions
 * @param {Array} params.allTransactions - All transactions
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
  dateRanges,
  categorizeTransaction,
  isTransferTransaction,
}) {
  // Calculate current month totals (completed only)
  const currentMonthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    currentMonthTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      income += txIncome;
      expenses += txExpense;
    });

    const netFlow = income - expenses;
    return { income, expenses, netFlow };
  }, [currentMonthTransactions, categorizeTransaction]);

  // Calculate total projected month totals (all statuses)
  const projectedMonthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    allMonthTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      income += txIncome;
      expenses += txExpense;
    });

    const netFlow = income - expenses;
    return { income, expenses, netFlow };
  }, [allMonthTransactions, categorizeTransaction]);

  // Calculate future totals (for next 30 days section)
  const futureTotals = useMemo(() => {
    let scheduledTotal = 0;
    let plannedTotal = 0;

    futureTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      const netFlow = txIncome - txExpense;

      if (tx.status === transactionConstants.TransactionStatusEnum.SCHEDULED) {
        scheduledTotal += netFlow;
      } else if (
        tx.status === transactionConstants.TransactionStatusEnum.PLANNED
      ) {
        plannedTotal += netFlow;
      }
    });

    return { scheduled: scheduledTotal, planned: plannedTotal };
  }, [futureTransactions, categorizeTransaction]);

  // Calculate recent totals (for last 14 days section)
  const recentTotals = useMemo(() => {
    let completedTotal = 0;
    let pendingTotal = 0;

    recentTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      const netFlow = txIncome - txExpense;

      if (tx.status === transactionConstants.TransactionStatusEnum.COMPLETE) {
        completedTotal += netFlow;
      } else if (
        tx.status === transactionConstants.TransactionStatusEnum.PENDING
      ) {
        pendingTotal += netFlow;
      }
    });

    return { completed: completedTotal, pending: pendingTotal };
  }, [recentTransactions, categorizeTransaction]);

  // Calculate remaining current month pending/scheduled/planned transactions
  const remainingMonthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    const remainingMonthTransactions = allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD');

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day')) &&
        (tx.status === transactionConstants.TransactionStatusEnum.PENDING ||
          tx.status === transactionConstants.TransactionStatusEnum.SCHEDULED ||
          tx.status === transactionConstants.TransactionStatusEnum.PLANNED)
      );
    });

    remainingMonthTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      income += txIncome;
      expenses += txExpense;
    });

    return { income, expenses, netFlow: income - expenses };
  }, [
    allTransactions,
    dateRanges,
    categorizeTransaction,
    isTransferTransaction,
  ]);

  // Calculate month-end projections
  const monthEndProjections = useMemo(() => {
    const projectedIncome = projectedMonthTotals.income;
    const projectedExpenses = projectedMonthTotals.expenses;
    const projectedNetFlow = projectedMonthTotals.netFlow;

    const daysInMonth = dateRanges.currentMonthEnd.date();
    const currentDay = dateRanges.today.date();
    const daysRemaining = daysInMonth - currentDay;
    const monthProgress = (currentDay / daysInMonth) * 100;

    return {
      projectedIncome,
      projectedExpenses,
      projectedNetFlow,
      daysInMonth,
      currentDay,
      daysRemaining,
      monthProgress,
    };
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
