import { Box, Typography, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import BalanceDisplay from '@/components/BalanceDisplay';
import { SettingsPanelItem } from './SettingsPanelItem';
import { selectors as transactionSelectors } from '@/store/transactions';
import { constants as transactionConstants } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { centsToDollars } from '@/utils';

export default function SettingsPanel({ account, selectedYear }) {
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id)
  );
  const categories = useSelector(categorySelectors.selectAllCategories);

  // Filter transactions by selected year
  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    return transactions.filter(
      (t) => dayjs(t.date).format('YYYY') === selectedYear
    );
  }, [transactions, selectedYear]);

  // Calculate balances with correct status values (no trailing spaces)
  const currentBalance = useMemo(() => {
    return yearFilteredTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.COMPLETE
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [yearFilteredTransactions]);

  const pendingAmount = useMemo(() => {
    return yearFilteredTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.PENDING
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [yearFilteredTransactions]);

  const pendingBalance = useMemo(() => {
    return currentBalance + pendingAmount;
  }, [currentBalance, pendingAmount]);

  const scheduledAmount = useMemo(() => {
    return yearFilteredTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.SCHEDULED
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [yearFilteredTransactions]);

  const scheduledBalance = useMemo(() => {
    return pendingBalance + scheduledAmount;
  }, [pendingBalance, scheduledAmount]);

  // Calculate income and expenses (completed transactions only)
  const { totalIncome, totalExpenses } = useMemo(() => {
    const completed = yearFilteredTransactions.filter(
      (t) => t.status === transactionConstants.TransactionStatusEnum.COMPLETE
    );

    let income = 0;
    let expenses = 0;

    completed.forEach((t) => {
      const amount = Number(t.amount);
      if (amount > 0) {
        income += amount;
      } else {
        expenses += Math.abs(amount);
      }
    });

    return { totalIncome: income, totalExpenses: expenses };
  }, [yearFilteredTransactions]);

  // Calculate top spending categories (completed transactions, expenses only)
  const topCategories = useMemo(() => {
    const completed = yearFilteredTransactions.filter(
      (t) =>
        t.status === transactionConstants.TransactionStatusEnum.COMPLETE &&
        Number(t.amount) < 0
    );

    const categoryTotals = new Map();

    completed.forEach((t) => {
      if (!t.categoryId) return;
      const current = categoryTotals.get(t.categoryId) || 0;
      categoryTotals.set(t.categoryId, current + Math.abs(Number(t.amount)));
    });

    const sorted = Array.from(categoryTotals.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName:
          categories.find((c) => c.id === categoryId)?.name || 'Unknown',
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return sorted;
  }, [yearFilteredTransactions, categories]);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (yearFilteredTransactions.length === 0) return null;

    const dates = yearFilteredTransactions.map((t) => dayjs(t.date));
    const earliest = dates.reduce((min, d) => (d.isBefore(min) ? d : min));
    const latest = dates.reduce((max, d) => (d.isAfter(max) ? d : max));

    return {
      earliest: earliest.format('MMM D, YYYY'),
      latest: latest.format('MMM D, YYYY'),
    };
  }, [yearFilteredTransactions]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
        px: 1,
        overflow: 'auto',
      }}
    >
      {/* Balances Section */}
      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: '100%',
          pb: 1,
          mb: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Balances
      </Typography>
      <Box sx={{ px: 1, mb: 3 }}>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Current Balance'
            balance={currentBalance}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Pending Balance'
            balance={pendingBalance}
            difference={pendingAmount}
            accountType={account.type}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Scheduled Balance'
            balance={scheduledBalance}
            difference={scheduledAmount}
            accountType={account.type}
          />
        </SettingsPanelItem>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Income & Expenses Section */}
      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: '100%',
          pb: 1,
          mb: 2,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Activity
      </Typography>
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Total Income
          </Typography>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'success.main' }}
          >
            $
            {centsToDollars(totalIncome).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Total Expenses
          </Typography>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'error.main' }}
          >
            $
            {centsToDollars(totalExpenses).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant='body2'
            sx={{ fontWeight: 600 }}
          >
            Net
          </Typography>
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              color:
                totalIncome - totalExpenses >= 0
                  ? 'success.main'
                  : 'error.main',
            }}
          >
            $
            {centsToDollars(totalIncome - totalExpenses).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </Typography>
        </Box>
      </Box>

      {topCategories.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />

          {/* Top Spending Categories */}
          <Typography
            variant='h6'
            sx={{
              textAlign: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              width: '100%',
              pb: 1,
              mb: 2,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Top Spending
          </Typography>
          <Box sx={{ px: 2, mb: 2 }}>
            {topCategories.map((cat, index) => (
              <Box
                key={cat.categoryId}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    mr: 1,
                  }}
                >
                  {index + 1}. {cat.categoryName}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 500 }}
                >
                  $
                  {centsToDollars(cat.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {dateRange && (
        <>
          <Divider sx={{ mb: 2 }} />

          {/* Date Range */}
          <Typography
            variant='h6'
            sx={{
              textAlign: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              width: '100%',
              pb: 1,
              mb: 2,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Date Range
          </Typography>
          <Box sx={{ px: 2 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ textAlign: 'center' }}
            >
              {dateRange.earliest}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ textAlign: 'center', fontWeight: 600 }}
            >
              to
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ textAlign: 'center' }}
            >
              {dateRange.latest}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

SettingsPanel.propTypes = {
  account: PropTypes.object.isRequired,
  selectedYear: PropTypes.string.isRequired,
};
