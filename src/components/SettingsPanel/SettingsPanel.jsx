import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

import BalanceDisplay from '@/components/BalanceDisplay';
import {
  selectors as transactionSelectors,
  constants as transactionConstants,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { constants as accountConstants } from '@/store/accounts';
import { centsToDollars } from '@/utils';

export default function SettingsPanel({ account, selectedYear }) {
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id),
  );
  const categories = useSelector(categorySelectors.selectAllCategories);

  // Month selector state for category spending
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM'),
  );

  // View selector state for category spending (current, pending, scheduled)
  const [selectedView, setSelectedView] = useState('current');

  // Filter transactions by selected year for income/expense/category stats
  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    if (selectedYear === 'rolling') {
      // For rolling view stats, default to current year or handle differently
      // For now, let's use current year to show relevant stats
      const currentYear = format(new Date(), 'yyyy');
      return transactions.filter(
        (t) =>
          format(parseISO(t.date.replace(/\//g, '-')), 'yyyy') === currentYear,
      );
    }
    return transactions.filter(
      (t) =>
        format(parseISO(t.date.replace(/\//g, '-')), 'yyyy') === selectedYear,
    );
  }, [transactions, selectedYear]);

  // For balances, use ALL transactions regardless of selected year
  const balanceTransactions = useMemo(() => {
    return transactions;
  }, [transactions]);

  // Calculate balances with correct status values (no trailing spaces)
  const currentBalance = useMemo(() => {
    const initialBalance = account.initialBalance || 0;
    const transactionSum = balanceTransactions
      .filter(
        (transaction) =>
          transaction.transactionState ===
          transactionConstants.TransactionStateEnum.COMPLETED,
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
    return initialBalance + transactionSum;
  }, [balanceTransactions, account.initialBalance]);

  const pendingAmount = useMemo(() => {
    return balanceTransactions
      .filter(
        (transaction) =>
          transaction.transactionState ===
          transactionConstants.TransactionStateEnum.PENDING,
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
          transaction.transactionState ===
          transactionConstants.TransactionStateEnum.SCHEDULED,
      )
      .reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  }, [balanceTransactions]);

  const scheduledBalance = useMemo(() => {
    return pendingBalance + scheduledAmount;
  }, [pendingBalance, scheduledAmount]);

  // Calculate top spending categories based on selected view and month
  const topCategories = useMemo(() => {
    const isCreditCard =
      account.type === accountConstants.AccountType.CREDIT_CARD;

    // For credit cards, expenses are positive amounts; for checking/savings, they're negative
    let expenses = yearFilteredTransactions.filter((t) =>
      isCreditCard ? Number(t.amount) > 0 : Number(t.amount) < 0,
    );

    // Apply month filter first
    if (selectedMonth !== 'all') {
      expenses = expenses.filter((t) => {
        return (
          format(parseISO(t.date.replace(/\//g, '-')), 'yyyy-MM') ===
          selectedMonth
        );
      });
    }

    // Determine which transactions to use for ranking based on selected view
    let rankingTransactions = expenses;
    if (selectedView === 'current') {
      rankingTransactions = expenses.filter(
        (t) =>
          t.transactionState ===
          transactionConstants.TransactionStateEnum.COMPLETED,
      );
    } else if (selectedView === 'pending') {
      rankingTransactions = expenses.filter(
        (t) =>
          t.transactionState ===
            transactionConstants.TransactionStateEnum.COMPLETED ||
          t.transactionState ===
            transactionConstants.TransactionStateEnum.PENDING,
      );
    } else if (selectedView === 'scheduled') {
      rankingTransactions = expenses.filter(
        (t) =>
          t.transactionState ===
            transactionConstants.TransactionStateEnum.COMPLETED ||
          t.transactionState ===
            transactionConstants.TransactionStateEnum.PENDING ||
          t.transactionState ===
            transactionConstants.TransactionStateEnum.SCHEDULED,
      );
    }

    // Calculate totals for ranking
    const categoryTotals = new Map();
    rankingTransactions.forEach((t) => {
      if (!t.categoryId) return;
      const current = categoryTotals.get(t.categoryId) || 0;
      categoryTotals.set(t.categoryId, current + Math.abs(Number(t.amount)));
    });

    // Get all categories sorted by total
    const allCategoryIds = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId]) => categoryId);

    // Now calculate separate amounts by status for all categories
    const categoryDetails = allCategoryIds.map((categoryId) => {
      const categoryTransactions = expenses.filter(
        (t) => t.categoryId === categoryId,
      );

      const completedTotal = categoryTransactions
        .filter(
          (t) =>
            t.transactionState === transactionConstants.TransactionStateEnum.COMPLETED,
        )
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      const pendingTotal = categoryTransactions
        .filter(
          (t) => t.transactionState === transactionConstants.TransactionStateEnum.PENDING,
        )
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      const scheduledTotal = categoryTransactions
        .filter(
          (t) =>
            t.transactionState === transactionConstants.TransactionStateEnum.SCHEDULED,
        )
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      return {
        categoryId,
        categoryName:
          categories.find((c) => c.id === categoryId)?.name || 'Unknown',
        completedTotal,
        pendingTotal,
        scheduledTotal,
        rankingTotal: categoryTotals.get(categoryId),
      };
    });

    return categoryDetails;
  }, [
    yearFilteredTransactions,
    categories,
    selectedMonth,
    selectedView,
    account.type,
  ]);

  // Get available months from the year-filtered transactions
  const availableMonths = useMemo(() => {
    const months = new Set();
    yearFilteredTransactions.forEach((t) => {
      months.add(format(parseISO(t.date.replace(/\//g, '-')), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [yearFilteredTransactions]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
        px: 0.5,
        overflow: 'hidden',
      }}
    >
      {/* Balances */}
      <Box sx={{ px: 1.5, flexShrink: 0, mt: 2 }}>
        <BalanceDisplay label='Current Balance' balance={currentBalance} />
        <BalanceDisplay
          label='Pending Balance'
          balance={pendingBalance}
          difference={pendingAmount}
          accountType={account.type}
        />
        <BalanceDisplay
          label='Scheduled Balance'
          balance={scheduledBalance}
          difference={scheduledAmount}
          accountType={account.type}
        />
      </Box>

      {yearFilteredTransactions.length > 0 && (
        <>
          <Divider sx={{ my: 1.25, flexShrink: 0 }} />
          <Box
            sx={{
              px: 1.5,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              flex: 1,
            }}
          >
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                mb: 1,
                flexShrink: 0,
              }}
            >
              Spending by Category
            </Typography>

            {/* Month Selector */}
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size='small'
              fullWidth
              sx={{
                mb: 2,
                fontSize: '0.875rem',
                flexShrink: 0,
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value='all'>All Year</MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {format(parseISO(month + '-01'), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </Select>

            {/* View Selector Tabs */}
            <Tabs
              value={selectedView}
              onChange={(e, newValue) => setSelectedView(newValue)}
              sx={{
                mb: 2,
                minHeight: 'auto',
                flexShrink: 0,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                },
              }}
            >
              <Tab
                value='current'
                label='Current'
                sx={{
                  minHeight: 'auto',
                  py: 1,
                  px: 2,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  flex: 1,
                }}
              />
              <Tab
                value='pending'
                label='Pending'
                sx={{
                  minHeight: 'auto',
                  py: 1,
                  px: 2,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  flex: 1,
                }}
              />
              <Tab
                value='scheduled'
                label='Scheduled'
                sx={{
                  minHeight: 'auto',
                  py: 1,
                  px: 2,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  flex: 1,
                }}
              />
            </Tabs>

            {/* Pie Chart - always show, even with no data */}
            <Box
              sx={{
                width: '100%',
                height: 180,
                mb: 1,
                flexShrink: 0,
              }}
            >
              <Pie
                data={{
                  labels:
                    topCategories.length > 0
                      ? topCategories.map((cat) => cat.categoryName)
                      : ['No Data'],
                  datasets: [
                    {
                      data:
                        topCategories.length > 0
                          ? topCategories.map((cat) =>
                              centsToDollars(cat.rankingTotal),
                            )
                          : [1],
                      backgroundColor:
                        topCategories.length > 0
                          ? [
                              '#1976d2', // blue
                              '#f57c00', // orange
                              '#388e3c', // green
                              '#d32f2f', // red
                              '#7b1fa2', // purple
                              '#0097a7', // cyan
                              '#fbc02d', // yellow
                              '#c2185b', // pink
                              '#5d4037', // brown
                              '#455a64', // blue grey
                              '#512da8', // deep purple
                              '#00796b', // teal
                            ]
                          : ['#e0e0e0'],
                      borderColor: '#fff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: topCategories.length > 0,
                      callbacks: {
                        label: function (context) {
                          const value = context.parsed ?? 0;
                          return `$${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`;
                        },
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Category List - Scrollable */}
            <Box
              sx={{
                overflowY: 'auto',
                flexGrow: 1,
                minHeight: 0,
              }}
            >
              {topCategories.length === 0 ? (
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    py: 2,
                    fontStyle: 'italic',
                  }}
                >
                  No spending data for selected period
                </Typography>
              ) : (
                <>
                  {topCategories.map((cat, index) => {
                    const total = topCategories.reduce(
                      (sum, c) => sum + c.rankingTotal,
                      0,
                    );
                    const percentage = (
                      (cat.rankingTotal / total) *
                      100
                    ).toFixed(1);
                    const colors = [
                      '#1976d2', // blue
                      '#f57c00', // orange
                      '#388e3c', // green
                      '#d32f2f', // red
                      '#7b1fa2', // purple
                      '#0097a7', // cyan
                      '#fbc02d', // yellow
                      '#c2185b', // pink
                      '#5d4037', // brown
                      '#455a64', // blue grey
                      '#512da8', // deep purple
                      '#00796b', // teal
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
                            pl: 2.25,
                          }}
                        >
                          {/* Primary Amount - changes based on selected view */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              mb:
                                cat.pendingTotal > 0 || cat.scheduledTotal > 0
                                  ? 0.5
                                  : 0,
                            }}
                          >
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: (() => {
                                  if (selectedView === 'current') {
                                    return 'text.primary';
                                  } else if (selectedView === 'pending') {
                                    // Show pending color only if there's pending amount
                                    return cat.pendingTotal > 0
                                      ? 'warning.main'
                                      : 'text.primary';
                                  } else {
                                    // scheduled view
                                    if (cat.scheduledTotal > 0)
                                      return 'info.main';
                                    if (cat.pendingTotal > 0)
                                      return 'warning.main';
                                    return 'text.primary';
                                  }
                                })(),
                              }}
                            >
                              $
                              {centsToDollars(
                                selectedView === 'current'
                                  ? cat.completedTotal
                                  : selectedView === 'pending'
                                    ? cat.completedTotal + cat.pendingTotal
                                    : cat.completedTotal +
                                      cat.pendingTotal +
                                      cat.scheduledTotal,
                              ).toLocaleString(undefined, {
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

                          {/* Pending and Scheduled Indicators */}
                          {(cat.pendingTotal > 0 || cat.scheduledTotal > 0) && (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 2,
                              }}
                            >
                              {/* Pending - always on left */}
                              {cat.pendingTotal > 0 ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.25,
                                  }}
                                >
                                  <Typography
                                    variant='caption'
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.65rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Box
                                      component='span'
                                      sx={{
                                        fontSize: '0.6rem',
                                      }}
                                    >
                                      ⏱
                                    </Box>
                                    Pending
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      color: 'warning.main',
                                      fontSize: '0.8rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    $
                                    {centsToDollars(
                                      cat.pendingTotal,
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ width: 80 }} /> // Spacer to keep scheduled on right
                              )}

                              {/* Scheduled - always on right */}
                              {cat.scheduledTotal > 0 && (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.25,
                                  }}
                                >
                                  <Typography
                                    variant='caption'
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.65rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Box
                                      component='span'
                                      sx={{
                                        fontSize: '0.6rem',
                                      }}
                                    >
                                      📅
                                    </Box>
                                    Scheduled
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      color: 'info.main',
                                      fontSize: '0.8rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    $
                                    {centsToDollars(
                                      cat.scheduledTotal,
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>
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
