import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useSelector } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  subMonths,
  subYears,
  subDays,
  differenceInCalendarMonths,
  format,
} from 'date-fns';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import { useHistoricalCategoryData } from '../../hooks/useHistoricalCategoryData';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#00bcd4',
  '#ffeb3b',
  '#795548',
  '#607d8b',
  '#e91e63',
  '#3f51b5',
  '#009688',
  '#cddc39',
  '#ff5722',
  '#673ab7',
];

const PERIODS = [
  { key: 'last-month', label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'ytd', label: 'YTD' },
  { key: 'last-12-months', label: 'Last 12 Months' },
  { key: 'last-year', label: 'Last Year' },
];

function getPeriodDates(periodKey) {
  const now = new Date();
  switch (periodKey) {
    case 'last-month': {
      const d = subMonths(now, 1);
      return {
        startDate: startOfMonth(d),
        endDate: endOfMonth(d),
        numMonths: 1,
        label: format(d, 'MMMM yyyy'),
      };
    }
    case 'last-3-months': {
      const start = startOfMonth(subMonths(now, 3));
      const end = endOfMonth(subMonths(now, 1));
      return { startDate: start, endDate: end, numMonths: 3, label: 'Last 3 Months' };
    }
    case 'ytd': {
      const start = startOfYear(now);
      const end = startOfDay(subDays(now, 1));
      const completedMonths = Math.max(
        1,
        differenceInCalendarMonths(startOfDay(now), start),
      );
      return {
        startDate: start,
        endDate: end,
        numMonths: completedMonths,
        label: `YTD (${format(now, 'yyyy')})`,
      };
    }
    case 'last-12-months': {
      const start = startOfMonth(subMonths(now, 12));
      const end = endOfMonth(subMonths(now, 1));
      return { startDate: start, endDate: end, numMonths: 12, label: 'Last 12 Months' };
    }
    case 'last-year': {
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
        numMonths: 12,
        label: format(lastYear, 'yyyy'),
      };
    }
    default:
      return getPeriodDates('last-month');
  }
}

function formatCurrency(amount) {
  const safe = isNaN(amount) || amount == null ? 0 : amount;
  return `$${doublePrecisionFormatString(safe)}`;
}

