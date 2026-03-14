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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  subDays,
  differenceInCalendarMonths,
  format,
  parse,
  parseISO,
} from 'date-fns';
import {
  selectors as transactionSelectors,
  constants as transactionConstants,
} from '@/store/transactions';
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

const AGGREGATE_PERIODS = [
  { key: 'last-3-months', label: '3 Months' },
  { key: 'ytd', label: 'YTD' },
  { key: 'last-12-months', label: '12 Months' },
];

function getAggregatePeriodConfig(key) {
  const now = new Date();
  switch (key) {
    case 'last-3-months': {
      return {
        startDate: startOfMonth(subMonths(now, 3)),
        endDate: endOfMonth(subMonths(now, 1)),
        numMonths: 3,
        label: 'Last 3 Months',
      };
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
      return {
        startDate: startOfMonth(subMonths(now, 12)),
        endDate: endOfMonth(subMonths(now, 1)),
        numMonths: 12,
        label: 'Last 12 Months',
      };
    }
    default:
      return getAggregatePeriodConfig('last-3-months');
  }
}

function formatCurrency(amount) {
  const safe = isNaN(amount) || amount == null ? 0 : amount;
  return `$${doublePrecisionFormatString(safe)}`;
}

// activeSelection shape: { type: 'aggregate'|'month'|'year', value: string|number }
const DEFAULT_SELECTION = { type: 'aggregate', value: 'last-3-months' };

