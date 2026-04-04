import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { add, format } from 'date-fns';

import SpendingPeriodControls from '@/components/SpendingPeriodControls';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as settingsSelectors } from '@/store/settings';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { selectors as transactionSelectors } from '@/store/transactions';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import {
  SPENDING_STATE_META,
  SPENDING_STATE_ORDER,
  buildAvailableSpendingPeriods,
  buildCategoryTotalsData,
  getSpendingPeriodConfig,
} from '@/utils/spendingAnalytics';

function formatAmount(amountInCents) {
  return `$${doublePrecisionFormatString(
    Math.abs(centsToDollars(amountInCents)),
  )}`;
}

function getAmountColor(amountInCents) {
  return amountInCents >= 0 ? 'success.main' : 'error.main';
}

export default function CategoryTotals({ category }) {
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactions,
  );
  const realizedDatesMap = useSelector(
    recurringTransactionEventSelectors.selectAllRealizedDatesMap,
  );
  const recurringProjection = useSelector(
    settingsSelectors.selectRecurringProjection,
  );

  const currentMonthValue = useMemo(
    () => format(new Date(), 'yyyy-MM'),
    [],
  );
  const [activeSelection, setActiveSelection] = useState({
    type: 'month',
    value: currentMonthValue,
  });
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null,
  });

  const categoryIds = useMemo(
    () =>
      new Set([
        category.id,
        ...category.subcategories.map((subcategory) => subcategory.id),
      ]),
    [category],
  );

  const projectionEndDate = useMemo(
    () =>
      add(new Date(), {
        [recurringProjection.unit]: recurringProjection.amount,
      }),
    [recurringProjection],
  );

  const { availableMonths, availableYears } = useMemo(
    () =>
      buildAvailableSpendingPeriods({
        allTransactions,
        transactionSplits,
        recurringTransactions,
        realizedDatesMap,
        projectionEndDate,
        categoryIdFilter: (categoryId) => categoryIds.has(categoryId),
      }),
    [
      allTransactions,
      transactionSplits,
      recurringTransactions,
      realizedDatesMap,
      projectionEndDate,
      categoryIds,
    ],
  );

  const periodConfig = useMemo(
    () => getSpendingPeriodConfig(activeSelection),
    [activeSelection],
  );

  const { totals, subcategoryTotals, showStateBreakdown } = useMemo(
    () =>
      buildCategoryTotalsData({
        category,
        allTransactions,
        transactionSplits,
        recurringTransactions,
        realizedDatesMap,
        startDate: periodConfig.startDate,
        endDate: periodConfig.endDate,
      }),
    [
      category,
      allTransactions,
      transactionSplits,
      recurringTransactions,
      realizedDatesMap,
      periodConfig,
    ],
  );

  const hasData = totals.count > 0 || subcategoryTotals.length > 0;
  const clearCustomRange = () =>
    setCustomRange({
      startDate: null,
      endDate: null,
    });

  const handleAggregateChange = (_event, newValue) => {
    if (!newValue) return;

    clearCustomRange();
    setActiveSelection({ type: 'aggregate', value: newValue });
  };

  const handleMonthChange = (event) => {
    clearCustomRange();
    setActiveSelection({ type: 'month', value: event.target.value });
  };

  const handleYearChange = (event) => {
    clearCustomRange();
    setActiveSelection({ type: 'year', value: event.target.value });
  };

  const updateCustomRange = (nextRange) => {
    setCustomRange(nextRange);

    if (!nextRange.startDate || !nextRange.endDate) return;

    setActiveSelection({
      type: 'custom',
      startDate: nextRange.startDate,
      endDate: nextRange.endDate,
    });
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
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
      }}
    >
      <Box
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
            Category Totals
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {periodConfig.label}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <DatePicker
            label='Start Date'
            value={customRange.startDate}
            onChange={handleCustomStartChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: { xs: '100%', sm: 210 },
                },
              },
            }}
          />

          <DatePicker
            label='End Date'
            value={customRange.endDate}
            onChange={handleCustomEndChange}
            minDate={customRange.startDate || undefined}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: { xs: '100%', sm: 210 },
                },
              },
            }}
          />
        </Box>
      </Box>

      <SpendingPeriodControls
        activeSelection={activeSelection}
        availableMonths={availableMonths}
        availableYears={availableYears}
        customRange={customRange}
        onAggregateChange={handleAggregateChange}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onCustomStartChange={handleCustomStartChange}
        onCustomEndChange={handleCustomEndChange}
        showDateControls={false}
        sx={{ mb: 2 }}
      />

      {!hasData ? (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontStyle: 'italic' }}
        >
          No transactions found for this category in the selected time period
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: 'inline-block',
              mb: 2.25,
              maxWidth: '100%',
            }}
          >
            {showStateBreakdown ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, 136px)',
                  },
                  gap: 0.75,
                  width: { xs: '100%', md: 'auto' },
                  maxWidth: '100%',
                }}
              >
                {SPENDING_STATE_ORDER.map((stateKey) => (
                  <Paper
                    key={stateKey}
                    sx={{
                      p: 0.875,
                      backgroundColor: SPENDING_STATE_META[stateKey].backgroundColor,
                      border: `1px solid ${SPENDING_STATE_META[stateKey].borderColor}`,
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1.1 }}
                    >
                      {SPENDING_STATE_META[stateKey].label}
                    </Typography>
                    <Typography
                      sx={{
                        color: getAmountColor(totals[stateKey]),
                        fontWeight: 600,
                        lineHeight: 1.2,
                        mt: 0.25,
                        fontSize: '0.9rem',
                      }}
                    >
                      {formatAmount(totals[stateKey])}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper
                sx={{
                  width: { xs: '100%', sm: 220 },
                  maxWidth: '100%',
                  p: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  border: '1px solid rgba(76, 175, 80, 0.25)',
                }}
              >
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1.1 }}
                >
                  Total
                </Typography>
                <Typography
                  sx={{
                    color: getAmountColor(totals.total),
                    fontWeight: 600,
                    mt: 0.25,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  {formatAmount(totals.total)}
                </Typography>
              </Paper>
            )}
          </Box>

          {subcategoryTotals.length > 0 ? (
            <Box sx={{ overflow: 'auto' }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                Subcategory Breakdown
              </Typography>

              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Subcategory</TableCell>
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
                      </>
                    ) : (
                      <TableCell align='right' sx={{ fontWeight: 700 }}>
                        Total
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subcategoryTotals.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell>{subcategory.name}</TableCell>
                      {showStateBreakdown ? (
                        <>
                          {SPENDING_STATE_ORDER.map((stateKey) => (
                            <TableCell
                              key={`${subcategory.id}-${stateKey}`}
                              align='right'
                              sx={{
                                color: getAmountColor(subcategory[stateKey]),
                                fontWeight: 500,
                              }}
                            >
                              {formatAmount(subcategory[stateKey])}
                            </TableCell>
                          ))}
                          <TableCell
                            align='right'
                            sx={{
                              color: getAmountColor(subcategory.total),
                              fontWeight: 600,
                            }}
                          >
                            {formatAmount(subcategory.total)}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell
                          align='right'
                          sx={{
                            color: getAmountColor(subcategory.total),
                            fontWeight: 600,
                          }}
                        >
                          {formatAmount(subcategory.total)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No subcategory activity for this period
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
