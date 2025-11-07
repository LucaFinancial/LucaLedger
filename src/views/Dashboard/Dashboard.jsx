import { useAccountBalances } from '@/hooks/useAccountBalances';
import {
  constants as accountConstants,
  selectors as accountSelectors,
} from '@/store/accounts';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import BetaBanner from '@/components/BetaBanner';
import { useMemo, useCallback } from 'react';
import RecentActivitySection from './RecentActivitySection';
import UpcomingActivitySection from './UpcomingActivitySection';
import CurrentMonthOverviewSection from './CurrentMonthOverviewSection';
import PlaceholderCard from './PlaceholderCard';

export default function Dashboard() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const { totals, creditCardTotals } = useAccountBalances(accounts);

  // Calculate date ranges (memoized to avoid recalculation)
  const dateRanges = useMemo(() => {
    const today = dayjs();
    return {
      today,
      todayEnd: today.endOf('day'),
      currentMonthStart: today.startOf('month'),
      currentMonthEnd: today.endOf('month'),
      recentStart: today.subtract(14, 'day'),
      futureEnd: today.add(30, 'day'),
    };
  }, []);

  // Create account lookup map for performance
  const accountMap = useMemo(() => {
    return accounts.reduce((map, account) => {
      map[account.id] = { name: account.name, type: account.type };
      return map;
    }, {});
  }, [accounts]);

  // Helper function to determine if a transaction represents an expense
  // For checking/savings: negative amount = expense
  // For credit cards: positive amount = expense (charge), negative = payment
  const isExpenseTransaction = useCallback(
    (tx) => {
      const account = accountMap[tx.accountId];
      if (!account) return tx.amount < 0;

      if (account.type === accountConstants.AccountType.CREDIT_CARD) {
        return tx.amount > 0; // Positive amounts on credit cards are charges (expenses)
      }
      return tx.amount < 0; // For checking/savings, negative is expense
    },
    [accountMap]
  );

  // Helper function to get the display color for a transaction
  const getTransactionColor = useCallback(
    (tx) => {
      return isExpenseTransaction(tx) ? 'error.main' : 'success.main';
    },
    [isExpenseTransaction]
  );

  // Helper function to categorize transaction as income or expense amount
  // Returns { income: number, expense: number } with absolute values
  const categorizeTransaction = useCallback(
    (tx) => {
      const absAmount = Math.abs(tx.amount);
      if (isExpenseTransaction(tx)) {
        return { income: 0, expense: absAmount };
      }
      return { income: absAmount, expense: 0 };
    },
    [isExpenseTransaction]
  );

  // Filter transactions by time period
  const recentTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
        const account = accountMap[tx.accountId];

        // Exclude credit card accounts
        if (account?.type === accountConstants.AccountType.CREDIT_CARD) {
          return false;
        }

        return (
          (txDate.isAfter(dateRanges.recentStart) ||
            txDate.isSame(dateRanges.recentStart, 'day')) &&
          (txDate.isBefore(dateRanges.todayEnd) ||
            txDate.isSame(dateRanges.todayEnd, 'day')) &&
          (tx.status === transactionConstants.TransactionStatusEnum.COMPLETE ||
            tx.status === transactionConstants.TransactionStatusEnum.PENDING)
        );
      })
      .sort((a, b) => {
        const dateA = dayjs(a.date, 'YYYY/MM/DD');
        const dateB = dayjs(b.date, 'YYYY/MM/DD');
        return dateB.diff(dateA);
      });
  }, [allTransactions, dateRanges, accountMap]);

  // Current month transactions
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD');
      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day')) &&
        tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
      );
    });
  }, [allTransactions, dateRanges]);

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

  // Calculate ALL current month transactions (for projections)
  const allMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD');
      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day'))
      );
    });
  }, [allTransactions, dateRanges]);

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

  // Future transactions
  const futureTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
        const account = accountMap[tx.accountId];

        // Exclude credit card accounts
        if (account?.type === accountConstants.AccountType.CREDIT_CARD) {
          return false;
        }

        return (
          txDate.isAfter(dateRanges.today) &&
          (txDate.isBefore(dateRanges.futureEnd) ||
            txDate.isSame(dateRanges.futureEnd, 'day')) &&
          (tx.status === transactionConstants.TransactionStatusEnum.SCHEDULED ||
            tx.status === transactionConstants.TransactionStatusEnum.PLANNED)
        );
      })
      .sort((a, b) => {
        const dateA = dayjs(a.date, 'YYYY/MM/DD');
        const dateB = dayjs(b.date, 'YYYY/MM/DD');
        return dateA.diff(dateB);
      });
  }, [allTransactions, dateRanges, accountMap]);

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
  }, [allTransactions, dateRanges, categorizeTransaction]);

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

  const formatCurrency = (amount) => {
    return `$${doublePrecisionFormatString(centsToDollars(amount))}`;
  };

  // Format transaction amount as absolute value (no negative sign)
  // The color already indicates if it's income (green) or expense (red)
  const formatTransactionAmount = (amount) => {
    return formatCurrency(Math.abs(amount));
  };

  const getAccountName = (accountId) => {
    return accountMap[accountId]?.name || 'Unknown Account';
  };

  return (
    <Box sx={{ p: 3 }}>
      <BetaBanner />
      <Typography
        variant='h4'
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        Financial Dashboard
      </Typography>

      {/* Recent Activity Section */}
      <RecentActivitySection
        recentTransactions={recentTransactions}
        recentTotals={recentTotals}
        formatCurrency={formatCurrency}
        formatTransactionAmount={formatTransactionAmount}
        getTransactionColor={getTransactionColor}
        getAccountName={getAccountName}
      />

      {/* Future Activity Section */}
      <UpcomingActivitySection
        futureTransactions={futureTransactions}
        futureTotals={futureTotals}
        formatCurrency={formatCurrency}
        formatTransactionAmount={formatTransactionAmount}
        getTransactionColor={getTransactionColor}
        getAccountName={getAccountName}
      />

      {/* Current Month Overview Section */}
      <CurrentMonthOverviewSection
        dateRanges={dateRanges}
        totals={totals}
        creditCardTotals={creditCardTotals}
        currentMonthTotals={currentMonthTotals}
        monthEndProjections={monthEndProjections}
        remainingMonthTotals={remainingMonthTotals}
        formatCurrency={formatCurrency}
      />

      {/* Placeholder for Monthly Summary */}
      <Box sx={{ mb: 2 }}>
        <PlaceholderCard
          title='Monthly Summary — Coming Soon'
          description='Compare spending and income across recent months'
          color='#fb8c00'
          backgroundColor='#fff3e0'
          borderColor='#ff9800'
        />
      </Box>

      {/* Placeholder for Tabbed Data View */}
      <PlaceholderCard
        title='Tabbed Data Views — Coming Soon'
        description='Toggle between categories, date ranges, or account types for detailed analysis'
        color='#039be5'
        backgroundColor='#e1f5fe'
        borderColor='#03a9f4'
      />
    </Box>
  );
}
