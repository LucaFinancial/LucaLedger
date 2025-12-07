import { useAccountBalances } from '@/hooks/useAccountBalances';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import RecentActivitySection from './components/RecentActivitySection';
import UpcomingActivitySection from './components/UpcomingActivitySection';
import CurrentMonthOverviewSection from './components/CurrentMonthOverview';
import PlaceholderCard from './components/PlaceholderCard';
import { useDateRanges } from './hooks/useDateRanges';
import { useCategoryFilters } from './hooks/useCategoryFilters';
import { useFilteredTransactions } from './hooks/useFilteredTransactions';
import { useTransactionTotals } from './hooks/useTransactionTotals';
import {
  formatCurrency,
  formatTransactionAmount,
  getAccountName as getAccountNameUtil,
  createAccountMap,
} from './utils/dashboardUtils';

export default function Dashboard() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);
  const { totals, creditCardTotals } = useAccountBalances(accounts);

  // Use custom hooks for date ranges and category filtering
  const dateRanges = useDateRanges();
  const { isTransferTransaction, getTransactionColor, categorizeTransaction } =
    useCategoryFilters(categories);

  // Create account lookup map for performance
  const accountMap = useMemo(() => createAccountMap(accounts), [accounts]);

  // Use custom hook for filtered transactions
  const {
    recentTransactions,
    currentMonthTransactions,
    allMonthTransactions,
    futureTransactions,
  } = useFilteredTransactions(
    allTransactions,
    dateRanges,
    accountMap,
    isTransferTransaction
  );

  // Use custom hook for totals calculations
  const {
    currentMonthTotals,
    futureTotals,
    recentTotals,
    remainingMonthTotals,
    monthEndProjections,
  } = useTransactionTotals({
    recentTransactions,
    futureTransactions,
    currentMonthTransactions,
    allMonthTransactions,
    allTransactions,
    dateRanges,
    categorizeTransaction,
    isTransferTransaction,
  });

  // Helper function to get account name
  const getAccountName = (accountId) =>
    getAccountNameUtil(accountMap, accountId);

  return (
    <Box sx={{ p: 3 }}>
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
