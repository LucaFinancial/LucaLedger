import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import {
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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
  const allCategories = useSelector(
    categorySelectors.selectCategoriesHierarchical,
  );
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  // Calculate category breakdown for current month
  const categoryData = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    // Find the Transfers and Income category IDs
    const transfersCategory = allCategories.find(
      (cat) => cat.slug === 'transfers',
    );
    const transfersCategoryId = transfersCategory?.id;
    const transfersSubcategoryIds =
      transfersCategory?.subcategories.map((sub) => sub.id) || [];
    const allTransferCategoryIds = transfersCategoryId
      ? [transfersCategoryId, ...transfersSubcategoryIds]
      : [];

    const incomeCategory = allCategories.find((cat) => cat.slug === 'income');
    const incomeCategoryId = incomeCategory?.id;
    const incomeSubcategoryIds =
      incomeCategory?.subcategories.map((sub) => sub.id) || [];
    const allIncomeCategoryIds = incomeCategoryId
      ? [incomeCategoryId, ...incomeSubcategoryIds]
      : [];

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
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);
    const periodLabel = format(now, 'MMMM yyyy');

    // Filter transactions for the current month
    const periodTransactions = allTransactions.filter((tx) => {
      const txDate = startOfDay(parseISO(tx.date.replace(/\//g, '-')));

      // Check date range
      if (isBefore(txDate, startDate) || isAfter(txDate, endDate)) {
        return false;
      }

      // Exclude transfers
      if (tx.categoryId && allTransferCategoryIds.includes(tx.categoryId)) {
        return false;
      }

      // Exclude income
      if (tx.categoryId && allIncomeCategoryIds.includes(tx.categoryId)) {
        return false;
      }

      // Include all transaction types for current month
      return true;
    });

    // Calculate totals by category and subcategory (only expenses based on category)
    const categoryTotals = new Map();
    let currentExpenses = 0;
    let projectedExpenses = 0;

    periodTransactions.forEach((tx) => {
      // All remaining transactions are expenses (we already filtered out income and transfers)
      const expenseAmount = Math.abs(tx.amount);

      const txDate = startOfDay(parseISO(tx.date.replace(/\//g, '-')));
      const isCurrent =
        (isBefore(txDate, today) || isSameDay(txDate, today)) &&
        tx.transactionState ===
          transactionConstants.TransactionStateEnum.COMPLETED;

      if (isCurrent) {
        currentExpenses += expenseAmount;
      }

      // All transactions in current month contribute to projected total
      projectedExpenses += expenseAmount;

      // Find category and subcategory
      const categoryId = tx.categoryId;
      if (!categoryId) return;

      // Find which parent category this transaction belongs to
      let parentCategory = null;
      let isSubcategory = false;
      let subcategoryInfo = null;

      for (const cat of allCategories) {
        if (cat.id === categoryId) {
          // This is a parent category
          parentCategory = cat;
          break;
        }
        // Check if it's a subcategory
        const subcat = cat.subcategories.find((s) => s.id === categoryId);
        if (subcat) {
          parentCategory = cat;
          subcategoryInfo = subcat;
          isSubcategory = true;
          break;
        }
      }

      if (!parentCategory) return;

      // Update parent category totals
      if (!categoryTotals.has(parentCategory.id)) {
        categoryTotals.set(parentCategory.id, {
          id: parentCategory.id,
          name: parentCategory.name,
          total: 0,
          current: 0,
          projected: 0,
          count: 0,
          subcategories: new Map(),
        });
      }

      const catData = categoryTotals.get(parentCategory.id);
      catData.projected += expenseAmount;
      catData.count += 1;

      if (isCurrent) {
        catData.current += expenseAmount;
      }

      // If this is a subcategory, also track subcategory totals
      if (isSubcategory && subcategoryInfo) {
        if (!catData.subcategories.has(subcategoryInfo.id)) {
          catData.subcategories.set(subcategoryInfo.id, {
            id: subcategoryInfo.id,
            name: subcategoryInfo.name,
            total: 0,
            current: 0,
            projected: 0,
            count: 0,
          });
        }

        const subcatData = catData.subcategories.get(subcategoryInfo.id);
        subcatData.projected += expenseAmount;
        subcatData.count += 1;

        if (isCurrent) {
          subcatData.current += expenseAmount;
        }
      }
    });

    // Convert to array and sort by projected (highest first)
    const categoryArray = Array.from(categoryTotals.values())
      .map((cat) => ({
        ...cat,
        subcategories: Array.from(cat.subcategories.values()).sort(
          (a, b) => b.projected - a.projected,
        ),
      }))
      .filter((cat) => cat.projected > 0)
      .sort((a, b) => b.projected - a.projected);

    return {
      categories: categoryArray,
      totalExpenses: centsToDollars(projectedExpenses),
      currentExpenses: centsToDollars(currentExpenses),
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
        <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 2 }}>
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

  // Prepare data for pie charts
  const currentPieChartData = categoryData.categories
    .filter((cat) => cat.current > 0)
    .map((cat) => ({
      name: cat.name,
      value: centsToDollars(cat.current),
    }));

  const projectedPieChartData = categoryData.categories.map((cat) => ({
    name: cat.name,
    value: centsToDollars(cat.projected),
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
        <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Spending by Category
        </Typography>
        <Typography variant='body2' color='text.secondary'>
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
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            Current
          </Typography>
          <Typography
            variant='h5'
            sx={{ color: '#2196f3', fontWeight: 'bold' }}
          >
            {formatCurrency(categoryData.currentExpenses)}
          </Typography>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            minWidth: 150,
            p: 2,
            backgroundColor: '#f3e5f5',
            border: '1px solid #9c27b0',
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            Projected
          </Typography>
          <Typography
            variant='h5'
            sx={{ color: '#9c27b0', fontWeight: 'bold' }}
          >
            {formatCurrency(categoryData.projectedExpenses)}
          </Typography>
        </Paper>
      </Box>
      {/* Charts Section */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mb: 3,
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Current Spending Pie Chart */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
            minWidth: 300,
            width: '100%',
            position: 'relative',
          }}
        >
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
          >
            Current Spending
          </Typography>
          {currentPieChartData.length > 0 ? (
            <Box sx={{ height: 300, position: 'relative' }}>
              <Pie
                data={{
                  labels: currentPieChartData.map((item) => item.name),
                  datasets: [
                    {
                      data: currentPieChartData.map((item) => item.value),
                      backgroundColor: COLORS,
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
                      display: true,
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const value = context.parsed || 0;
                          return formatCurrency(value);
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant='body2'>No current expenses</Typography>
            </Box>
          )}
        </Box>

        {/* Projected Spending Pie Chart */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
            minWidth: 300,
            width: '100%',
            position: 'relative',
          }}
        >
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
          >
            Projected Spending
          </Typography>
          <Box sx={{ height: 300, position: 'relative' }}>
            <Pie
              data={{
                labels: projectedPieChartData.map((item) => item.name),
                datasets: [
                  {
                    data: projectedPieChartData.map((item) => item.value),
                    backgroundColor: COLORS,
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
                    display: true,
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const value = context.parsed || 0;
                        return formatCurrency(value);
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>
      {/* Chart and Table */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Category Table */}
        <Box sx={{ flex: 1 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  Current
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  Projected
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryData.categories.map((cat, index) => {
                const percentage =
                  categoryData.projectedExpenses > 0
                    ? (centsToDollars(cat.projected) /
                        categoryData.projectedExpenses) *
                      100
                    : 0;
                const isExpanded = expandedCategoryId === cat.id;
                const hasSubcategories =
                  cat.subcategories && cat.subcategories.length > 0;

                return (
                  <React.Fragment key={cat.id}>
                    <TableRow
                      onClick={() =>
                        hasSubcategories &&
                        setExpandedCategoryId(isExpanded ? null : cat.id)
                      }
                      sx={{
                        cursor: hasSubcategories ? 'pointer' : 'default',
                        '&:hover': hasSubcategories
                          ? { backgroundColor: '#f5f5f5' }
                          : undefined,
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {hasSubcategories && (
                            <IconButton size='small' sx={{ p: 0 }}>
                              {isExpanded ? (
                                <KeyboardArrowDownIcon fontSize='small' />
                              ) : (
                                <KeyboardArrowRightIcon fontSize='small' />
                              )}
                            </IconButton>
                          )}
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: COLORS[index % COLORS.length],
                              ml: hasSubcategories ? 0 : 3,
                            }}
                          />
                          {cat.name}
                        </Box>
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ color: '#2196f3', fontWeight: 500 }}
                      >
                        {formatCurrency(centsToDollars(cat.current))}
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ color: '#9c27b0', fontWeight: 500 }}
                      >
                        {formatCurrency(centsToDollars(cat.projected))}
                      </TableCell>
                      <TableCell align='right' sx={{ color: 'text.secondary' }}>
                        {percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>

                    {/* Subcategories */}
                    {hasSubcategories &&
                      isExpanded &&
                      cat.subcategories.map((subcat) => {
                        const subcatPercentage =
                          cat.projected > 0
                            ? (centsToDollars(subcat.projected) /
                                centsToDollars(cat.projected)) *
                              100
                            : 0;
                        return (
                          <TableRow
                            key={subcat.id}
                            sx={{ backgroundColor: '#fafafa' }}
                          >
                            <TableCell sx={{ pl: 8 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                    opacity: 0.6,
                                  }}
                                />
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  {subcat.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: '#2196f3',
                                fontWeight: 400,
                                fontSize: '0.875rem',
                              }}
                            >
                              {formatCurrency(centsToDollars(subcat.current))}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: '#9c27b0',
                                fontWeight: 400,
                                fontSize: '0.875rem',
                              }}
                            >
                              {formatCurrency(centsToDollars(subcat.projected))}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                              }}
                            >
                              {subcatPercentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Paper>
  );
}
