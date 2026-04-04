import { useAccountBalances } from '@/hooks/useAccountBalances';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import DashboardAnalyticsFilters from './components/DashboardAnalyticsFilters';
import CurrentMonthOverviewSection from './components/CurrentMonthOverview';
import SpendingHistorySection from './components/SpendingHistorySection/SpendingHistorySection';

import { useDateRanges } from './hooks/useDateRanges';
import { useCategoryFilters } from './hooks/useCategoryFilters';
import { useFilteredTransactions } from './hooks/useFilteredTransactions';
import { useTransactionTotals } from './hooks/useTransactionTotals';
import {
  formatCurrency,
  createAccountMap,
  filterDashboardAccounts,
  filterTransactionsByAccountIds,
  getDefaultExcludedDashboardAccountIds,
} from './utils/dashboardUtils';

export default function Dashboard() {
  const [excludeClosedAccounts, setExcludeClosedAccounts] = useState(true);
  const [manuallyExcludedAccountIds, setManuallyExcludedAccountIds] = useState(
    [],
  );
  const [manuallyIncludedAccountIds, setManuallyIncludedAccountIds] = useState(
    [],
  );
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);

  // Use custom hooks for date ranges and category filtering
  const dateRanges = useDateRanges();
  const {
    isTransferTransaction,
    isCreditCardPaymentTransaction,
    categorizeTransaction,
  } = useCategoryFilters(categories);
  const defaultExcludedAccountIds = useMemo(
    () => getDefaultExcludedDashboardAccountIds(accounts),
    [accounts],
  );
  const excludedAccountIds = useMemo(() => {
    const excludedAccountIdSet = new Set(defaultExcludedAccountIds);

    manuallyIncludedAccountIds.forEach((accountId) => {
      excludedAccountIdSet.delete(accountId);
    });
    manuallyExcludedAccountIds.forEach((accountId) => {
      excludedAccountIdSet.add(accountId);
    });

    return [...excludedAccountIdSet];
  }, [
    defaultExcludedAccountIds,
    manuallyExcludedAccountIds,
    manuallyIncludedAccountIds,
  ]);

  const dashboardAccounts = useMemo(
    () =>
      filterDashboardAccounts(accounts, {
        excludeClosedAccounts,
        excludedAccountIds,
      }),
    [accounts, excludeClosedAccounts, excludedAccountIds],
  );
  const includedAccountIds = useMemo(
    () => dashboardAccounts.map((account) => account.id),
    [dashboardAccounts],
  );
  const dashboardTransactions = useMemo(
    () => filterTransactionsByAccountIds(allTransactions, includedAccountIds),
    [allTransactions, includedAccountIds],
  );
  const { totals, creditCardTotals } = useAccountBalances(dashboardAccounts);

  // Create account lookup map for performance
  const accountMap = useMemo(
    () => createAccountMap(dashboardAccounts),
    [dashboardAccounts],
  );

  // Use custom hook for filtered transactions
  const {
    recentTransactions,
    currentMonthTransactions,
    allMonthTransactions,
    futureTransactions,
  } = useFilteredTransactions(
    dashboardTransactions,
    dateRanges,
    accountMap,
    isTransferTransaction,
  );

  // Use custom hook for totals calculations
  const { currentMonthTotals, remainingMonthTotals, monthEndProjections } =
    useTransactionTotals({
      recentTransactions,
      futureTransactions,
      currentMonthTransactions,
      allMonthTransactions,
      allTransactions: dashboardTransactions,
      accountMap,
      dateRanges,
      categorizeTransaction,
      isTransferTransaction,
      isCreditCardPaymentTransaction,
    });
  const combinedBalances = {
    current: totals.current,
    creditCardCurrent: creditCardTotals.current,
    projected: totals.current + remainingMonthTotals.balance,
  };
  const handleToggleAccount = (accountId) => {
    const isDefaultExcluded = defaultExcludedAccountIds.includes(accountId);
    const isCurrentlyExcluded = excludedAccountIds.includes(accountId);

    if (isCurrentlyExcluded) {
      setManuallyExcludedAccountIds((currentExcludedIds) =>
        currentExcludedIds.filter((id) => id !== accountId),
      );

      if (isDefaultExcluded) {
        setManuallyIncludedAccountIds((currentIncludedIds) =>
          currentIncludedIds.includes(accountId)
            ? currentIncludedIds
            : [...currentIncludedIds, accountId],
        );
      }

      return;
    }

    setManuallyIncludedAccountIds((currentIncludedIds) =>
      currentIncludedIds.filter((id) => id !== accountId),
    );

    if (!isDefaultExcluded) {
      setManuallyExcludedAccountIds((currentExcludedIds) =>
        currentExcludedIds.includes(accountId)
          ? currentExcludedIds
          : [...currentExcludedIds, accountId],
      );
    }
  };
  const handleResetFilters = () => {
    setExcludeClosedAccounts(true);
    setManuallyExcludedAccountIds([]);
    setManuallyIncludedAccountIds([]);
  };
  const hasActiveFilters =
    !excludeClosedAccounts ||
    manuallyExcludedAccountIds.length > 0 ||
    manuallyIncludedAccountIds.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold' }}>
        Financial Dashboard
      </Typography>

      <DashboardAnalyticsFilters
        accounts={accounts}
        excludeClosedAccounts={excludeClosedAccounts}
        excludedAccountIds={excludedAccountIds}
        hasActiveFilters={hasActiveFilters}
        onExcludeClosedAccountsChange={setExcludeClosedAccounts}
        onToggleAccount={handleToggleAccount}
        onReset={handleResetFilters}
      />

      {/* Current Month Overview Section */}
      <CurrentMonthOverviewSection
        dateRanges={dateRanges}
        combinedBalances={combinedBalances}
        currentMonthTotals={currentMonthTotals}
        monthEndProjections={monthEndProjections}
        remainingMonthTotals={remainingMonthTotals}
        formatCurrency={formatCurrency}
      />

      <SpendingHistorySection includedAccountIds={includedAccountIds} />
    </Box>
  );
}
