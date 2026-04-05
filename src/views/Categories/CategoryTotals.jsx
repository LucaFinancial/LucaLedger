import {
  Button,
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Fragment, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { add, format, parseISO } from 'date-fns';

import SelectedTransactionLinkDialog from '@/components/LinkDialogs/SelectedTransactionLinkDialog';
import LinkedStatusIndicator from '@/components/LinkedIndicators/LinkedStatusIndicator';
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
  actions as transactionLinkActions,
  selectors as transactionLinkSelectors,
} from '@/store/transactionLinks';
import {
  actions as transactionActions,
  selectors as transactionSelectors,
} from '@/store/transactions';
import { TransactionStateEnum } from '@/store/transactions/constants';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import {
  filterRecurringTransactionsByAccountIds,
  filterTransactionsByAccountIds,
  filterTransactionSplitsByTransactionIds,
} from '@/views/Dashboard/utils/dashboardUtils';
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
const LEDGER_STATE_META = Object.freeze({
  completed: {
    backgroundColor: '#e0e0e0',
    borderColor: '#bdbdbd',
    color: '#424242',
  },
  pending: {
    backgroundColor: '#fff9c4',
    borderColor: '#fdd835',
    color: '#f9a825',
  },
  scheduled: {
    backgroundColor: '#b3e5fc',
    borderColor: '#4fc3f7',
    color: '#01579b',
  },
  planned: {
    backgroundColor: '#c8e6c9',
    borderColor: '#81c784',
    color: '#1b5e20',
  },
});
const TOTAL_META = Object.freeze({
  backgroundColor: '#f3e5f5',
  borderColor: '#9c27b0',
  color: '#9c27b0',
});
const MONTHLY_AVG_META = Object.freeze({
  backgroundColor: '#fff3e0',
  borderColor: '#ef6c00',
  color: '#e65100',
});
const RECURRING_TEXT_COLOR = '#9c27b0';

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

function getTransactionDetailTextColor(transactionDetail) {
  if (
    transactionDetail.sourceType === 'recurring' ||
    transactionDetail.transactionState === 'recurring'
  ) {
    return RECURRING_TEXT_COLOR;
  }

  switch (transactionDetail.transactionState) {
    case TransactionStateEnum.COMPLETED:
      return LEDGER_STATE_META.completed.color;
    case TransactionStateEnum.PENDING:
      return LEDGER_STATE_META.pending.color;
    case TransactionStateEnum.SCHEDULED:
      return LEDGER_STATE_META.scheduled.color;
    case TransactionStateEnum.PLANNED:
      return LEDGER_STATE_META.planned.color;
    default:
      return 'inherit';
  }
}

