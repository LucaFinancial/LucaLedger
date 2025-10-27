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
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
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

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 4,
          mb: 3,
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

      {/* Subcategory Breakdown */}
      {subcategoryTotals.length > 0 &&
        subcategoryTotals.some((s) => s.count > 0) && (
          <Box sx={{ mt: 2 }}>
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