export default function SpendingHistorySection() {
  const [activeSelection, setActiveSelection] = useState(DEFAULT_SELECTION);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const allCategories = useSelector(categorySelectors.selectCategoriesHierarchical);

  // Compute available months and years from completed expense transactions
  const { availableMonths, availableYears } = useMemo(() => {
    const transfersCat = allCategories.find((c) => c.slug === 'transfers');
    const incomeCat = allCategories.find((c) => c.slug === 'income');
    const excludeIds = new Set([
      ...(transfersCat
        ? [transfersCat.id, ...transfersCat.subcategories.map((s) => s.id)]
        : []),
      ...(incomeCat
        ? [incomeCat.id, ...incomeCat.subcategories.map((s) => s.id)]
        : []),
    ]);

    const currentMonthStr = format(new Date(), 'yyyy-MM');
    const currentYear = new Date().getFullYear();

    const monthSet = new Set();
    const yearSet = new Set();

    allTransactions.forEach((tx) => {
      if (
        tx.transactionState !==
        transactionConstants.TransactionStateEnum.COMPLETED
      )
        return;
      if (tx.categoryId && excludeIds.has(tx.categoryId)) return;

      try {
        const txDate = parseISO(tx.date.replace(/\//g, '-'));
        const monthStr = format(txDate, 'yyyy-MM');
        const year = txDate.getFullYear();
        if (monthStr !== currentMonthStr) monthSet.add(monthStr);
        if (year !== currentYear) yearSet.add(year);
      } catch {
        // skip malformed dates
      }
    });

    return {
      availableMonths: Array.from(monthSet).sort().reverse(),
      availableYears: Array.from(yearSet).sort().reverse(),
    };
  }, [allTransactions, allCategories]);

  // Derive period config from activeSelection
  const periodConfig = useMemo(() => {
    const { type, value } = activeSelection;
    if (type === 'aggregate') {
      return getAggregatePeriodConfig(value);
    }
    if (type === 'month') {
      const d = parse(value, 'yyyy-MM', new Date());
      return {
        startDate: startOfMonth(d),
        endDate: endOfMonth(d),
        numMonths: 1,
        label: format(d, 'MMMM yyyy'),
      };
    }
    if (type === 'year') {
      const d = new Date(value, 0, 1);
      return {
        startDate: startOfYear(d),
        endDate: endOfYear(d),
        numMonths: 12,
        label: String(value),
      };
    }
    return getAggregatePeriodConfig('last-3-months');
  }, [activeSelection]);

  const { categories, totalExpenses, monthlyAvgExpenses, totalTransactions } =
    useHistoricalCategoryData({
      allTransactions,
      allCategories,
      startDate: periodConfig.startDate,
      endDate: periodConfig.endDate,
      numMonths: periodConfig.numMonths,
    });

  const handleAggregateChange = (_e, newValue) => {
    if (newValue) {
      setActiveSelection({ type: 'aggregate', value: newValue });
      setExpandedCategoryId(null);
    }
  };

  const handleMonthChange = (e) => {
    setActiveSelection({ type: 'month', value: e.target.value });
    setExpandedCategoryId(null);
  };

  const handleYearChange = (e) => {
    setActiveSelection({ type: 'year', value: e.target.value });
    setExpandedCategoryId(null);
  };

  const activeAggregate =
    activeSelection.type === 'aggregate' ? activeSelection.value : null;
  const activeMonth =
    activeSelection.type === 'month' ? activeSelection.value : '';
  const activeYear =
    activeSelection.type === 'year' ? activeSelection.value : '';

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
        {/* Period selectors */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {/* Aggregate period toggles */}
          <ToggleButtonGroup
            value={activeAggregate}
            exclusive
            onChange={handleAggregateChange}
            size='small'
          >
            {AGGREGATE_PERIODS.map((p) => (
              <ToggleButton key={p.key} value={p.key}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Month picker */}
          {availableMonths.length > 0 && (
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={activeMonth}
                label='Month'
                onChange={handleMonthChange}
                displayEmpty
              >
                {availableMonths.map((m) => (
                  <MenuItem key={m} value={m}>
                    {format(parse(m, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Year picker */}
          {availableYears.length > 0 && (
            <FormControl size='small' sx={{ minWidth: 110 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={activeYear}
                label='Year'
                onChange={handleYearChange}
                displayEmpty
              >
                {availableYears.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {categories.length === 0 ? (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ py: 3, textAlign: 'center' }}
          >
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
                <Typography
                  variant='h5'
                  sx={{ color: '#9c27b0', fontWeight: 'bold' }}
                >
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
                <Typography
                  variant='h5'
                  sx={{ color: '#2196f3', fontWeight: 'bold' }}
                >
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
                <Typography
                  variant='h5'
                  sx={{ color: '#4caf50', fontWeight: 'bold' }}
                >
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
                              '&:hover': hasSubs
                                ? { backgroundColor: '#f5f5f5' }
                                : undefined,
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
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
                            <TableCell
                              align='right'
                              sx={{ color: '#9c27b0', fontWeight: 500 }}
                            >
                              {formatCurrency(centsToDollars(cat.total))}
                            </TableCell>
                            {periodConfig.numMonths > 1 && (
                              <TableCell
                                align='right'
                                sx={{ color: '#2196f3', fontWeight: 500 }}
                              >
                                {formatCurrency(centsToDollars(cat.monthlyAvg))}
                              </TableCell>
                            )}
                            <TableCell
                              align='right'
                              sx={{ color: 'text.secondary' }}
                            >
                              {cat.percentage.toFixed(1)}%
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{ color: 'text.secondary' }}
                            >
                              {cat.count}
                            </TableCell>
                          </TableRow>

                          {hasSubs &&
                            isExpanded &&
                            cat.subcategories.map((sub) => (
                              <TableRow
                                key={sub.id}
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
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                    >
                                      {sub.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  align='right'
                                  sx={{
                                    color: '#9c27b0',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {formatCurrency(centsToDollars(sub.total))}
                                </TableCell>
                                {periodConfig.numMonths > 1 && (
                                  <TableCell
                                    align='right'
                                    sx={{
                                      color: '#2196f3',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {formatCurrency(
                                      centsToDollars(sub.monthlyAvg),
                                    )}
                                  </TableCell>
                                )}
                                <TableCell
                                  align='right'
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {sub.percentage.toFixed(1)}%
                                </TableCell>
                                <TableCell
                                  align='right'
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.875rem',
                                  }}
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
