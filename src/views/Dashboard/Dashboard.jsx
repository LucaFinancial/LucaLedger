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
import { useMemo } from 'react';

export default function Dashboard() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const { totals } = useAccountBalances(accounts);

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
  const isExpenseTransaction = (tx) => {
    const account = accountMap[tx.accountId];
    if (!account) return tx.amount < 0;

    if (account.type === accountConstants.AccountType.CREDIT_CARD) {
      return tx.amount > 0; // Positive amounts on credit cards are charges (expenses)
    }
    return tx.amount < 0; // For checking/savings, negative is expense
  };

  // Helper function to get the display color for a transaction
  const getTransactionColor = (tx) => {
    return isExpenseTransaction(tx) ? 'error.main' : 'success.main';
  };

  // Filter transactions by time period
  const recentTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
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
  }, [allTransactions, dateRanges]);

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

  // Calculate current month totals
  const currentMonthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    currentMonthTransactions.forEach((tx) => {
      const account = accountMap[tx.accountId];
      if (!account) return;

      if (account.type === accountConstants.AccountType.CREDIT_CARD) {
        // For credit cards: positive = charge (expense), negative = payment (income)
        if (tx.amount > 0) {
          expenses += tx.amount;
        } else {
          income += Math.abs(tx.amount);
        }
      } else {
        // For checking/savings: positive = deposit (income), negative = withdrawal (expense)
        if (tx.amount > 0) {
          income += tx.amount;
        } else {
          expenses += Math.abs(tx.amount);
        }
      }
    });

    const netFlow = income - expenses;
    return { income, expenses, netFlow };
  }, [currentMonthTransactions, accountMap]);

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

  // Calculate future totals
  const futureTotals = useMemo(() => {
    let scheduled = 0;

    futureTransactions.forEach((tx) => {
      const account = accountMap[tx.accountId];
      if (!account) return;

      if (account.type === accountConstants.AccountType.CREDIT_CARD) {
        // For credit cards: positive = charge (expense), negative = payment (income)
        // Net impact: charges increase debt (negative impact), payments decrease debt (positive impact)
        scheduled -= tx.amount;
      } else {
        // For checking/savings: positive = income, negative = expense
        scheduled += tx.amount;
      }
    });

    return { scheduled };
  }, [futureTransactions, accountMap]);

  const formatCurrency = (amount) => {
    return `$${doublePrecisionFormatString(centsToDollars(amount))}`;
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
                        {formatCurrency(tx.amount)}
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
              md={3}
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
                    Total Income
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#4caf50', fontWeight: 'bold' }}
                  >
                    {formatCurrency(currentMonthTotals.income)}
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
                  borderTop: '3px solid #f44336',
                  backgroundColor: '#fef1f0',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Total Expenses
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#f44336', fontWeight: 'bold' }}
                  >
                    {formatCurrency(currentMonthTotals.expenses)}
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
                  <Typography
                    variant='h4'
                    sx={{
                      color:
                        currentMonthTotals.netFlow >= 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                    }}
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
                  borderTop: '3px solid #9c27b0',
                  backgroundColor: '#f3e5f5',
                }}
              >
                <CardContent>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                  >
                    Current Balance
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ color: '#9c27b0', fontWeight: 'bold' }}
                  >
                    {formatCurrency(totals.current)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
                        {formatCurrency(tx.amount)}
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
