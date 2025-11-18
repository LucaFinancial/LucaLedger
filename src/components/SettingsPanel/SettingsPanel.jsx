import { Box, Typography, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

  // Filter transactions by selected year for income/expense/category stats
  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    return transactions.filter(
      (t) => dayjs(t.date).format('YYYY') === selectedYear
    );
  }, [transactions, selectedYear]);

  // For balances, use ALL transactions up to the end of the selected year
  const balanceTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    const endOfYear = dayjs(`${selectedYear}-12-31`);
    return transactions.filter((t) => {
      const txDate = dayjs(t.date);
      return txDate.isBefore(endOfYear) || txDate.isSame(endOfYear, 'day');
    });
  }, [transactions, selectedYear]);

  // Calculate balances with correct status values (no trailing spaces)
  const currentBalance = useMemo(() => {
    return balanceTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.COMPLETE
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [balanceTransactions]);

  const pendingAmount = useMemo(() => {
    return balanceTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.PENDING
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [balanceTransactions]);

  const pendingBalance = useMemo(() => {
    return currentBalance + pendingAmount;
  }, [currentBalance, pendingAmount]);

  const scheduledAmount = useMemo(() => {
    return balanceTransactions
      .filter(
        (transaction) =>
          transaction.status ===
          transactionConstants.TransactionStatusEnum.SCHEDULED
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [balanceTransactions]);

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
      {/* Balances */}
      <Box sx={{ px: 2 }}>
        <BalanceDisplay
          label='Current Balance'
          balance={currentBalance}
        />
        <BalanceDisplay
          label='Pending Balance'
          balance={pendingBalance}
          difference={pendingAmount}
          accountType={account.type}
        />
        <Box sx={{ mb: 0 }}>
          <BalanceDisplay
            label='Scheduled Balance'
            balance={scheduledBalance}
            difference={scheduledAmount}
            accountType={account.type}
          />
        </Box>
      </Box>

      {topCategories.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2 }}>
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 2,
              }}
            >
              Spending by Category
            </Typography>

            {/* Pie Chart */}
            <Box
              sx={{
                width: '100%',
                height: 200,
                mb: 2,
              }}
            >
              <ResponsiveContainer
                width='100%'
                height='100%'
              >
                <PieChart>
                  <Pie
                    data={topCategories.map((cat) => ({
                      name: cat.categoryName,
                      value: centsToDollars(cat.total),
                    }))}
                    cx='50%'
                    cy='50%'
                    outerRadius={70}
                    dataKey='value'
                  >
                    {topCategories.map((entry, index) => {
                      const colors = [
                        '#1976d2',
                        '#42a5f5',
                        '#64b5f6',
                        '#90caf9',
                        '#bbdefb',
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            {topCategories.map((cat, index) => {
              const total = topCategories.reduce((sum, c) => sum + c.total, 0);
              const percentage = ((cat.total / total) * 100).toFixed(1);
              const colors = [
                '#1976d2',
                '#42a5f5',
                '#64b5f6',
                '#90caf9',
                '#bbdefb',
              ];

              return (
                <Box
                  key={cat.categoryId}
                  sx={{
                    py: 1.5,
                    borderBottom:
                      index < topCategories.length - 1
                        ? '1px solid rgba(0, 0, 0, 0.06)'
                        : 'none',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: colors[index % colors.length],
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {cat.categoryName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      pl: 2.25,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'text.primary',
                      }}
                    >
                      $
                      {centsToDollars(cat.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                      }}
                    >
                      {percentage}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
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
