import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useMemo } from 'react';
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
 * for the current month only
 */
export default function CategoryBreakdown() {
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const allCategories = useSelector(categorySelectors.selectAllCategories);

  // Calculate category breakdown for current month
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

    // Current month date range
    const startDate = now.startOf('month');
    const endDate = now.endOf('month');
    const periodLabel = now.format('MMMM YYYY');

    // Filter transactions for the current month
    const periodTransactions = allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD').startOf('day');

      // Check date range
      if (txDate.isBefore(startDate, 'day') || txDate.isAfter(endDate, 'day')) {
        return false;
      }

      // Include all transaction types for current month
      return true;
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

      const txDate = dayjs(tx.date, 'YYYY/MM/DD').startOf('day');
      const isActual = txDate.isBefore(today) || txDate.isSame(today, 'day');

      if (
        isActual &&
        tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
      ) {
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

      if (
        isActual &&
        tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
      ) {
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
    };
  }, [allTransactions, allCategories]);

  const formatCurrency = (amount) => {
    // Handle NaN, null, undefined by defaulting to 0
    const safeAmount =
      isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    return `$${doublePrecisionFormatString(safeAmount)}`;
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
        <Typography
          variant='h6'
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Spending by Category
        </Typography>
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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
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
      </Box>{' '}
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
