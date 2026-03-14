import { useAccountBalances } from '@/hooks/useAccountBalances';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import CurrentMonthOverviewSection from './components/CurrentMonthOverview';

import { useDateRanges } from './hooks/useDateRanges';
import { useCategoryFilters } from './hooks/useCategoryFilters';
import { useFilteredTransactions } from './hooks/useFilteredTransactions';
import { useTransactionTotals } from './hooks/useTransactionTotals';
import { formatCurrency, createAccountMap } from './utils/dashboardUtils';

export default function Dashboard() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const categories = useSelector(categorySelectors.selectAllCategories);
  const { totals, creditCardTotals } = useAccountBalances(accounts);

  // Use custom hooks for date ranges and category filtering
  const dateRanges = useDateRanges();
  const { isTransferTransaction, categorizeTransaction } =
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
    isTransferTransaction,
  );

  // Use custom hook for totals calculations
  const { currentMonthTotals, remainingMonthTotals, monthEndProjections } =
    useTransactionTotals({
      recentTransactions,
      futureTransactions,
      currentMonthTransactions,
      allMonthTransactions,
      allTransactions,
      dateRanges,
      categorizeTransaction,
      isTransferTransaction,
    });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold' }}>
        Financial Dashboard
      </Typography>

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
    </Box>
  );
}
