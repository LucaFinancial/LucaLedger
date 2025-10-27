import {
  Box,
  Grid,
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
    // Determine date range based on selected time period
    const now = dayjs();
    let startDate;

    switch (timePeriod) {
      case 'month':
        startDate = now.startOf('month');
        break;
      case 'year':
        startDate = now.startOf('year');
        break;
      case 'all':
      default:
        startDate = null; // No filter
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
      if (startDate && dayjs(transaction.date).isBefore(startDate)) {
        return false;
      }
      return true;
    });

    // Calculate overall totals (amounts are in cents, convert to dollars)
    const totalCents = categoryTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
    const total = centsToDollars(totalCents);
    const count = categoryTransactions.length;

    // Calculate subcategory breakdown
    const subTotals = category.subcategories.map((subcategory) => {
      const subTransactions = categoryTransactions.filter(
        (t) => t.categoryId === subcategory.id
      );
      const subTotalCents = subTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
      return {
        id: subcategory.id,
        name: subcategory.name,
        total: centsToDollars(subTotalCents),
        count: subTransactions.length,
      };
    });

    // Sort subcategories by absolute total (highest spending first)
    subTotals.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    return {
      totals: { total, count },
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

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/* Total Amount */}
        <Grid
          item
          xs={12}
          sm={6}
        >
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Total Amount
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
        </Grid>

        {/* Transaction Count */}
        <Grid
          item
          xs={12}
          sm={6}
        >
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Transactions
            </Typography>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600 }}
            >
              {totals.count}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Subcategory Breakdown */}
      {subcategoryTotals.length > 0 &&
        subcategoryTotals.some((s) => s.count > 0) && (
          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 1, fontWeight: 600 }}
            >
              Subcategory Breakdown
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Subcategory</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                  <TableCell align='right'>Count</TableCell>
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
                          color: sub.total >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        ${doublePrecisionFormatString(Math.abs(sub.total))}
                      </TableCell>
                      <TableCell align='right'>{sub.count}</TableCell>
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
