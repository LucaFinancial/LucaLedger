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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import BetaBanner from '@/components/BetaBanner';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import { useMemo, useCallback } from 'react';

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
          tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
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
  }, [allTransactions, dateRanges]);

  // Calculate future totals (for next 30 days section)
  const futureTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    futureTransactions.forEach((tx) => {
      const { income: txIncome, expense: txExpense } =
        categorizeTransaction(tx);
      income += txIncome;
      expenses += txExpense;
    });

    const scheduled = income - expenses;
    return { scheduled };
  }, [futureTransactions, categorizeTransaction]);

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
      <Accordion
        defaultExpanded
        sx={{
          mb: 3,
          borderLeft: '4px solid #ff9800',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: '#fff3e0',
            '&:hover': { backgroundColor: '#ffe0b2' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ color: '#ff9800' }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold' }}
            >
              Recent Activity
            </Typography>
            <Chip
              label={`Last 14 Days`}
              size='small'
              sx={{ backgroundColor: '#ff9800', color: 'white' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Account</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell align='right'>
                    <strong>Amount</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align='center'
                      sx={{ py: 3, color: 'text.secondary' }}
                    >
                      No recent transactions in the last 14 days
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell>
                        {dayjs(tx.date, 'YYYY/MM/DD').format('MMM D, YYYY')}
                      </TableCell>
                      <TableCell>{getAccountName(tx.accountId)}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          color: getTransactionColor(tx),
                          fontWeight: 'bold',
                        }}
                      >
                        {formatTransactionAmount(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Current Month Overview Section */}
      <Accordion
        defaultExpanded
        sx={{
          mb: 3,
          borderLeft: '4px solid #2196f3',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: '#e3f2fd',
            '&:hover': { backgroundColor: '#bbdefb' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
              pr: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: '#2196f3' }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 'bold' }}
              >
                Current Month Overview
              </Typography>
              <Chip
                label={dateRanges.today.format('MMMM YYYY')}
                size='small'
                sx={{ backgroundColor: '#2196f3', color: 'white' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                ml: 'auto',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mr: 0.5 }}
                >
                  Starting:
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: '#ba68c8',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {formatCurrency(totals.current - currentMonthTotals.netFlow)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mr: 0.5 }}
                >
                  Current:
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: '#9c27b0',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {formatCurrency(totals.current)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mr: 0.5 }}
                >
                  Projected:
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: '#7b1fa2',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {formatCurrency(totals.future)}
                </Typography>
              </Box>
              <Box
                sx={{
                  borderLeft: '2px solid rgba(0,0,0,0.12)',
                  paddingLeft: 2,
                }}
              >
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mr: 0.5 }}
                >
                  Credit Card Balance:
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: '#d32f2f',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {formatCurrency(creditCardTotals.current)}
                  {creditCardTotals.pending !== creditCardTotals.current && (
                    <span>
                      {' '}
                      (+
                      {formatCurrency(
                        creditCardTotals.pending - creditCardTotals.current
                      )}{' '}
                      pending)
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            container
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card
                sx={{
                  borderTop: '3px solid #4caf50',
                  backgroundColor: '#f1f8f4',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Income
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Current
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{ color: '#4caf50', fontWeight: 'bold' }}
                      >
                        {formatCurrency(currentMonthTotals.income)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Projected
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{ color: '#388e3c', fontWeight: 'bold' }}
                      >
                        {formatCurrency(monthEndProjections.projectedIncome)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card
                sx={{
                  borderTop: '3px solid #f44336',
                  backgroundColor: '#fef1f0',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Expenses
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Current
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{ color: '#f44336', fontWeight: 'bold' }}
                      >
                        {formatCurrency(currentMonthTotals.expenses)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Projected
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{ color: '#d32f2f', fontWeight: 'bold' }}
                      >
                        {formatCurrency(monthEndProjections.projectedExpenses)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Card
                sx={{
                  borderTop: '3px solid #2196f3',
                  backgroundColor: '#e3f2fd',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Net Flow
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Current
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{
                          color:
                            currentMonthTotals.netFlow >= 0
                              ? '#4caf50'
                              : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(currentMonthTotals.netFlow)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        Projected
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{
                          color:
                            monthEndProjections.projectedNetFlow >= 0
                              ? '#4caf50'
                              : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(monthEndProjections.projectedNetFlow)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transaction Status Charges */}
          <Grid
            container
            spacing={3}
            sx={{ mb: 3 }}
          >
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderTop: '3px solid #2196f3',
                  backgroundColor: '#e3f2fd',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Completed
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#2196f3', fontWeight: 'bold' }}
                  >
                    {formatCurrency(currentMonthTotals.netFlow)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderTop: '3px solid #ff9800',
                  backgroundColor: '#fff3e0',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Pending
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#ff9800', fontWeight: 'bold' }}
                  >
                    {formatCurrency(totals.pending - totals.current)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderTop: '3px solid #4caf50',
                  backgroundColor: '#e8f5e9',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Scheduled
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#4caf50', fontWeight: 'bold' }}
                  >
                    {formatCurrency(totals.scheduled - totals.pending)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderTop: '3px solid #673ab7',
                  backgroundColor: '#ede7f6',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Planned
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#673ab7', fontWeight: 'bold' }}
                  >
                    {formatCurrency(totals.future - totals.scheduled)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Month Overview Summary */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Month Overview
            </Typography>

            {/* Progress bar */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Day {monthEndProjections.currentDay} of{' '}
                  {monthEndProjections.daysInMonth}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  {monthEndProjections.daysRemaining} days remaining
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${monthEndProjections.monthProgress}%`,
                    height: '100%',
                    backgroundColor: '#2196f3',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>

            {/* Three-column summary */}
            <Grid
              container
              spacing={2}
            >
              {/* Month-to-Date (Actuals) */}
              <Grid
                item
                xs={12}
                md={4}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 'bold', mb: 1, color: '#2196f3' }}
                  >
                    Current
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Income
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ color: '#4caf50', fontWeight: 'bold' }}
                    >
                      {formatCurrency(currentMonthTotals.income)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Expenses{' '}
                      {totals.pending - totals.current < 0 && '(Pending)'}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}
                    >
                      <Typography
                        variant='h6'
                        sx={{ color: '#f44336', fontWeight: 'bold' }}
                      >
                        {formatCurrency(currentMonthTotals.expenses)}
                      </Typography>
                      {totals.pending - totals.current < 0 && (
                        <Typography
                          variant='body1'
                          sx={{ color: '#ff9800', fontWeight: 'bold' }}
                        >
                          (
                          {formatCurrency(
                            Math.abs(totals.pending - totals.current)
                          )}
                          )
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      pt: 1,
                      borderTop: '1px solid #90caf9',
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}
                    >
                      <Typography
                        variant='h6'
                        sx={{ color: '#2196f3', fontWeight: 'bold' }}
                      >
                        {formatCurrency(totals.current)}
                      </Typography>
                      {totals.pending !== totals.current && (
                        <Typography
                          variant='body1'
                          sx={{ color: '#2196f3', fontWeight: 'bold' }}
                        >
                          ({formatCurrency(totals.pending)})
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Remaining Month (Scheduled/Planned) */}
              <Grid
                item
                xs={12}
                md={4}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ff9800',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 'bold', mb: 1, color: '#ff9800' }}
                  >
                    Remaining
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Income
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ color: '#4caf50', fontWeight: 'bold' }}
                    >
                      {formatCurrency(remainingMonthTotals.income)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Expenses
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ color: '#f44336', fontWeight: 'bold' }}
                    >
                      {formatCurrency(remainingMonthTotals.expenses)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      pt: 1,
                      borderTop: '1px solid #ffcc80',
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Net
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{
                        color:
                          remainingMonthTotals.netFlow >= 0
                            ? '#4caf50'
                            : '#f44336',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(remainingMonthTotals.netFlow)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Month-End Projection */}
              <Grid
                item
                xs={12}
                md={4}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f3e5f5',
                    border: '1px solid #9c27b0',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 'bold', mb: 1, color: '#9c27b0' }}
                  >
                    Projected
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Income
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ color: '#4caf50', fontWeight: 'bold' }}
                    >
                      {formatCurrency(monthEndProjections.projectedIncome)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Expenses
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{ color: '#f44336', fontWeight: 'bold' }}
                    >
                      {formatCurrency(monthEndProjections.projectedExpenses)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      pt: 1,
                      borderTop: '1px solid #ce93d8',
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                    >
                      Projected Balance
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{
                        color:
                          monthEndProjections.projectedNetFlow >= 0
                            ? '#4caf50'
                            : '#f44336',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(totals.future)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Category Breakdown */}
          <CategoryBreakdown />

          {/* Placeholder for Trend Chart */}
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#f5f5f5',
              border: '2px dashed #bdbdbd',
              textAlign: 'center',
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 40, color: '#9e9e9e', mb: 1 }} />
            <Typography
              variant='h6'
              sx={{ color: 'text.secondary', mb: 1 }}
            >
              Balance Trend Chart — Coming Soon
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary' }}
            >
              Track your balance movement throughout the current month
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Future Activity Section */}
      <Accordion
        defaultExpanded
        sx={{
          mb: 3,
          borderLeft: '4px solid #4caf50',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: '#e8f5e9',
            '&:hover': { backgroundColor: '#c8e6c9' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ color: '#4caf50' }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold' }}
            >
              Upcoming Activity
            </Typography>
            <Chip
              label={`Next 30 Days`}
              size='small'
              sx={{ backgroundColor: '#4caf50', color: 'white' }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Card sx={{ backgroundColor: '#f1f8f4', mb: 2 }}>
              <CardContent>
                <Typography
                  variant='body2'
                  color='textSecondary'
                >
                  Total Scheduled
                </Typography>
                <Typography
                  variant='h5'
                  sx={{
                    color: futureTotals.scheduled >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                  }}
                >
                  {formatCurrency(futureTotals.scheduled)}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Account</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align='right'>
                    <strong>Amount</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {futureTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align='center'
                      sx={{ py: 3, color: 'text.secondary' }}
                    >
                      No upcoming scheduled or planned transactions
                    </TableCell>
                  </TableRow>
                ) : (
                  futureTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell>
                        {dayjs(tx.date, 'YYYY/MM/DD').format('MMM D, YYYY')}
                      </TableCell>
                      <TableCell>{getAccountName(tx.accountId)}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          size='small'
                          sx={{
                            backgroundColor:
                              tx.status ===
                              transactionConstants.TransactionStatusEnum
                                .SCHEDULED
                                ? '#4caf50'
                                : '#2196f3',
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          color: getTransactionColor(tx),
                          fontWeight: 'bold',
                        }}
                      >
                        {formatTransactionAmount(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Placeholder for Monthly Summary */}
      <Paper
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: '#fff3e0',
          border: '2px dashed #ff9800',
          textAlign: 'center',
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 40, color: '#fb8c00', mb: 1 }} />
        <Typography
          variant='h6'
          sx={{ color: 'text.secondary', mb: 1 }}
        >
          Monthly Summary — Coming Soon
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary' }}
        >
          Compare spending and income across recent months
        </Typography>
      </Paper>

      {/* Placeholder for Tabbed Data View */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#e1f5fe',
          border: '2px dashed #03a9f4',
          textAlign: 'center',
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 40, color: '#039be5', mb: 1 }} />
        <Typography
          variant='h6'
          sx={{ color: 'text.secondary', mb: 1 }}
        >
          Tabbed Data Views — Coming Soon
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary' }}
        >
          Toggle between categories, date ranges, or account types for detailed
          analysis
        </Typography>
      </Paper>
    </Box>
  );
}
