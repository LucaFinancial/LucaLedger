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

export const combineOverviewTotals = (...overviewTotals) => {
  const combinedTotals = overviewTotals.reduce(
    (totals, currentTotals) => ({
      income: totals.income + (currentTotals?.income || 0),
      credits: totals.credits + (currentTotals?.credits || 0),
      expenses: totals.expenses + (currentTotals?.expenses || 0),
      balance: totals.balance + (currentTotals?.balance || 0),
      creditCardPayments:
        totals.creditCardPayments + (currentTotals?.creditCardPayments || 0),
      creditCardExpenses:
        totals.creditCardExpenses + (currentTotals?.creditCardExpenses || 0),
      creditCardCredits:
        totals.creditCardCredits + (currentTotals?.creditCardCredits || 0),
      creditCardBalanceChange:
        totals.creditCardBalanceChange +
        (currentTotals?.creditCardBalanceChange || 0),
    }),
    {
      income: 0,
      credits: 0,
      expenses: 0,
      balance: 0,
      creditCardPayments: 0,
      creditCardExpenses: 0,
      creditCardCredits: 0,
      creditCardBalanceChange: 0,
    },
  );

  const incomeAndCredits = combinedTotals.income + combinedTotals.credits;
  const netFlow = incomeAndCredits - combinedTotals.expenses;

  return {
    ...combinedTotals,
    incomeAndCredits,
    netFlow,
  };
};

export const buildCurrentMonthOverviewTotals = (
  transactions,
  accountMap,
  isTransferTransaction,
  isCreditCardPaymentTransaction,
  isIncomeTransaction,
) => {
  let income = 0;
  let credits = 0;
  let cashCredits = 0;
  let expenses = 0;
  let creditCardPayments = 0;
  let creditCardExpenses = 0;
  let creditCardCredits = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const accountType = accountMap[tx.accountId]?.type;
    const isTransfer = isTransferTransaction(tx);
    const isCreditCardPayment = isCreditCardPaymentTransaction(tx);
    const isCreditCardAccount = accountUtils.isCreditCardAccountType(
      accountType,
    );

    if (!isCreditCardAccount) {
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
        if (isIncomeTransaction?.(tx)) {
          income += amount;
        } else {
          credits += amount;
          cashCredits += amount;
        }
      } else if (amount < 0) {
        expenses += Math.abs(amount);
      }

      return;
    }

    if (!isTransfer) {
      if (amount > 0) {
        creditCardExpenses += amount;
      } else if (amount < 0) {
        const creditAmount = Math.abs(amount);
        creditCardCredits += creditAmount;
        credits += creditAmount;
      }
    }
  });

  const incomeAndCredits = income + credits;
  const balance = income + cashCredits - expenses;
  const creditCardBalanceChange =
    creditCardExpenses - creditCardPayments - creditCardCredits;
  const netFlow = incomeAndCredits - expenses;

  return {
    income,
    credits,
    incomeAndCredits,
    cashCredits,
    expenses,
    balance,
    creditCardPayments,
    creditCardExpenses,
    creditCardCredits,
    creditCardBalanceChange,
    netFlow,
  };
};

export const isRemainingMonthTransaction = (
  tx,
  dateRanges,
) => {
  const txDate = parseISO(tx.date.replace(/\//g, '-'));

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
  const totalIncome = projectedMonthTotals.income || 0;
  const totalCredits = projectedMonthTotals.credits || 0;
  const totalIncomeAndCredits =
    projectedMonthTotals.incomeAndCredits ?? totalIncome + totalCredits;
  const totalExpenses = projectedMonthTotals.expenses || 0;
  const totalBalance = projectedMonthTotals.balance || 0;
  const totalCreditCardPayments = projectedMonthTotals.creditCardPayments || 0;
  const totalCreditCardExpenses = projectedMonthTotals.creditCardExpenses || 0;
  const totalCreditCardCredits = projectedMonthTotals.creditCardCredits || 0;
  const totalCreditCardBalanceChange =
    projectedMonthTotals.creditCardBalanceChange ||
    totalCreditCardExpenses -
      totalCreditCardPayments -
      totalCreditCardCredits;
  const totalNetFlow = totalIncomeAndCredits - totalExpenses;

  const daysInMonth = getDaysInMonth(dateRanges.currentMonthEnd);
  const currentDay = getDate(dateRanges.today);
  const daysRemaining = daysInMonth - currentDay;
  const monthProgress = (currentDay / daysInMonth) * 100;

  return {
    totalIncome,
    totalCredits,
    totalIncomeAndCredits,
    totalExpenses,
    totalBalance,
    totalCreditCardPayments,
    totalCreditCardExpenses,
    totalCreditCardCredits,
    totalCreditCardBalanceChange,
    totalNetFlow,
    projectedIncome: totalIncome,
    projectedCredits: totalCredits,
    projectedIncomeAndCredits: totalIncomeAndCredits,
    projectedExpenses: totalExpenses,
    projectedBalance: totalBalance,
    projectedCreditCardPayments: totalCreditCardPayments,
    projectedCreditCardExpenses: totalCreditCardExpenses,
    projectedCreditCardCredits: totalCreditCardCredits,
    projectedCreditCardBalanceChange: totalCreditCardBalanceChange,
    projectedNetFlow: totalNetFlow,
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
 * @param {Array} params.allTransactions - All transactions
 * @param {Object} params.accountMap - Account lookup keyed by account ID
 * @param {Object} params.dateRanges - Date ranges for filtering
 * @param {Function} params.categorizeTransaction - Function to categorize transaction
 * @param {Function} params.isIncomeTransaction - Function to check if income
 * @param {Function} params.isTransferTransaction - Function to check if transfer
 * @param {Function} params.isCreditCardPaymentTransaction - Function to check if credit card payment
 * @returns {Object} Various calculated totals and projections
 */
export function useTransactionTotals({
  recentTransactions,
  futureTransactions,
  currentMonthTransactions,
  allTransactions,
  accountMap,
  dateRanges,
  categorizeTransaction,
  isIncomeTransaction,
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
      isIncomeTransaction,
    );
  }, [
    currentMonthTransactions,
    accountMap,
    isIncomeTransaction,
    isTransferTransaction,
    isCreditCardPaymentTransaction,
  ]);

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
      isRemainingMonthTransaction(tx, dateRanges),
    );

    return buildCurrentMonthOverviewTotals(
      remainingMonthTransactions,
      accountMap,
      isTransferTransaction,
      isCreditCardPaymentTransaction,
      isIncomeTransaction,
    );
  }, [
    allTransactions,
    accountMap,
    dateRanges,
    isIncomeTransaction,
    isTransferTransaction,
    isCreditCardPaymentTransaction,
  ]);

  // Calculate total projected month totals (all statuses)
  const projectedMonthTotals = useMemo(() => {
    return combineOverviewTotals(currentMonthTotals, remainingMonthTotals);
  }, [currentMonthTotals, remainingMonthTotals]);

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
