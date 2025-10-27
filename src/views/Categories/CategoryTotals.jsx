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
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectors as transactionSelectors } from '@/store/transactions';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
];

/**
 * CategoryTotals component displays transaction totals for a category
 * including all of its subcategories with time period filtering
 */
export default function CategoryTotals({ category }) {
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const [timePeriod, setTimePeriod] = useState('month');

  // Calculate totals for this category and all its subcategories
  const { totals, subcategoryTotals } = useMemo(() => {
    const now = dayjs();
    const today = now.startOf('day');

    // Determine date range based on selected time period
    let startDate;
    let endDate;

    switch (timePeriod) {
      case 'month':
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        break;
      case 'year':
        startDate = now.startOf('year');
        endDate = now.endOf('year');
        break;
      case 'all':
      default:
        startDate = null;
        endDate = null;
        break;
    }

    // Build a set of category IDs to match (parent + all subcategories)
    const categoryIds = new Set([
      category.id,
      ...category.subcategories.map((sub) => sub.id),
    ]);

    // Filter transactions by category and date range
    const categoryTransactions = allTransactions.filter((transaction) => {
      if (!categoryIds.has(transaction.categoryId)) return false;

      // For date filtering, only include transactions within the time period
      if (startDate && endDate) {
        const transactionDate = dayjs(transaction.date);
        if (
          transactionDate.isBefore(startDate, 'day') ||
          transactionDate.isAfter(endDate, 'day')
        ) {
          return false;
        }
      }

      return true;
    });

    // Split transactions into past and future
    const pastTransactions = categoryTransactions.filter((t) => {
      const transactionDate = dayjs(t.date).startOf('day');
      return transactionDate.isBefore(today) || transactionDate.isSame(today);
    });
    const futureTransactions = categoryTransactions.filter((t) => {
      const transactionDate = dayjs(t.date).startOf('day');
      return transactionDate.isAfter(today);
    });

    // Calculate totals
    const pastTotal = centsToDollars(
      pastTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    );
    const futureTotal = centsToDollars(
      futureTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    );
    const total = pastTotal + futureTotal;
    const count = categoryTransactions.length;

    // Calculate subcategory breakdown
    const subTotals = category.subcategories.map((subcategory) => {
      const subTransactions = categoryTransactions.filter(
        (t) => t.categoryId === subcategory.id
      );
      const subPastTransactions = subTransactions.filter((t) => {
        const transactionDate = dayjs(t.date).startOf('day');
        return transactionDate.isBefore(today) || transactionDate.isSame(today);
      });
      const subFutureTransactions = subTransactions.filter((t) => {
        const transactionDate = dayjs(t.date).startOf('day');
        return transactionDate.isAfter(today);
      });

      const pastTotal = centsToDollars(
        subPastTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
      );
      const futureTotal = centsToDollars(
        subFutureTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
      );

      return {
        id: subcategory.id,
        name: subcategory.name,
        pastTotal,
        futureTotal,
        total: pastTotal + futureTotal,
        count: subTransactions.length,
      };
    });

    // Sort subcategories by absolute total (highest spending first)
    subTotals.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    return {
      totals: { pastTotal, futureTotal, total, count },
      subcategoryTotals: subTotals,
    };
  }, [allTransactions, category, timePeriod]);

  const handleTimePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  // If no transactions, show a message
  if (totals.count === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: 'rgba(158, 158, 158, 0.08)',
          border: '1px solid rgba(158, 158, 158, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 600 }}
          >
            Category Totals
          </Typography>
          <ToggleButtonGroup
            value={timePeriod}
            exclusive
            onChange={handleTimePeriodChange}
            size='small'
          >
            <ToggleButton value='month'>This Month</ToggleButton>
            <ToggleButton value='year'>This Year</ToggleButton>
            <ToggleButton value='all'>All Time</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontStyle: 'italic' }}
        >
          No transactions found for this category in the selected time period
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        position: 'relative',
      }}
    >
      {/* Header with title and time period toggle - overlays the chart */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{ fontWeight: 600 }}
        >
          Category Totals
        </Typography>
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={handleTimePeriodChange}
          size='small'
        >
          <ToggleButton value='month'>This Month</ToggleButton>
          <ToggleButton value='year'>This Year</ToggleButton>
          <ToggleButton value='all'>All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Chart and Summary Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          px: 2,
          pb: 1,
          alignItems: 'center',
          mt: -5,
        }}
      >
        {/* Pie Chart */}
        <Box
          sx={{
            flex: 5,
            height: 220,
            p: 1,
          }}
        >
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <PieChart>
              <Pie
                data={subcategoryTotals
                  .filter((sub) => sub.count > 0)
                  .map((sub) => ({
                    name: sub.name,
                    value: Math.abs(sub.total),
                  }))}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={70}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {subcategoryTotals
                  .filter((sub) => sub.count > 0)
                  .map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `$${doublePrecisionFormatString(Number(value))}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Past/Future/Total Summary */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 4,
            flex: 1,
          }}
        >
          {/* Past Amount */}
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Past
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: totals.pastTotal >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              ${doublePrecisionFormatString(Math.abs(totals.pastTotal))}
            </Typography>
          </Box>

          {/* Future Amount */}
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Future
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: totals.futureTotal >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              ${doublePrecisionFormatString(Math.abs(totals.futureTotal))}
            </Typography>
          </Box>

          {/* Total Amount */}
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Total
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: totals.total >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              ${doublePrecisionFormatString(Math.abs(totals.total))}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Subcategory Breakdown */}
      {subcategoryTotals.length > 0 &&
        subcategoryTotals.some((s) => s.count > 0) && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontWeight: 700 }}
                  >
                    Past
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontWeight: 700 }}
                  >
                    Future
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontWeight: 700 }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subcategoryTotals
                  .filter((sub) => sub.count > 0)
                  .map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          color:
                            sub.pastTotal >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        ${doublePrecisionFormatString(Math.abs(sub.pastTotal))}
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          color:
                            sub.futureTotal >= 0
                              ? 'success.main'
                              : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        $
                        {doublePrecisionFormatString(Math.abs(sub.futureTotal))}
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          color: sub.total >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}
                      >
                        ${doublePrecisionFormatString(Math.abs(sub.total))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>
        )}
    </Paper>
  );
}

CategoryTotals.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    subcategories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};
