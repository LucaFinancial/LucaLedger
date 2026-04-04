import {
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Fragment, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { add, format, parseISO } from 'date-fns';

import RecurringTransactionModal from '@/components/RecurringTransactionModal';
import SplitEditorModal from '@/components/SplitEditorModal';
import SpendingPeriodControls from '@/components/SpendingPeriodControls';
import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import {
  actions as recurringTransactionActions,
  selectors as recurringTransactionSelectors,
} from '@/store/recurringTransactions';
import { selectors as settingsSelectors } from '@/store/settings';
import {
  actions as transactionSplitActions,
  selectors as transactionSplitSelectors,
} from '@/store/transactionSplits';
import {
  actions as transactionActions,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import {
  buildSpendingSelectionFromDropdownValues,
  SPENDING_STATE_META,
  SPENDING_STATE_ORDER,
  buildAvailableSpendingPeriods,
  buildCategoryTotalsData,
  getAggregatePeriodConfig,
  getSpendingSelectionDropdownValues,
  getSpendingPeriodConfig,
} from '@/utils/spendingAnalytics';

const AGGREGATE_RANGES_WITH_VISIBLE_DATES = new Set([
  'last-3-months',
  'ytd',
  'last-12-months',
]);

function formatAmount(amountInCents) {
  return `$${doublePrecisionFormatString(
    Math.abs(centsToDollars(amountInCents)),
  )}`;
}

function formatTransactionDate(dateValue) {
  if (!dateValue) return '--';

  try {
    return format(parseISO(String(dateValue).replace(/\//g, '-')), 'MMM d, yyyy');
  } catch {
    return String(dateValue);
  }
}

export default function CategoryTotals({ category }) {
  const defaultSelection = {
    type: 'aggregate',
    value: 'current-month',
  };
  const dispatch = useDispatch();
  const accounts = useSelector(accountSelectors.selectAccounts);
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

  const [activeSelection, setActiveSelection] = useState(defaultSelection);
  const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState([]);
  const [customRange, setCustomRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedRecurringTransactionId, setSelectedRecurringTransactionId] =
    useState(null);

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
  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const transactionsById = useMemo(
    () =>
      new Map(
        allTransactions.map((transaction) => [transaction.id, transaction]),
      ),
    [allTransactions],
  );
  const recurringTransactionsById = useMemo(
    () =>
      new Map(
        recurringTransactions.map((transaction) => [transaction.id, transaction]),
      ),
    [recurringTransactions],
  );
  const selectedTransaction = selectedTransactionId
    ? transactionsById.get(selectedTransactionId) || null
    : null;
  const selectedRecurringTransaction = selectedRecurringTransactionId
    ? recurringTransactionsById.get(selectedRecurringTransactionId) || null
    : null;

  const { totals, subcategoryTotals, showStateBreakdown } = useMemo(
    () =>
      buildCategoryTotalsData({
        category,
        allTransactions,
        transactionSplits,
        recurringTransactions,
        realizedDatesMap,
        periodConfig,
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
  const clearExpandedSubcategories = () => setExpandedSubcategoryIds([]);
  const clearCustomRange = () =>
    setCustomRange({
      startDate: null,
      endDate: null,
    });
  const syncCustomRangeForAggregate = (aggregateKey) => {
    if (!AGGREGATE_RANGES_WITH_VISIBLE_DATES.has(aggregateKey)) {
      clearCustomRange();
      return;
    }

    const aggregateConfig = getAggregatePeriodConfig(aggregateKey);
    setCustomRange({
      startDate: aggregateConfig.startDate,
      endDate: aggregateConfig.endDate,
    });
  };

  const handleAggregateChange = (_event, newValue) => {
    if (!newValue) return;

    clearExpandedSubcategories();
    syncCustomRangeForAggregate(newValue);
    setActiveSelection({ type: 'aggregate', value: newValue });
  };

  const handleMonthChange = (event) => {
    clearExpandedSubcategories();
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: event.target.value,
          year: dropdownValues.year,
        },
        defaultSelection,
      ),
    );
  };

  const handleYearChange = (event) => {
    clearExpandedSubcategories();
    clearCustomRange();
    setActiveSelection(
      buildSpendingSelectionFromDropdownValues(
        {
          month: dropdownValues.month,
          year: event.target.value,
        },
        defaultSelection,
      ),
    );
  };

  const updateCustomRange = (nextRange) => {
    setCustomRange(nextRange);

    if (!nextRange.startDate || !nextRange.endDate) return;

    setActiveSelection({
      type: 'custom',
      startDate: nextRange.startDate,
      endDate: nextRange.endDate,
    });
    clearExpandedSubcategories();
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

  const toggleSubcategoryExpanded = (subcategoryId) => {
    setExpandedSubcategoryIds((currentExpandedIds) =>
      currentExpandedIds.includes(subcategoryId)
        ? currentExpandedIds.filter((id) => id !== subcategoryId)
        : [...currentExpandedIds, subcategoryId],
    );
  };

  const handleTransactionDetailClick = (transactionDetail) => {
    if (transactionDetail.sourceType === 'recurring') {
      if (
        transactionDetail.recurringTransactionId &&
        recurringTransactionsById.has(transactionDetail.recurringTransactionId)
      ) {
        setSelectedRecurringTransactionId(
          transactionDetail.recurringTransactionId,
        );
      }
      return;
    }

    if (
      transactionDetail.transactionId &&
      transactionsById.has(transactionDetail.transactionId)
    ) {
      setSelectedTransactionId(transactionDetail.transactionId);
    }
  };

  const handleSplitEditorClose = () => {
    setSelectedTransactionId(null);
  };

  const handleRecurringModalClose = () => {
    setSelectedRecurringTransactionId(null);
  };

  const handleSplitEditorSave = (splits) => {
    if (!selectedTransaction) return;

    const isSingleCategoryAssignment =
      splits.length === 1 &&
      splits[0].amount === Math.abs(selectedTransaction.amount);

    if (isSingleCategoryAssignment) {
      dispatch(
        transactionActions.updateTransactionProperty(
          selectedTransaction.accountId,
          selectedTransaction,
          'categoryId',
          splits[0].categoryId || null,
        ),
      );
      dispatch(
        transactionSplitActions.saveTransactionSplits(selectedTransaction.id, []),
      );
    } else {
      dispatch(
        transactionSplitActions.saveTransactionSplits(
          selectedTransaction.id,
          splits,
        ),
      );
    }

    handleSplitEditorClose();
  };

  const handleRecurringModalSave = (transactionData) => {
    if (!selectedRecurringTransaction) return;

    dispatch(
      recurringTransactionActions.updateRecurringTransactionProperty(
        selectedRecurringTransaction.id,
        transactionData,
      ),
    );
    handleRecurringModalClose();
  };

  const detailColSpan = showStateBreakdown ? SPENDING_STATE_ORDER.length + 3 : 3;

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
                    md: 'repeat(5, 136px)',
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
                        color: 'text.primary',
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
                <Paper
                  sx={{
                    p: 0.875,
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
                      color: 'text.primary',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      mt: 0.25,
                      fontSize: '0.9rem',
                    }}
                  >
                    {formatAmount(totals.total)}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  flexWrap: 'wrap',
                }}
              >
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
                      color: 'text.primary',
                      fontWeight: 600,
                      mt: 0.25,
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {formatAmount(totals.total)}
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    width: { xs: '100%', sm: 220 },
                    maxWidth: '100%',
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.72)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                  }}
                >
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1.1 }}
                  >
                    Monthly Avg
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      mt: 0.25,
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {formatAmount(totals.monthlyAvg)}
                  </Typography>
                </Paper>
              </Box>
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
                        <TableCell align='right' sx={{ fontWeight: 700 }}>
                          Monthly Avg
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
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subcategoryTotals.map((subcategory) => (
                    <Fragment key={subcategory.id}>
                      <TableRow
                        onClick={() =>
                          subcategory.transactions.length > 0 &&
                          toggleSubcategoryExpanded(subcategory.id)
                        }
                        sx={{
                          cursor:
                            subcategory.transactions.length > 0
                              ? 'pointer'
                              : 'default',
                          '&:hover':
                            subcategory.transactions.length > 0
                              ? { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                              : undefined,
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                            }}
                          >
                            {subcategory.transactions.length > 0 && (
                              <IconButton size='small' sx={{ p: 0 }}>
                                {expandedSubcategoryIds.includes(subcategory.id) ? (
                                  <KeyboardArrowDownIcon fontSize='small' />
                                ) : (
                                  <KeyboardArrowRightIcon fontSize='small' />
                                )}
                              </IconButton>
                            )}
                            <Typography variant='body2'>
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
                                  color: 'text.primary',
                                  fontWeight: 500,
                                }}
                              >
                                {formatAmount(subcategory[stateKey])}
                              </TableCell>
                            ))}
                            <TableCell
                              align='right'
                              sx={{
                                color: 'text.primary',
                                fontWeight: 600,
                              }}
                            >
                              {formatAmount(subcategory.total)}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                              }}
                            >
                              {formatAmount(subcategory.monthlyAvg)}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell
                              align='right'
                              sx={{
                                color: 'text.primary',
                                fontWeight: 600,
                              }}
                            >
                              {formatAmount(subcategory.total)}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                              }}
                            >
                              {formatAmount(subcategory.monthlyAvg)}
                            </TableCell>
                          </>
                        )}
                      </TableRow>

                      {expandedSubcategoryIds.includes(subcategory.id) && (
                        <TableRow>
                          <TableCell
                            colSpan={detailColSpan}
                            sx={{
                              py: 1.5,
                              px: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.62)',
                            }}
                          >
                            <Table
                              size='small'
                              sx={{
                                '& .MuiTableCell-root': {
                                  px: 1,
                                },
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    Date
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    Account
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    Description
                                  </TableCell>
                                  <TableCell
                                    align='right'
                                    sx={{ fontWeight: 700 }}
                                  >
                                    Amount
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {subcategory.transactions.map((transaction) => {
                                  const isClickable =
                                    transaction.sourceType === 'recurring'
                                      ? recurringTransactionsById.has(
                                          transaction.recurringTransactionId,
                                        )
                                      : transactionsById.has(
                                          transaction.transactionId,
                                        );

                                  return (
                                    <TableRow
                                      key={transaction.id}
                                      hover={isClickable}
                                      onClick={
                                        isClickable
                                          ? () =>
                                              handleTransactionDetailClick(
                                                transaction,
                                              )
                                          : undefined
                                      }
                                      sx={{
                                        cursor: isClickable ? 'pointer' : 'default',
                                        '&:hover': isClickable
                                          ? { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
                                          : undefined,
                                      }}
                                    >
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {formatTransactionDate(transaction.date)}
                                      </TableCell>
                                      <TableCell>
                                        {accountsById.get(transaction.accountId) ||
                                          '--'}
                                      </TableCell>
                                      <TableCell>
                                        {transaction.description || '--'}
                                      </TableCell>
                                      <TableCell
                                        align='right'
                                        sx={{
                                          color: 'text.primary',
                                          fontWeight: 500,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {formatAmount(transaction.amount)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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

      <SplitEditorModal
        open={Boolean(selectedTransaction)}
        onClose={handleSplitEditorClose}
        transaction={selectedTransaction}
        onSave={handleSplitEditorSave}
      />

      <RecurringTransactionModal
        open={Boolean(selectedRecurringTransaction)}
        onClose={handleRecurringModalClose}
        onSave={handleRecurringModalSave}
        transaction={selectedRecurringTransaction}
      />
    </Paper>
  );
}
