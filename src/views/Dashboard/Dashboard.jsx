import { useAccountBalances } from '@/hooks/useAccountBalances';
import {
  constants as accountConstants,
  selectors as accountSelectors,
} from '@/store/accounts';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
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
  const categories = useSelector(categorySelectors.selectAllCategories);
  const { totals, creditCardTotals } = useAccountBalances(accounts);

  // Find the Income and Transfers parent category IDs
  const incomeCategoryId = useMemo(() => {
    const incomeCategory = categories.find(
      (cat) => cat.slug === 'income' && !cat.parentId
    );
    return incomeCategory?.id;
  }, [categories]);

  const transfersCategoryId = useMemo(() => {
    const transfersCategory = categories.find(
      (cat) => cat.slug === 'transfers' && !cat.parentId
    );
    return transfersCategory?.id;
  }, [categories]);

  // Get all income category IDs (parent + children)
  const incomeCategoryIds = useMemo(() => {
    if (!incomeCategoryId) return [];
    const subcategories = categories.filter(
      (cat) => cat.parentId === incomeCategoryId
    );
    return [incomeCategoryId, ...subcategories.map((cat) => cat.id)];
  }, [categories, incomeCategoryId]);

  // Get all transfer category IDs (parent + children)
  const transferCategoryIds = useMemo(() => {
    if (!transfersCategoryId) return [];
    const subcategories = categories.filter(
      (cat) => cat.parentId === transfersCategoryId
    );
    return [transfersCategoryId, ...subcategories.map((cat) => cat.id)];
  }, [categories, transfersCategoryId]);

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

  // Helper function to determine if a transaction is income
  const isIncomeTransaction = useCallback(
    (tx) => {
      if (!tx.categoryId) return false;
      return incomeCategoryIds.includes(tx.categoryId);
    },
    [incomeCategoryIds]
  );

  // Helper function to determine if a transaction is a transfer
  const isTransferTransaction = useCallback(
    (tx) => {
      if (!tx.categoryId) return false;
      return transferCategoryIds.includes(tx.categoryId);
    },
    [transferCategoryIds]
  );

  // Helper function to get the display color for a transaction
  const getTransactionColor = useCallback(
    (tx) => {
      if (isIncomeTransaction(tx)) return 'success.main';
      return 'error.main'; // Expense
    },
    [isIncomeTransaction]
  );

  // Helper function to categorize transaction as income or expense amount
  // Returns { income: number, expense: number } with absolute values
  // Transfers are excluded from both income and expense totals
  const categorizeTransaction = useCallback(
    (tx) => {
      const absAmount = Math.abs(tx.amount);

      // Transfers are neutral - don't count as income or expense
      if (isTransferTransaction(tx)) {
        return { income: 0, expense: 0 };
      }

      if (isIncomeTransaction(tx)) {
        return { income: absAmount, expense: 0 };
      }

      // Everything else is an expense
      return { income: 0, expense: absAmount };
    },
    [isIncomeTransaction, isTransferTransaction]
  );

  // Filter transactions by time period
  const recentTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
        const account = accountMap[tx.accountId];

        // Exclude transfers
        if (isTransferTransaction(tx)) {
          return false;
        }

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
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

  // Current month transactions
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
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
        tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

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

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day'))
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

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

        // Exclude transfers
        if (isTransferTransaction(tx)) {
          return false;
        }

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
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

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
