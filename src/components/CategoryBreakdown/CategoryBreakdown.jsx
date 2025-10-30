import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

// Colors for pie chart segments
const COLORS = [
  '#2196f3', // blue
  '#4caf50', // green
  '#ff9800', // orange
  '#f44336', // red
  '#9c27b0', // purple
  '#00bcd4', // cyan
  '#ffeb3b', // yellow
  '#795548', // brown
  '#607d8b', // blue grey
  '#e91e63', // pink
  '#3f51b5', // indigo
  '#009688', // teal
  '#cddc39', // lime
  '#ff5722', // deep orange
  '#673ab7', // deep purple
];

/**
 * CategoryBreakdown component displays expense breakdown by category
 * with multiple time period options: past month, current month, next month, YTD, projected year
 */
export default function CategoryBreakdown() {
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const allCategories = useSelector(categorySelectors.selectAllCategories);
  const [timePeriod, setTimePeriod] = useState('current-month');

  // Calculate category breakdown for selected time period
  const categoryData = useMemo(() => {
    const now = dayjs();
    const today = now.startOf('day');

    // Create category lookup map for O(1) lookups
    const categoryMap = new Map();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { id: cat.id, name: cat.name });
      cat.subcategories.forEach((subcat) => {
        // Map subcategory to parent category
        categoryMap.set(subcat.id, { id: cat.id, name: cat.name });
      });
    });

    let startDate;
    let endDate;
    let includeFuture = false;
    let periodLabel = '';

    switch (timePeriod) {
      case 'past-month':
        startDate = now.subtract(1, 'month').startOf('month');
        endDate = now.subtract(1, 'month').endOf('month');
        periodLabel = startDate.format('MMMM YYYY');
        includeFuture = false;
        break;
      case 'current-month':
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        periodLabel = now.format('MMMM YYYY');
        includeFuture = true; // Mix of actual and projected
        break;
      case 'next-month':
        startDate = now.add(1, 'month').startOf('month');
        endDate = now.add(1, 'month').endOf('month');
        periodLabel = startDate.format('MMMM YYYY');
        includeFuture = true; // All projected
        break;
      case 'ytd':
        startDate = now.startOf('year');
        endDate = today;
        periodLabel = `YTD ${now.format('YYYY')}`;
        includeFuture = false;
        break;
      case 'year-projected':
        startDate = now.startOf('year');
        endDate = now.endOf('year');
        periodLabel = `Projected ${now.format('YYYY')}`;
        includeFuture = true;
        break;
      default:
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        periodLabel = now.format('MMMM YYYY');
        includeFuture = true;
    }

    // Filter transactions for the selected time period
    const periodTransactions = allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD').startOf('day');

      // Check date range
      if (txDate.isBefore(startDate, 'day') || txDate.isAfter(endDate, 'day')) {
        return false;
      }

      // For YTD, only include completed transactions
      if (timePeriod === 'ytd') {
        return (
          tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
        );
      }

      // For future-only periods, include scheduled/planned
      if (timePeriod === 'next-month') {
        return (
          tx.status === transactionConstants.TransactionStatusEnum.SCHEDULED ||
          tx.status === transactionConstants.TransactionStatusEnum.PLANNED ||
          tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
        );
      }

      // For mixed periods (current month, year projected), include all
      if (includeFuture) {
        return true;
      }

      // For past month, only completed
      return tx.status === transactionConstants.TransactionStatusEnum.COMPLETE;
    });

    // Calculate totals by category (only expenses, amount < 0)
    const categoryTotals = new Map();
    let totalExpenses = 0;
    let actualExpenses = 0;
    let projectedExpenses = 0;

    periodTransactions.forEach((tx) => {
      // Only count expenses (negative amounts)
      if (tx.amount >= 0) return;

      const expenseAmount = Math.abs(tx.amount);
      totalExpenses += expenseAmount;

      // Completed transactions are actual, others are projected
      if (tx.status === transactionConstants.TransactionStatusEnum.COMPLETE) {
        actualExpenses += expenseAmount;
      } else {
        projectedExpenses += expenseAmount;
      }

      // Find category using lookup map
      const categoryId = tx.categoryId;
      if (!categoryId) return;

      const categoryInfo = categoryMap.get(categoryId);
      if (!categoryInfo) return;

      if (!categoryTotals.has(categoryInfo.id)) {
        categoryTotals.set(categoryInfo.id, {
          id: categoryInfo.id,
          name: categoryInfo.name,
          total: 0,
          actual: 0,
          projected: 0,
          count: 0,
        });
      }

      const catData = categoryTotals.get(categoryInfo.id);
      catData.total += expenseAmount;
      catData.count += 1;

      // Completed transactions are actual, others are projected
      if (tx.status === transactionConstants.TransactionStatusEnum.COMPLETE) {
        catData.actual += expenseAmount;
      } else {
        catData.projected += expenseAmount;
      }
    });

    // Convert to array and sort by total (highest first)
    const categoryArray = Array.from(categoryTotals.values())
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      categories: categoryArray,
      totalExpenses: centsToDollars(totalExpenses),
      actualExpenses: centsToDollars(actualExpenses),
      projectedExpenses: centsToDollars(projectedExpenses),
      periodLabel,
      includeFuture,
    };
  }, [allTransactions, allCategories, timePeriod]);

  const handleTimePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  const formatCurrency = (amount) => {
    return `$${doublePrecisionFormatString(amount)}`;
  };

  // If no expenses, show a message
  if (categoryData.categories.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant='h6'
            sx={{ fontWeight: 'bold' }}
          >
            Spending by Category
          </Typography>
          <ToggleButtonGroup
            value={timePeriod}
            exclusive
            onChange={handleTimePeriodChange}
            size='small'
          >
            <ToggleButton value='past-month'>Past Month</ToggleButton>
            <ToggleButton value='current-month'>Current Month</ToggleButton>
            <ToggleButton value='next-month'>Next Month</ToggleButton>
            <ToggleButton value='ytd'>YTD</ToggleButton>
            <ToggleButton value='year-projected'>Year Proj.</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'center', py: 3 }}
        >
          No expenses found for {categoryData.periodLabel}
        </Typography>
      </Paper>
    );
  }

  // Prepare data for pie chart
  const pieChartData = categoryData.categories.map((cat) => ({
    name: cat.name,
    value: centsToDollars(cat.total),
  }));

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        backgroundColor: '#f9fafb',
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header with title and time period toggle */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant='h6'
            sx={{ fontWeight: 'bold', mb: 0.5 }}
          >
            Spending by Category
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {categoryData.periodLabel}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={handleTimePeriodChange}
          size='small'
        >
          <ToggleButton value='past-month'>Past Month</ToggleButton>
          <ToggleButton value='current-month'>Current Month</ToggleButton>
          <ToggleButton value='next-month'>Next Month</ToggleButton>
          <ToggleButton value='ytd'>YTD</ToggleButton>
          <ToggleButton value='year-projected'>Year Proj.</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper
          sx={{
            flex: 1,
            minWidth: 150,
            p: 2,
            backgroundColor: '#fef1f0',
            border: '1px solid #f44336',
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
          >
            Total Expenses
          </Typography>
          <Typography
            variant='h5'
            sx={{ color: '#f44336', fontWeight: 'bold' }}
          >
            {formatCurrency(categoryData.totalExpenses)}
          </Typography>
        </Paper>
        {categoryData.includeFuture && (
          <>
            <Paper
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                backgroundColor: '#fff3e0',
                border: '1px solid #ff9800',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Actual
              </Typography>
              <Typography
                variant='h5'
                sx={{ color: '#ff9800', fontWeight: 'bold' }}
              >
                {formatCurrency(categoryData.actualExpenses)}
              </Typography>
            </Paper>
            <Paper
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                backgroundColor: '#e8f5e9',
                border: '1px solid #4caf50',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Projected
              </Typography>
              <Typography
                variant='h5'
                sx={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                {formatCurrency(categoryData.projectedExpenses)}
              </Typography>
            </Paper>
          </>
        )}
      </Box>

      {/* Chart and Table */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Pie Chart */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
          }}
        >
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <PieChart>
              <Pie
                data={pieChartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  percent > 0.05
                    ? `${name}: ${(percent * 100).toFixed(0)}%`
                    : ''
                }
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend
                verticalAlign='bottom'
                height={36}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Category Table */}
        <Box sx={{ flex: 1 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                {categoryData.includeFuture && (
                  <>
                    <TableCell
                      align='right'
                      sx={{ fontWeight: 700 }}
                    >
                      Actual
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ fontWeight: 700 }}
                    >
                      Projected
                    </TableCell>
                  </>
                )}
                <TableCell
                  align='right'
                  sx={{ fontWeight: 700 }}
                >
                  Total
                </TableCell>
                <TableCell
                  align='right'
                  sx={{ fontWeight: 700 }}
                >
                  %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryData.categories.map((cat, index) => {
                const percentage =
                  categoryData.totalExpenses > 0
                    ? (centsToDollars(cat.total) / categoryData.totalExpenses) *
                      100
                    : 0;
                return (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        {cat.name}
                      </Box>
                    </TableCell>
                    {categoryData.includeFuture && (
                      <>
                        <TableCell
                          align='right'
                          sx={{ color: '#ff9800', fontWeight: 500 }}
                        >
                          {formatCurrency(centsToDollars(cat.actual))}
                        </TableCell>
                        <TableCell
                          align='right'
                          sx={{ color: '#4caf50', fontWeight: 500 }}
                        >
                          {formatCurrency(centsToDollars(cat.projected))}
                        </TableCell>
                      </>
                    )}
                    <TableCell
                      align='right'
                      sx={{ color: '#f44336', fontWeight: 600 }}
                    >
                      {formatCurrency(centsToDollars(cat.total))}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ color: 'text.secondary' }}
                    >
                      {percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Paper>
  );
}