function getTransactionDetailSortValue(transactionDetail) {
  if (!transactionDetail?.date) return 0;

  try {
    const parsedTime = parseISO(
      String(transactionDetail.date).replace(/\//g, '-'),
    ).getTime();
    return Number.isNaN(parsedTime) ? 0 : parsedTime;
  } catch {
    return 0;
  }
}

function sortTransactionDetailsForDirection(transactions, direction) {
  const sortMultiplier = direction === 'asc' ? 1 : -1;

  return [...transactions].sort((left, right) => {
    const leftTime = getTransactionDetailSortValue(left);
    const rightTime = getTransactionDetailSortValue(right);

    if (leftTime !== rightTime) {
      return (leftTime - rightTime) * sortMultiplier;
    }

    return String(left.description || '').localeCompare(
      String(right.description || ''),
    );
  });
}

export default function CategoryTotals({ category, includedAccountIds = null }) {
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
  const transactionLinks = useSelector(
    transactionLinkSelectors.selectActiveTransactionLinks,
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
  const [selectedLinkTransactionIds, setSelectedLinkTransactionIds] = useState(
    new Set(),
  );
  const [linkDialogState, setLinkDialogState] = useState({
    open: false,
    sourceTransactionId: null,
    destinationTransactionId: null,
  });
  const [transactionSortDirection, setTransactionSortDirection] =
    useState('asc');

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
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(includedAccountIds)) {
      return allTransactions;
    }

    return filterTransactionsByAccountIds(allTransactions, includedAccountIds);
  }, [allTransactions, includedAccountIds]);
  const filteredTransactionIds = useMemo(
    () => filteredTransactions.map((transaction) => transaction.id),
    [filteredTransactions],
  );
  const filteredTransactionSplits = useMemo(
    () =>
      filterTransactionSplitsByTransactionIds(
        transactionSplits,
        filteredTransactionIds,
      ),
    [filteredTransactionIds, transactionSplits],
  );
  const filteredRecurringTransactions = useMemo(() => {
    if (!Array.isArray(includedAccountIds)) {
      return recurringTransactions;
    }

    return filterRecurringTransactionsByAccountIds(
      recurringTransactions,
      includedAccountIds,
    );
  }, [includedAccountIds, recurringTransactions]);

  const { availableMonths, availableYears } = useMemo(
    () =>
      buildAvailableSpendingPeriods({
        allTransactions: filteredTransactions,
        transactionSplits: filteredTransactionSplits,
        recurringTransactions: filteredRecurringTransactions,
        realizedDatesMap,
        projectionEndDate,
        categoryIdFilter: (categoryId) => categoryIds.has(categoryId),
      }),
    [
      filteredTransactions,
      filteredTransactionSplits,
      filteredRecurringTransactions,
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
        allTransactions: filteredTransactions,
        transactionLinks,
        transactionSplits: filteredTransactionSplits,
        recurringTransactions: filteredRecurringTransactions,
        realizedDatesMap,
        periodConfig,
      }),
    [
      category,
      filteredTransactions,
      transactionLinks,
      filteredTransactionSplits,
      filteredRecurringTransactions,
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
  const handleTransactionSortToggle = () => {
    setTransactionSortDirection((currentDirection) =>
      currentDirection === 'asc' ? 'desc' : 'asc',
    );
  };

  const handleToggleLinkSelection = (transactionId, isSelected) => {
    setSelectedLinkTransactionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (isSelected) {
        nextIds.add(transactionId);
      } else {
        nextIds.delete(transactionId);
      }
      return nextIds;
    });
  };

  const handleOpenSelectedLinkDialog = () => {
    const [sourceTransactionId, destinationTransactionId] = Array.from(
      selectedLinkTransactionIds,
    );
    setLinkDialogState({
      open: true,
      sourceTransactionId,
      destinationTransactionId: destinationTransactionId || null,
    });
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogState({
      open: false,
      sourceTransactionId: null,
      destinationTransactionId: null,
    });
  };

  const handleLinkDialogLinked = () => {
    setSelectedLinkTransactionIds(new Set());
  };

  const handleUnlinkTransaction = async (transactionId) => {
    await dispatch(
      transactionLinkActions.unlinkTransactionByTransactionId(transactionId),
    );
    setSelectedLinkTransactionIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.delete(transactionId);
      return nextIds;
    });
  };

  const formatAccountLabel = (transactionDetail) => {
    if (Array.isArray(transactionDetail.accountIds)) {
      return transactionDetail.accountIds
        .map((accountId) => accountsById.get(accountId) || '--')
        .join(' <-> ');
    }

    return accountsById.get(transactionDetail.accountId) || '--';
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
                      backgroundColor: LEDGER_STATE_META[stateKey].backgroundColor,
                      border: `1px solid ${LEDGER_STATE_META[stateKey].borderColor}`,
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        color: LEDGER_STATE_META[stateKey].color,
                        fontSize: '0.68rem',
                        display: 'block',
                        lineHeight: 1.1,
                        fontWeight: 700,
                      }}
                    >
                      {SPENDING_STATE_META[stateKey].label}
                    </Typography>
                    <Typography
                      sx={{
                        color: LEDGER_STATE_META[stateKey].color,
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
                    backgroundColor: TOTAL_META.backgroundColor,
                    border: `1px solid ${TOTAL_META.borderColor}`,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{
                      color: TOTAL_META.color,
                      fontSize: '0.68rem',
                      display: 'block',
                      lineHeight: 1.1,
                      fontWeight: 700,
                    }}
                  >
                    Total
                  </Typography>
                  <Typography
                    sx={{
                      color: TOTAL_META.color,
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
                    backgroundColor: TOTAL_META.backgroundColor,
                    border: `1px solid ${TOTAL_META.borderColor}`,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{
                      color: TOTAL_META.color,
                      fontSize: '0.68rem',
                      display: 'block',
                      lineHeight: 1.1,
                      fontWeight: 700,
                    }}
                  >
                    Total
                  </Typography>
                  <Typography
                    sx={{
                      color: TOTAL_META.color,
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
                    backgroundColor: MONTHLY_AVG_META.backgroundColor,
                    border: `1px solid ${MONTHLY_AVG_META.borderColor}`,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{
                      color: MONTHLY_AVG_META.color,
                      fontSize: '0.68rem',
                      display: 'block',
                      lineHeight: 1.1,
                      fontWeight: 700,
                    }}
                  >
                    Monthly Avg
                  </Typography>
                  <Typography
                    sx={{
                      color: MONTHLY_AVG_META.color,
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                  Subcategory Breakdown
                </Typography>
                {selectedLinkTransactionIds.size > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      {selectedLinkTransactionIds.size} selected
                    </Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<LinkIcon />}
                      disabled={selectedLinkTransactionIds.size !== 2}
                      onClick={handleOpenSelectedLinkDialog}
                    >
                      Link Selected
                    </Button>
                    <Button
                      variant='text'
                      size='small'
                      onClick={() => setSelectedLinkTransactionIds(new Set())}
                    >
                      Clear
                    </Button>
                  </Box>
                )}
              </Box>

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
                            sx={{
                              color: LEDGER_STATE_META[stateKey].color,
                              fontWeight: 700,
                            }}
                          >
                            {SPENDING_STATE_META[stateKey].label}
                          </TableCell>
                        ))}
                        <TableCell
                          align='right'
                          sx={{ color: TOTAL_META.color, fontWeight: 700 }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          align='right'
                          sx={{ color: MONTHLY_AVG_META.color, fontWeight: 700 }}
                        >
                          Monthly Avg
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell
                          align='right'
                          sx={{ color: TOTAL_META.color, fontWeight: 700 }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          align='right'
                          sx={{ color: MONTHLY_AVG_META.color, fontWeight: 700 }}
                        >
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
                                  color: LEDGER_STATE_META[stateKey].color,
                                  fontWeight: 500,
                                }}
                              >
                                {formatAmount(subcategory[stateKey])}
                              </TableCell>
                            ))}
                            <TableCell
                              align='right'
                              sx={{
                                color: TOTAL_META.color,
                                fontWeight: 600,
                              }}
                            >
                              {formatAmount(subcategory.total)}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: MONTHLY_AVG_META.color,
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
                                color: TOTAL_META.color,
                                fontWeight: 600,
                              }}
                            >
                              {formatAmount(subcategory.total)}
                            </TableCell>
                            <TableCell
                              align='right'
                              sx={{
                                color: MONTHLY_AVG_META.color,
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
                                  <TableCell sx={{ fontWeight: 700 }} />
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    <TableSortLabel
                                      active
                                      direction={transactionSortDirection}
                                      IconComponent={KeyboardArrowUpIcon}
                                      onClick={handleTransactionSortToggle}
                                    >
                                      Date
                                    </TableSortLabel>
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
                                  <TableCell sx={{ fontWeight: 700 }}>
                                    Link
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sortTransactionDetailsForDirection(
                                  subcategory.transactions,
                                  transactionSortDirection,
                                ).map((transaction) => {
                                  const isLinkedDetail =
                                    transaction.sourceType === 'linked-transaction' ||
                                    (transaction.transactionId &&
                                      Boolean(
                                        transactionLinks.find(
                                          (link) =>
                                            link.sourceTransactionId ===
                                              transaction.transactionId ||
                                            link.destinationTransactionId ===
                                              transaction.transactionId,
                                        ),
                                      ));
                                  const canSelectForLinking =
                                    !isLinkedDetail &&
                                    transaction.sourceType !== 'recurring' &&
                                    transaction.sourceType !== 'linked-transaction' &&
                                    Boolean(transaction.transactionId) &&
                                    (!transaction.splitIds ||
                                      transaction.splitIds.length === 0);
                                  const isClickable =
                                    transaction.sourceType === 'recurring'
                                      ? recurringTransactionsById.has(
                                          transaction.recurringTransactionId,
                                        )
                                      : transactionsById.has(
                                          transaction.transactionId,
                                        );
                                  const detailTextColor =
                                    getTransactionDetailTextColor(transaction);

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
                                        color: detailTextColor,
                                        '& .MuiTableCell-root': {
                                          color: detailTextColor,
                                        },
                                        '&:hover': isClickable
                                          ? { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
                                          : undefined,
                                      }}
                                    >
                                      <TableCell
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        <Checkbox
                                          checked={selectedLinkTransactionIds.has(
                                            transaction.transactionId,
                                          )}
                                          disabled={!canSelectForLinking}
                                          onChange={(event) =>
                                            handleToggleLinkSelection(
                                              transaction.transactionId,
                                              event.target.checked,
                                            )
                                          }
                                          size='small'
                                        />
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {formatTransactionDate(transaction.date)}
                                      </TableCell>
                                      <TableCell>
                                        {formatAccountLabel(transaction)}
                                      </TableCell>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                          }}
                                        >
                                          {isLinkedDetail && (
                                            <LinkedStatusIndicator title='This transaction is linked.' />
                                          )}
                                          <Typography variant='body2'>
                                            {transaction.description || '--'}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        align='right'
                                        sx={{
                                          color: detailTextColor,
                                          fontWeight: 500,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {formatAmount(transaction.amount)}
                                      </TableCell>
                                      <TableCell
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        {isLinkedDetail && transaction.transactionId ? (
                                          <Tooltip title='Unlink transaction'>
                                            <IconButton
                                              size='small'
                                              onClick={() =>
                                                handleUnlinkTransaction(
                                                  transaction.transactionId,
                                                )
                                              }
                                            >
                                              <LinkOffIcon fontSize='small' />
                                            </IconButton>
                                          </Tooltip>
                                        ) : (
                                          <Tooltip
                                            title={
                                              isLinkedDetail
                                                ? 'This transaction is already linked.'
                                                : canSelectForLinking
                                                  ? 'Select two transactions to link them.'
                                                  : 'Only realized transactions without splits can be linked.'
                                            }
                                          >
                                            <span>
                                              <IconButton
                                                size='small'
                                                disabled
                                              >
                                                <LinkIcon fontSize='small' />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        )}
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

      <SelectedTransactionLinkDialog
        open={linkDialogState.open}
        onClose={handleCloseLinkDialog}
        sourceTransactionId={linkDialogState.sourceTransactionId}
        destinationTransactionId={linkDialogState.destinationTransactionId}
        onLinked={handleLinkDialogLinked}
      />
    </Paper>
  );
}
