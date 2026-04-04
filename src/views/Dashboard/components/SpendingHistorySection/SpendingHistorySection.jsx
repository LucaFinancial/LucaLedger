import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { add } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from 'chart.js';
import { useSelector } from 'react-redux';

import SpendingPeriodControls from '@/components/SpendingPeriodControls';
import { selectors as categorySelectors } from '@/store/categories';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as settingsSelectors } from '@/store/settings';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { selectors as transactionSelectors } from '@/store/transactions';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import {
  buildSpendingSelectionFromDropdownValues,
  SPENDING_STATE_META,
  SPENDING_STATE_ORDER,
  buildAvailableSpendingPeriods,
  buildDashboardSpendingHistoryData,
  getSpendingSelectionDropdownValues,
  getSpendingPeriodConfig,
} from '@/utils/spendingAnalytics';

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

const DEFAULT_SELECTION = { type: 'aggregate', value: 'last-3-months' };

function formatCurrency(amount) {
  const safeAmount =
    amount == null || Number.isNaN(amount) ? 0 : amount;

  return `$${doublePrecisionFormatString(safeAmount)}`;
}

function renderStateCells(item) {
  return (
    <>
      {SPENDING_STATE_ORDER.map((stateKey) => (
        <TableCell
          key={`${item.id}-${stateKey}`}
          align='right'
          sx={{
            color: SPENDING_STATE_META[stateKey].color,
            fontWeight: 500,
          }}
        >
          {formatCurrency(centsToDollars(item[stateKey]))}
        </TableCell>
      ))}
      <TableCell align='right' sx={{ color: '#212121', fontWeight: 600 }}>
        {formatCurrency(centsToDollars(item.total))}
      </TableCell>
      <TableCell align='right' sx={{ color: '#2196f3', fontWeight: 500 }}>
        {formatCurrency(centsToDollars(item.monthlyAvg))}
      </TableCell>
      <TableCell align='right' sx={{ color: 'text.secondary' }}>
        {item.count}
      </TableCell>
    </>
  );
}

function renderHistoricalCells(item) {
  return (
    <>
      <TableCell align='right' sx={{ color: '#9c27b0', fontWeight: 500 }}>
        {formatCurrency(centsToDollars(item.total))}
      </TableCell>
      <TableCell align='right' sx={{ color: '#2196f3', fontWeight: 500 }}>
        {formatCurrency(centsToDollars(item.monthlyAvg))}
      </TableCell>
      <TableCell align='right' sx={{ color: 'text.secondary' }}>
        {item.percentage.toFixed(1)}%
      </TableCell>
      <TableCell align='right' sx={{ color: 'text.secondary' }}>
        {item.count}
      </TableCell>
    </>
  );
}