export default function SpendingHistorySection() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const allCategories = useSelector(categorySelectors.selectCategoriesHierarchical);

  const periodConfig = useMemo(() => getPeriodDates(selectedPeriod), [selectedPeriod]);

  const { categories, totalExpenses, monthlyAvgExpenses, totalTransactions } =
    useHistoricalCategoryData({
      allTransactions,
      allCategories,
      startDate: periodConfig.startDate,
      endDate: periodConfig.endDate,
      numMonths: periodConfig.numMonths,
    });

  const handlePeriodChange = (_e, newPeriod) => {
    if (newPeriod) {
      setSelectedPeriod(newPeriod);
      setExpandedCategoryId(null);
    }
  };

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: centsToDollars(cat.total),
  }));

  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        mb: 3,
        borderLeft: '4px solid #9c27b0',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            Spending History
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {periodConfig.label}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {/* Period selector */}
        <ToggleButtonGroup
          value={selectedPeriod}
          exclusive
          onChange={handlePeriodChange}
          size='small'
          sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p.key} value={p.key}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {categories.length === 0 ? (
          <Typography variant='body1' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
            No expenses found for {periodConfig.label}
          </Typography>
        ) : (
          <>
            {/* Summary cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Paper
                sx={{
                  flex: 1,
                  minWidth: 140,
                  p: 2,
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #9c27b0',
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  Total Spent
                </Typography>
                <Typography variant='h5' sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                  {formatCurrency(centsToDollars(totalExpenses))}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  flex: 1,
                  minWidth: 140,
                  p: 2,
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  Monthly Average
                </Typography>
                <Typography variant='h5' sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                  {formatCurrency(centsToDollars(monthlyAvgExpenses))}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  flex: 1,
                  minWidth: 140,
                  p: 2,
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #4caf50',
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  Transactions
                </Typography>
                <Typography variant='h5' sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {totalTransactions}
                </Typography>
              </Paper>

              {periodConfig.numMonths > 1 && categories[0] && (
                <Paper
                  sx={{
                    flex: 1,
                    minWidth: 140,
                    p: 2,
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ff9800',
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    Top Category
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{ color: '#ff9800', fontWeight: 'bold', lineHeight: 1.2 }}
                  >
                    {categories[0].name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {formatCurrency(centsToDollars(categories[0].total))}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Pie chart + table */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: 'flex-start',
              }}
            >
              {/* Pie chart */}
              <Box sx={{ flex: '0 0 320px', minWidth: 280 }}>
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
                >
                  Spending by Category
                </Typography>
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Pie
                    data={{
                      labels: pieData.map((d) => d.name),
                      datasets: [
                        {
                          data: pieData.map((d) => d.value),
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
                        legend: { display: true, position: 'bottom' },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => formatCurrency(ctx.parsed ?? 0),
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Category table */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700 }}>
                        Total
                      </TableCell>
                      {periodConfig.numMonths > 1 && (
                        <TableCell align='right' sx={{ fontWeight: 700 }}>
                          Mo. Avg
                        </TableCell>
                      )}
                      <TableCell align='right' sx={{ fontWeight: 700 }}>
                        % of Total
                      </TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700 }}>
                        Txns
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((cat, index) => {
                      const isExpanded = expandedCategoryId === cat.id;
                      const hasSubs = cat.subcategories.length > 0;
                      return (
                        <React.Fragment key={cat.id}>
                          <TableRow
                            onClick={() =>
                              hasSubs &&
                              setExpandedCategoryId(isExpanded ? null : cat.id)
                            }
                            sx={{
                              cursor: hasSubs ? 'pointer' : 'default',
                              '&:hover': hasSubs ? { backgroundColor: '#f5f5f5' } : undefined,
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {hasSubs && (
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
                                    ml: hasSubs ? 0 : 3,
                                    flexShrink: 0,
                                  }}
                                />
                                {cat.name}
                              </Box>
                            </TableCell>
                            <TableCell align='right' sx={{ color: '#9c27b0', fontWeight: 500 }}>
                              {formatCurrency(centsToDollars(cat.total))}
                            </TableCell>
                            {periodConfig.numMonths > 1 && (
                              <TableCell align='right' sx={{ color: '#2196f3', fontWeight: 500 }}>
                                {formatCurrency(centsToDollars(cat.monthlyAvg))}
                              </TableCell>
                            )}
                            <TableCell align='right' sx={{ color: 'text.secondary' }}>
                              {cat.percentage.toFixed(1)}%
                            </TableCell>
                            <TableCell align='right' sx={{ color: 'text.secondary' }}>
                              {cat.count}
                            </TableCell>
                          </TableRow>

                          {hasSubs &&
                            isExpanded &&
                            cat.subcategories.map((sub) => (
                              <TableRow key={sub.id} sx={{ backgroundColor: '#fafafa' }}>
                                <TableCell sx={{ pl: 8 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: COLORS[index % COLORS.length],
                                        opacity: 0.6,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography variant='body2' color='text.secondary'>
                                      {sub.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  align='right'
                                  sx={{ color: '#9c27b0', fontSize: '0.875rem' }}
                                >
                                  {formatCurrency(centsToDollars(sub.total))}
                                </TableCell>
                                {periodConfig.numMonths > 1 && (
                                  <TableCell
                                    align='right'
                                    sx={{ color: '#2196f3', fontSize: '0.875rem' }}
                                  >
                                    {formatCurrency(centsToDollars(sub.monthlyAvg))}
                                  </TableCell>
                                )}
                                <TableCell
                                  align='right'
                                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                                >
                                  {sub.percentage.toFixed(1)}%
                                </TableCell>
                                <TableCell
                                  align='right'
                                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                                >
                                  {sub.count}
                                </TableCell>
                              </TableRow>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