export default function SpendingHistorySection() {
  const [activeSelection, setActiveSelection] = useState(DEFAULT_SELECTION);
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const categories = useSelector(categorySelectors.selectAllCategories);
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactions,
  );
  const realizedDatesMap = useSelector(
    recurringTransactionEventSelectors.selectAllRealizedDatesMap,
  );
  const recurringProjection = useSelector(
    settingsSelectors.selectRecurringProjection,
  );

  const projectionEndDate = useMemo(
    () =>
      add(new Date(), {
        [recurringProjection.unit]: recurringProjection.amount,
      }),
    [recurringProjection],
  );

  const spendingCategoryFilter = useMemo(() => {
    const categoriesById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const excludedCategoryIds = new Set();

    categories.forEach((category) => {
      if (category.slug === 'income' || category.slug === 'transfers') {
        excludedCategoryIds.add(category.id);
        return;
      }

      if (!category.parentId) return;

      const parentCategory = categoriesById.get(category.parentId);
      if (
        parentCategory?.slug === 'income' ||
        parentCategory?.slug === 'transfers'
      ) {
        excludedCategoryIds.add(category.id);
      }
    });

    return (categoryId) =>
      Boolean(categoryId) && !excludedCategoryIds.has(categoryId);
  }, [categories]);

  const { availableMonths, availableYears } = useMemo(
    () =>
      buildAvailableSpendingPeriods({
        allTransactions,
        transactionSplits,
        recurringTransactions,
        realizedDatesMap,
        projectionEndDate,
        categoryIdFilter: spendingCategoryFilter,
      }),
    [
      allTransactions,
      transactionSplits,
      recurringTransactions,
      realizedDatesMap,
      projectionEndDate,
      spendingCategoryFilter,
    ],
  );
  const dropdownValues = useMemo(
    () => getSpendingSelectionDropdownValues(activeSelection),
    [activeSelection],
  );

  const periodConfig = useMemo(
    () =>
      getSpendingPeriodConfig(activeSelection, {
        availableMonths,
        availableYears,
      }),
    [activeSelection, availableMonths, availableYears],
  );

  const {
    categories: categoryData,
    totalExpenses,
    monthlyAvgExpenses,
    totalTransactions,
    showStateBreakdown,
    stateTotals,
  } = useMemo(
    () =>
      buildDashboardSpendingHistoryData({
        allTransactions,
        transactionSplits,
        categories,
        recurringTransactions,
        realizedDatesMap,
        periodConfig,
      }),
    [
      allTransactions,
      transactionSplits,
      categories,
      recurringTransactions,
      realizedDatesMap,
      periodConfig,
    ],
  );

  const pieData = useMemo(
    () =>
      categoryData.map((category) => ({
        name: category.name,
        value: centsToDollars(category.total),
      })),
    [categoryData],
  );

  const resetExpandedState = () => setExpandedCategoryId(null);
  const clearCustomRange = () =>
    setCustomRange({
      startDate: null,
      endDate: null,
    });

  const handleAggregateChange = (_event, newValue) => {
    if (!newValue) return;

    clearCustomRange();
    setActiveSelection({ type: 'aggregate', value: newValue });
    resetExpandedState();
  };

  const handleMonthChange = (event) => {
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: event.target.value,
          year: dropdownValues.year,
        },
        DEFAULT_SELECTION,
      ),
    );
    resetExpandedState();
  };

  const handleYearChange = (event) => {
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: dropdownValues.month,
          year: event.target.value,
        },
        DEFAULT_SELECTION,
      ),
    );
    resetExpandedState();
  };

  const updateCustomRange = (nextRange) => {
    setCustomRange(nextRange);

    if (!nextRange.startDate || !nextRange.endDate) return;

    setActiveSelection({
      type: 'custom',
      startDate: nextRange.startDate,
      endDate: nextRange.endDate,
    });
    resetExpandedState();
  };

  const handleCustomStartChange = (value) => {
    updateCustomRange({
      ...customRange,
      startDate: value,
    });
  };

  const handleCustomEndChange = (value) => {
    updateCustomRange({
      ...customRange,
      endDate: value,
    });
  };

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
        <SpendingPeriodControls
          activeSelection={activeSelection}
          availableYears={availableYears}
          customRange={customRange}
          onAggregateChange={handleAggregateChange}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onCustomStartChange={handleCustomStartChange}
          onCustomEndChange={handleCustomEndChange}
          sx={{ mb: 3 }}
        />

        {categoryData.length === 0 ? (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ py: 3, textAlign: 'center' }}
          >
            No spending found for {periodConfig.label}
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              {showStateBreakdown ? (
                <>
                  {SPENDING_STATE_ORDER.map((stateKey) => (
                    <Paper
                      key={stateKey}
                      sx={{
                        flex: 1,
                        minWidth: 140,
                        p: 2,
                        backgroundColor: SPENDING_STATE_META[stateKey].backgroundColor,
                        border: `1px solid ${SPENDING_STATE_META[stateKey].borderColor}`,
                      }}
                    >
                      <Typography variant='caption' color='text.secondary'>
                        {SPENDING_STATE_META[stateKey].label}
                      </Typography>
                      <Typography
                        variant='h5'
                        sx={{
                          color: SPENDING_STATE_META[stateKey].color,
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(centsToDollars(stateTotals[stateKey]))}
                      </Typography>
                    </Paper>
                  ))}

                  <Paper
                    sx={{
                      flex: 1,
                      minWidth: 140,
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #bdbdbd',
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      Total
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        color: '#212121',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(centsToDollars(totalExpenses))}
                    </Typography>
                  </Paper>
                </>
              ) : (
                <>
                  <Paper
                    sx={{
                      flex: 1,
                      minWidth: 180,
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
                    <Typography variant='body2' color='text.secondary'>
                      {totalTransactions} transactions
                    </Typography>
                  </Paper>

                  <Paper
                    sx={{
                      flex: 1,
                      minWidth: 180,
                      p: 2,
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #2196f3',
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      Monthly Avg
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{ color: '#2196f3', fontWeight: 'bold' }}
                    >
                      {formatCurrency(centsToDollars(monthlyAvgExpenses))}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: 'flex-start',
              }}
            >
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
                      labels: pieData.map((item) => item.name),
                      datasets: [
                        {
                          data: pieData.map((item) => item.value),
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
                            label: (context) =>
                              formatCurrency(context.parsed ?? 0),
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      {showStateBreakdown ? (
                        <>
                          {SPENDING_STATE_ORDER.map((stateKey) => (
                            <TableCell
                              key={stateKey}
                              align='right'
                              sx={{ fontWeight: 700 }}
                            >
                              {SPENDING_STATE_META[stateKey].label}
                            </TableCell>
                          ))}
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Total
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Monthly Avg
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Txns
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Total
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Monthly Avg
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            % of Total
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700 }}>
                            Txns
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData.map((category, index) => {
                      const isExpanded = expandedCategoryId === category.id;
                      const hasSubcategories = category.subcategories.length > 0;

                      return (
                        <React.Fragment key={category.id}>
                          <TableRow
                            onClick={() =>
                              hasSubcategories &&
                              setExpandedCategoryId(
                                isExpanded ? null : category.id,
                              )
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
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
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
                                    flexShrink: 0,
                                  }}
                                />
                                {category.name}
                              </Box>
                            </TableCell>

                            {showStateBreakdown
                              ? renderStateCells(category)
                              : renderHistoricalCells(category)}
                          </TableRow>

                          {hasSubcategories &&
                            isExpanded &&
                            category.subcategories.map((subcategory) => (
                              <TableRow
                                key={subcategory.id}
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
                                      {subcategory.name}
                                    </Typography>
                                  </Box>
                                </TableCell>

                                {showStateBreakdown ? (
                                  <>
                                    {SPENDING_STATE_ORDER.map((stateKey) => (
                                      <TableCell
                                        key={`${subcategory.id}-${stateKey}`}
                                        align='right'
                                        sx={{
                                          color: SPENDING_STATE_META[stateKey].color,
                                          fontSize: '0.875rem',
                                        }}
                                      >
                                        {formatCurrency(
                                          centsToDollars(subcategory[stateKey]),
                                        )}
                                      </TableCell>
                                    ))}
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: '#212121',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {formatCurrency(
                                        centsToDollars(subcategory.total),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: '#2196f3',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {formatCurrency(
                                        centsToDollars(subcategory.monthlyAvg),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {subcategory.count}
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: '#9c27b0',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {formatCurrency(
                                        centsToDollars(subcategory.total),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: '#2196f3',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {formatCurrency(
                                        centsToDollars(subcategory.monthlyAvg),
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {subcategory.percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell
                                      align='right'
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {subcategory.count}
                                    </TableCell>
                                  </>
                                )}
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
