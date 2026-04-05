import {
  add,
  differenceInCalendarMonths,
  endOfMonth,
  endOfYear,
  format,
  isAfter,
  isBefore,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';

import { generateOccurrenceDates } from '@/store/recurringTransactions/generators';
import { TransactionStateEnum } from '@/store/transactions/constants';
import {
  buildLinkPairKey,
  buildTransactionLinkMapByTransactionId,
  getLinkedTransactionId,
} from '@/utils/linking';
import { buildCategoriesById, buildSplitsByTransactionId } from './transactionCategoryState';

export const AGGREGATE_PERIODS = Object.freeze([
  { key: 'current-month', label: 'Current Month' },
  { key: 'last-3-months', label: '3 Months' },
  { key: 'ytd', label: 'YTD' },
  { key: 'last-12-months', label: '12 Months' },
]);

export const CALENDAR_MONTHS = Object.freeze([
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]);

export const SPENDING_STATE_ORDER = Object.freeze([
  'completed',
  'pending',
  'scheduled',
  'planned',
]);

export const SPENDING_STATE_META = Object.freeze({
  completed: {
    label: 'Completed',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  pending: {
    label: 'Pending',
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  scheduled: {
    label: 'Scheduled',
    color: '#2196f3',
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  planned: {
    label: 'Planned',
    color: '#9c27b0',
    backgroundColor: '#f3e5f5',
    borderColor: '#9c27b0',
  },
});

const EMPTY_REALIZED_DATES = new Map();

const createMetrics = () => ({
  completed: 0,
  pending: 0,
  scheduled: 0,
  planned: 0,
  total: 0,
  count: 0,
  _countedIds: new Set(),
});

const createSubcategoryNode = (id, name) => ({
  id,
  name,
  ...createMetrics(),
});

const createDashboardCategoryNode = (id, name) => ({
  id,
  name,
  ...createMetrics(),
  subcategories: new Map(),
  transactions: [],
});

const createDashboardSubcategoryNode = (id, name) => ({
  id,
  name,
  ...createMetrics(),
  transactions: [],
});

const sortTransactionDetails = (left, right) => {
  const leftDate = parseDateValue(left.date)?.getTime() || 0;
  const rightDate = parseDateValue(right.date)?.getTime() || 0;

  if (leftDate !== rightDate) {
    return rightDate - leftDate;
  }

  return String(left.description || '').localeCompare(
    String(right.description || ''),
  );
};

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : startOfDay(value);
  }

  try {
    const parsed = parseISO(String(value).replace(/\//g, '-'));
    return isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  } catch {
    return null;
  }
};

const getMonthCount = (startDate, endDate) =>
  Math.max(
    1,
    differenceInCalendarMonths(
      startOfMonth(endDate),
      startOfMonth(startDate),
    ) + 1,
  );

const formatCustomRangeLabel = (startDate, endDate) =>
  `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;

const normalizeMonthValue = (value) => {
  if (!value && value !== 0) return '';

  const normalizedValue = String(value).trim();
  if (!normalizedValue) return '';

  return normalizedValue.padStart(2, '0');
};

const cloneSelection = (selection) => ({ ...selection });

const getMonthLabel = (monthValue, referenceDate = new Date()) => {
  const normalizedMonth = normalizeMonthValue(monthValue);
  if (!normalizedMonth) return '';

  const monthDate = parse(normalizedMonth, 'MM', referenceDate);
  return isNaN(monthDate.getTime()) ? '' : format(monthDate, 'MMMM');
};

const getSelectionYears = (availableYears, referenceDate) => {
  const numericYears = availableYears
    .map((year) => Number(year))
    .filter((year) => !Number.isNaN(year))
    .sort((left, right) => left - right);

  if (numericYears.length > 0) {
    return numericYears;
  }

  return [startOfDay(referenceDate).getFullYear()];
};

const getBucketForState = (transactionState) => {
  switch (transactionState) {
    case TransactionStateEnum.COMPLETED:
      return 'completed';
    case TransactionStateEnum.PENDING:
      return 'pending';
    case TransactionStateEnum.SCHEDULED:
      return 'scheduled';
    case TransactionStateEnum.PLANNED:
      return 'planned';
    case 'recurring':
      return 'planned';
    default:
      return null;
  }
};

const getTransactionEntries = (transaction, splitsByTransaction) => {
  const splits = splitsByTransaction.get(transaction.id) || [];

  if (splits.length > 0) {
    return splits.map((split) => ({
      categoryId: split.categoryId ?? null,
      amount: Number(split.amount) || 0,
      splitId: split.id,
    }));
  }

  return [
    {
      categoryId: transaction.categoryId ?? null,
      amount: Number(transaction.amount) || 0,
      splitId: null,
    },
  ];
};

const buildCategoryAmountsForTransaction = (
  transaction,
  splitsByTransaction,
  categoryIds,
) => {
  const categoryAmounts = new Map();

  getTransactionEntries(transaction, splitsByTransaction).forEach((entry) => {
    if (!entry.categoryId || !categoryIds.has(entry.categoryId)) return;

    const currentCategoryAmount = categoryAmounts.get(entry.categoryId) || {
      amount: 0,
      splitIds: [],
      isSplitEntry: false,
    };

    currentCategoryAmount.amount += entry.amount;

    if (entry.splitId) {
      currentCategoryAmount.splitIds.push(entry.splitId);
      currentCategoryAmount.isSplitEntry = true;
    }

    categoryAmounts.set(entry.categoryId, currentCategoryAmount);
  });

  return categoryAmounts;
};

const addToMetrics = (metrics, bucket, amount, countedId) => {
  if (!bucket || amount === 0) return;

  metrics[bucket] += amount;
  metrics.total += amount;

  if (countedId && !metrics._countedIds.has(countedId)) {
    metrics._countedIds.add(countedId);
    metrics.count += 1;
  }
};

const finalizeMetrics = (metrics, totalBase, safeMonths) => {
  const values = { ...metrics };
  delete values._countedIds;

  return {
    ...values,
    monthlyAvg: values.total / safeMonths,
    percentage: totalBase ? (values.total / totalBase) * 100 : 0,
  };
};

const finalizeDashboardSubcategoryNode = (node, totalBase, safeMonths) => {
  const { transactions, ...metrics } = node;
  const finalized = finalizeMetrics(metrics, totalBase, safeMonths);

  return {
    ...finalized,
    transactions: [...transactions].sort(sortTransactionDetails),
  };
};

const finalizeDashboardCategoryNode = (node, totalBase, safeMonths) => {
  const { subcategories, transactions, ...metrics } = node;
  const finalized = finalizeMetrics(metrics, totalBase, safeMonths);

  return {
    ...finalized,
    transactions: [...transactions].sort(sortTransactionDetails),
    subcategories: Array.from(subcategories.values())
      .map((subcategory) =>
        finalizeDashboardSubcategoryNode(
          subcategory,
          finalized.total || 0,
          safeMonths,
        ),
      )
      .filter((subcategory) => subcategory.total > 0)
      .sort((a, b) => b.total - a.total),
  };
};

const buildCategoryLookup = (categories = []) => {
  const categoriesById = buildCategoriesById(categories);
  const lookup = new Map();

  categories.forEach((category) => {
    if (!category.parentId) {
      lookup.set(category.id, {
        parentId: category.id,
        parentName: category.name,
        subcategoryId: null,
        subcategoryName: null,
      });
      return;
    }

    const parentCategory = categoriesById.get(category.parentId);
    if (!parentCategory) return;

    lookup.set(category.id, {
      parentId: parentCategory.id,
      parentName: parentCategory.name,
      subcategoryId: category.id,
      subcategoryName: category.name,
    });
  });

  return lookup;
};

const getRecurringRangeStart = (startDate, referenceDate) => {
  const today = startOfDay(referenceDate);
  return isAfter(startDate, today) ? startDate : today;
};

const buildDashboardTransactionDetail = ({
  id,
  sourceType,
  transactionId = null,
  recurringTransactionId = null,
  date,
  accountId = null,
  categoryId = null,
  splitIds = [],
  description = '',
  amount,
  transactionState,
}) => ({
  id,
  sourceType,
  transactionId,
  recurringTransactionId,
  date,
  accountId,
  categoryId,
  splitIds,
  description,
  amount: Math.abs(Number(amount) || 0),
  transactionState,
});

export const shouldShowStateBreakdown = (
  startDate,
  endDate,
  referenceDate = new Date(),
) => {
  const normalizedStart = parseDateValue(startDate);
  const normalizedEnd = parseDateValue(endDate);

  if (!normalizedStart || !normalizedEnd) {
    return false;
  }

  return !isBefore(normalizedEnd, startOfDay(referenceDate));
};

export function getSpendingSelectionDropdownValues(
  selection,
  referenceDate = new Date(),
) {
  const currentMonth = format(referenceDate, 'MM');
  const currentYear = format(referenceDate, 'yyyy');

  if (!selection?.type) {
    return { month: '', year: '' };
  }

  if (selection.type === 'aggregate') {
    if (selection.value === 'current-month') {
      return {
        month: currentMonth,
        year: currentYear,
      };
    }

    return { month: '', year: '' };
  }

  if (selection.type === 'month') {
    return {
      month: normalizeMonthValue(selection.value),
      year: '',
    };
  }

  if (selection.type === 'year') {
    return {
      month: '',
      year: String(selection.value || ''),
    };
  }

  if (selection.type === 'year-month') {
    return {
      month: normalizeMonthValue(selection.month),
      year: String(selection.year || ''),
    };
  }

  return { month: '', year: '' };
}

export function buildSpendingSelectionFromDropdownValues(
  { month, year },
  fallbackSelection,
) {
  const normalizedMonth = normalizeMonthValue(month);
  const normalizedYear = String(year || '').trim();

  if (normalizedMonth && normalizedYear) {
    return {
      type: 'year-month',
      month: normalizedMonth,
      year: normalizedYear,
    };
  }

  if (normalizedYear) {
    return {
      type: 'year',
      value: normalizedYear,
    };
  }

  if (normalizedMonth) {
    return {
      type: 'month',
      value: normalizedMonth,
    };
  }

  return cloneSelection(fallbackSelection);
}

export function getAggregatePeriodConfig(
  key,
  referenceDate = new Date(),
) {
  switch (key) {
    case 'current-month':
      return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate),
        numMonths: 1,
        filterMode: 'range',
        label: `Current Month (${format(referenceDate, 'MMMM yyyy')})`,
      };
    case 'last-3-months':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 3)),
        endDate: endOfMonth(subMonths(referenceDate, 1)),
        numMonths: 3,
        filterMode: 'range',
        label: 'Last 3 Months',
      };
    case 'ytd': {
      const startDate = startOfYear(referenceDate);
      const endDate = startOfDay(subDays(referenceDate, 1));
      const completedMonths = Math.max(
        1,
        differenceInCalendarMonths(startOfDay(referenceDate), startDate),
      );

      return {
        startDate,
        endDate,
        numMonths: completedMonths,
        filterMode: 'range',
        label: `YTD (${format(referenceDate, 'yyyy')})`,
      };
    }
    case 'last-12-months':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 12)),
        endDate: endOfMonth(subMonths(referenceDate, 1)),
        numMonths: 12,
        filterMode: 'range',
        label: 'Last 12 Months',
      };
    default:
      return getAggregatePeriodConfig('last-3-months', referenceDate);
  }
}

export function getSpendingPeriodConfig(
  selection,
  optionsOrReferenceDate = new Date(),
) {
  const options =
    optionsOrReferenceDate instanceof Date
      ? { referenceDate: optionsOrReferenceDate }
      : optionsOrReferenceDate;
  const {
    referenceDate = new Date(),
    availableYears = [],
  } = options || {};

  if (!selection?.type) {
    return getAggregatePeriodConfig('last-3-months', referenceDate);
  }

  if (selection.type === 'aggregate') {
    return getAggregatePeriodConfig(selection.value, referenceDate);
  }

  if (selection.type === 'month' && selection.value) {
    const normalizedMonth = normalizeMonthValue(selection.value);
    const yearsInScope = getSelectionYears(availableYears, referenceDate);

    if (normalizedMonth && yearsInScope.length > 0) {
      const firstYear = yearsInScope[0];
      const lastYear = yearsInScope[yearsInScope.length - 1];
      const monthIndex = Number(normalizedMonth) - 1;

      return {
        startDate: startOfMonth(new Date(firstYear, monthIndex, 1)),
        endDate: endOfMonth(new Date(lastYear, monthIndex, 1)),
        numMonths: yearsInScope.length,
        filterMode: 'month',
        month: normalizedMonth,
        label: `${getMonthLabel(normalizedMonth, referenceDate)} (All Years)`,
      };
    }
  }

  if (selection.type === 'year' && selection.value) {
    const yearDate = new Date(Number(selection.value), 0, 1);

    if (!isNaN(yearDate.getTime())) {
      return {
        startDate: startOfYear(yearDate),
        endDate: endOfYear(yearDate),
        numMonths: 12,
        filterMode: 'range',
        label: String(selection.value),
      };
    }
  }

  if (selection.type === 'year-month' && selection.year && selection.month) {
    const monthValue = normalizeMonthValue(selection.month);
    const monthDate = parse(
      `${selection.year}-${monthValue}`,
      'yyyy-MM',
      referenceDate,
    );

    if (!isNaN(monthDate.getTime())) {
      return {
        startDate: startOfMonth(monthDate),
        endDate: endOfMonth(monthDate),
        numMonths: 1,
        filterMode: 'range',
        month: monthValue,
        year: String(selection.year),
        label: format(monthDate, 'MMMM yyyy'),
      };
    }
  }

  if (selection.type === 'custom') {
    const startDate = parseDateValue(selection.startDate);
    const endDate = parseDateValue(selection.endDate);

    if (startDate && endDate) {
      const normalizedStart = isAfter(startDate, endDate) ? endDate : startDate;
      const normalizedEnd = isAfter(startDate, endDate) ? startDate : endDate;

      return {
        startDate: normalizedStart,
        endDate: normalizedEnd,
        numMonths: getMonthCount(normalizedStart, normalizedEnd),
        filterMode: 'range',
        label: formatCustomRangeLabel(normalizedStart, normalizedEnd),
      };
    }
  }

  return getAggregatePeriodConfig('last-3-months', referenceDate);
}

export function buildAvailableSpendingPeriods({
  allTransactions = [],
  transactionSplits = [],
  recurringTransactions = [],
  realizedDatesMap = EMPTY_REALIZED_DATES,
  projectionEndDate,
  referenceDate = new Date(),
  categoryIdFilter = () => true,
}) {
  const monthSet = new Set([format(referenceDate, 'yyyy-MM')]);
  const yearSet = new Set([startOfDay(referenceDate).getFullYear()]);
  const splitsByTransaction = buildSplitsByTransactionId(transactionSplits);

  allTransactions.forEach((transaction) => {
    const bucket = getBucketForState(transaction.transactionState);
    if (!bucket) return;

    const hasIncludedCategory = getTransactionEntries(
      transaction,
      splitsByTransaction,
    ).some(
      (entry) => entry.categoryId && categoryIdFilter(entry.categoryId),
    );

    if (!hasIncludedCategory) return;

    const transactionDate = parseDateValue(transaction.date);
    if (!transactionDate) return;

    monthSet.add(format(transactionDate, 'yyyy-MM'));
    yearSet.add(transactionDate.getFullYear());
  });

  const recurringEndDate =
    parseDateValue(projectionEndDate) || add(referenceDate, { months: 15 });
  const recurringStartDate = startOfDay(referenceDate);

  recurringTransactions.forEach((rule) => {
    if (!rule.categoryId || !categoryIdFilter(rule.categoryId)) return;

    generateOccurrenceDates(rule, recurringStartDate, recurringEndDate).forEach(
      (dateString) => {
        if (realizedDatesMap.has(`${rule.id}:${dateString}`)) return;

        const occurrenceDate = parseDateValue(dateString);
        if (!occurrenceDate) return;

        monthSet.add(format(occurrenceDate, 'yyyy-MM'));
        yearSet.add(occurrenceDate.getFullYear());
      },
    );
  });

  return {
    availableMonths: Array.from(monthSet).sort().reverse(),
    availableYears: Array.from(yearSet).sort((a, b) => b - a),
  };
}

const resolvePeriodConfig = ({
  periodConfig,
  startDate,
  endDate,
  numMonths = 1,
}) => {
  if (periodConfig) {
    return {
      ...periodConfig,
      startDate: parseDateValue(periodConfig.startDate),
      endDate: parseDateValue(periodConfig.endDate),
      numMonths: Math.max(1, periodConfig.numMonths || 1),
      filterMode: periodConfig.filterMode || 'range',
    };
  }

  return {
    startDate: parseDateValue(startDate),
    endDate: parseDateValue(endDate),
    numMonths: Math.max(1, numMonths),
    filterMode: 'range',
  };
};

const isDateInPeriod = (
  dateValue,
  periodConfig,
  normalizedStartDate,
  normalizedEndDate,
) => {
  const normalizedDate = parseDateValue(dateValue);

  if (!normalizedDate || !normalizedStartDate || !normalizedEndDate) {
    return false;
  }

  if (
    isBefore(normalizedDate, normalizedStartDate) ||
    isAfter(normalizedDate, normalizedEndDate)
  ) {
    return false;
  }

  if (periodConfig.filterMode === 'month' && periodConfig.month) {
    return format(normalizedDate, 'MM') === periodConfig.month;
  }

  return true;
};

export function buildDashboardSpendingHistoryData({
  allTransactions = [],
  transactionSplits = [],
  categories = [],
  recurringTransactions = [],
  realizedDatesMap = EMPTY_REALIZED_DATES,
  periodConfig,
  startDate,
  endDate,
  numMonths = 1,
  referenceDate = new Date(),
}) {
  const resolvedPeriodConfig = resolvePeriodConfig({
    periodConfig,
    startDate,
    endDate,
    numMonths,
  });
  const normalizedStartDate = resolvedPeriodConfig.startDate;
  const normalizedEndDate = resolvedPeriodConfig.endDate;
  const safeMonths = resolvedPeriodConfig.numMonths;

  if (!normalizedStartDate || !normalizedEndDate) {
    return {
      categories: [],
      totalExpenses: 0,
      monthlyAvgExpenses: 0,
      totalTransactions: 0,
      showStateBreakdown: false,
      stateTotals: finalizeMetrics(createMetrics(), 0, safeMonths),
    };
  }

  const showStateBreakdown = shouldShowStateBreakdown(
    normalizedStartDate,
    normalizedEndDate,
    referenceDate,
  );
  const categoryLookup = buildCategoryLookup(categories);
  const categoryTotals = new Map();
  const overallTotals = createMetrics();
  const splitsByTransaction = buildSplitsByTransactionId(transactionSplits);
  const excludedCategoryIds = new Set();

  categories.forEach((category) => {
    if (category.slug === 'income' || category.slug === 'transfers') {
      excludedCategoryIds.add(category.id);
    }

    if (
      category.parentId &&
      ['income', 'transfers'].includes(
        categories.find((parent) => parent.id === category.parentId)?.slug,
      )
    ) {
      excludedCategoryIds.add(category.id);
    }
  });

  const getOrCreateParentNode = (categoryMeta) => {
    if (!categoryTotals.has(categoryMeta.parentId)) {
      categoryTotals.set(
        categoryMeta.parentId,
        createDashboardCategoryNode(
          categoryMeta.parentId,
          categoryMeta.parentName,
        ),
      );
    }

    return categoryTotals.get(categoryMeta.parentId);
  };

  const getOrCreateSubcategoryNode = (parentNode, categoryMeta) => {
    if (!categoryMeta.subcategoryId) return null;

    if (!parentNode.subcategories.has(categoryMeta.subcategoryId)) {
      parentNode.subcategories.set(
        categoryMeta.subcategoryId,
        createDashboardSubcategoryNode(
          categoryMeta.subcategoryId,
          categoryMeta.subcategoryName,
        ),
      );
    }

    return parentNode.subcategories.get(categoryMeta.subcategoryId);
  };

  const addCategoryAmount = (
    categoryId,
    bucket,
    amount,
    countedId,
    subcategoryTransactionDetail = null,
  ) => {
    if (!categoryId || excludedCategoryIds.has(categoryId)) return;

    const categoryMeta = categoryLookup.get(categoryId);
    if (!categoryMeta) return;

    const normalizedAmount = Math.abs(amount);
    if (normalizedAmount === 0) return;

    const parentNode = getOrCreateParentNode(categoryMeta);
    addToMetrics(parentNode, bucket, normalizedAmount, countedId);
    addToMetrics(overallTotals, bucket, normalizedAmount, countedId);

    const subcategoryNode = getOrCreateSubcategoryNode(parentNode, categoryMeta);
    if (!subcategoryNode) return;

    addToMetrics(subcategoryNode, bucket, normalizedAmount, countedId);

    if (subcategoryTransactionDetail) {
      subcategoryNode.transactions.push(subcategoryTransactionDetail);
    }
  };

  const addParentTransactionDetail = (parentId, transactionDetail) => {
    if (!transactionDetail || !categoryTotals.has(parentId)) return;

    categoryTotals.get(parentId).transactions.push(transactionDetail);
  };

  allTransactions.forEach((transaction) => {
    const transactionDate = parseDateValue(transaction.date);
    if (!transactionDate) return;

    if (
      !isDateInPeriod(
        transactionDate,
        resolvedPeriodConfig,
        normalizedStartDate,
        normalizedEndDate,
      )
    ) {
      return;
    }

    const bucket = getBucketForState(transaction.transactionState);
    if (!bucket) return;
    if (!showStateBreakdown && bucket !== 'completed') return;

    const categoryAmounts = new Map();
    const parentAmounts = new Map();

    getTransactionEntries(transaction, splitsByTransaction).forEach((entry) => {
      if (!entry.categoryId || excludedCategoryIds.has(entry.categoryId)) return;

      const categoryMeta = categoryLookup.get(entry.categoryId);
      if (!categoryMeta) return;

      const currentCategoryAmount = categoryAmounts.get(entry.categoryId) || {
        amount: 0,
        splitIds: [],
        isSplitEntry: false,
      };
      currentCategoryAmount.amount += entry.amount;

      if (entry.splitId) {
        currentCategoryAmount.splitIds.push(entry.splitId);
        currentCategoryAmount.isSplitEntry = true;
      }

      categoryAmounts.set(entry.categoryId, currentCategoryAmount);

      const currentParentAmount = parentAmounts.get(categoryMeta.parentId) || {
        amount: 0,
        splitIds: [],
        isSplitEntry: false,
      };
      currentParentAmount.amount += entry.amount;

      if (entry.splitId) {
        currentParentAmount.splitIds.push(entry.splitId);
        currentParentAmount.isSplitEntry = true;
      }

      parentAmounts.set(categoryMeta.parentId, currentParentAmount);
    });

    categoryAmounts.forEach((categoryAmount, categoryId) => {
      const categoryMeta = categoryLookup.get(categoryId);

      addCategoryAmount(
        categoryId,
        bucket,
        categoryAmount.amount,
        transaction.id,
        categoryMeta?.subcategoryId
          ? buildDashboardTransactionDetail({
              id: `${transaction.id}:${categoryId}`,
              sourceType: categoryAmount.isSplitEntry
                ? 'transaction-split'
                : 'transaction',
              transactionId: transaction.id,
              date: transaction.date,
              accountId: transaction.accountId ?? null,
              categoryId,
              splitIds: categoryAmount.splitIds,
              description: transaction.description || '',
              amount: categoryAmount.amount,
              transactionState: transaction.transactionState,
            })
          : null,
      );
    });

    parentAmounts.forEach((parentAmount, parentId) => {
      addParentTransactionDetail(
        parentId,
        buildDashboardTransactionDetail({
          id: `${transaction.id}:${parentId}`,
          sourceType: parentAmount.isSplitEntry
            ? 'transaction-split'
            : 'transaction',
          transactionId: transaction.id,
          date: transaction.date,
          accountId: transaction.accountId ?? null,
          categoryId: parentId,
          splitIds: parentAmount.splitIds,
          description: transaction.description || '',
          amount: parentAmount.amount,
          transactionState: transaction.transactionState,
        }),
      );
    });
  });

  if (showStateBreakdown) {
    const recurringStartDate = getRecurringRangeStart(
      normalizedStartDate,
      referenceDate,
    );

    if (!isAfter(recurringStartDate, normalizedEndDate)) {
      recurringTransactions.forEach((rule) => {
        if (!rule.categoryId || excludedCategoryIds.has(rule.categoryId)) {
          return;
        }

        const categoryMeta = categoryLookup.get(rule.categoryId);
        if (!categoryMeta) return;

        generateOccurrenceDates(
          rule,
          recurringStartDate,
          normalizedEndDate,
        ).forEach((dateString) => {
          const occurrenceId = `${rule.id}:${dateString}`;
          if (realizedDatesMap.has(occurrenceId)) return;
          if (
            !isDateInPeriod(
              dateString,
              resolvedPeriodConfig,
              normalizedStartDate,
              normalizedEndDate,
            )
          ) {
            return;
          }

          addCategoryAmount(
            rule.categoryId,
            'planned',
            Number(rule.amount) || 0,
            occurrenceId,
            categoryMeta.subcategoryId
              ? buildDashboardTransactionDetail({
                  id: `${occurrenceId}:${rule.categoryId}`,
                  sourceType: 'recurring',
                  recurringTransactionId: rule.id,
                  date: dateString,
                  accountId: rule.accountId ?? null,
                  categoryId: rule.categoryId,
                  description: rule.description || '',
                  amount: Number(rule.amount) || 0,
                  transactionState: 'recurring',
                })
              : null,
          );

          addParentTransactionDetail(
            categoryMeta.parentId,
            buildDashboardTransactionDetail({
              id: `${occurrenceId}:${categoryMeta.parentId}`,
              sourceType: 'recurring',
              recurringTransactionId: rule.id,
              date: dateString,
              accountId: rule.accountId ?? null,
              categoryId: categoryMeta.parentId,
              description: rule.description || '',
              amount: Number(rule.amount) || 0,
              transactionState: 'recurring',
            }),
          );
        });
      });
    }
  }

  const finalizedStateTotals = finalizeMetrics(
    overallTotals,
    overallTotals.total,
    safeMonths,
  );
  const finalizedCategories = Array.from(categoryTotals.values())
    .map((category) =>
      finalizeDashboardCategoryNode(
        category,
        overallTotals.total || 0,
        safeMonths,
      ),
    )
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    categories: finalizedCategories,
    totalExpenses: finalizedStateTotals.total,
    monthlyAvgExpenses: finalizedStateTotals.monthlyAvg,
    totalTransactions: finalizedStateTotals.count,
    showStateBreakdown,
    stateTotals: finalizedStateTotals,
  };
}

export function buildCategoryTotalsData({
  category,
  allTransactions = [],
  transactionLinks = [],
  transactionSplits = [],
  recurringTransactions = [],
  realizedDatesMap = EMPTY_REALIZED_DATES,
  periodConfig,
  startDate,
  endDate,
  referenceDate = new Date(),
}) {
  const resolvedPeriodConfig = resolvePeriodConfig({
    periodConfig,
    startDate,
    endDate,
  });
  const normalizedStartDate = resolvedPeriodConfig.startDate;
  const normalizedEndDate = resolvedPeriodConfig.endDate;
  const safeMonths = resolvedPeriodConfig.numMonths;

  if (!category || !normalizedStartDate || !normalizedEndDate) {
    return {
      totals: finalizeMetrics(createMetrics(), 0, 1),
      subcategoryTotals: [],
      showStateBreakdown: false,
    };
  }

  const showStateBreakdown = shouldShowStateBreakdown(
    normalizedStartDate,
    normalizedEndDate,
    referenceDate,
  );
  const categoryIds = new Set([
    category.id,
    ...(category.subcategories || []).map((subcategory) => subcategory.id),
  ]);
  const totals = createMetrics();
  const splitsByTransaction = buildSplitsByTransactionId(transactionSplits);
  const transactionLinkMap =
    buildTransactionLinkMapByTransactionId(transactionLinks);
  const allTransactionsById = new Map(
    allTransactions.map((transaction) => [transaction.id, transaction]),
  );
  const categoryAmountsByTransactionId = new Map();
  const processedLinkedCategoryKeys = new Set();
  const subcategoryTotals = new Map(
    (category.subcategories || []).map((subcategory) => [
      subcategory.id,
      {
        ...createSubcategoryNode(subcategory.id, subcategory.name),
        transactions: [],
      },
    ]),
  );

  const addCategoryAmount = (
    categoryId,
    bucket,
    amount,
    countedId,
    transactionDetail = null,
  ) => {
    if (!categoryId || !categoryIds.has(categoryId)) return;
    if (amount === 0) return;

    addToMetrics(totals, bucket, amount, countedId);

    if (subcategoryTotals.has(categoryId)) {
      const subcategoryNode = subcategoryTotals.get(categoryId);

      addToMetrics(subcategoryNode, bucket, amount, countedId);

      if (transactionDetail) {
        subcategoryNode.transactions.push(transactionDetail);
      }
    }
  };

  const getCategoryAmountsForTransaction = (transaction) => {
    if (!transaction) return new Map();
    if (categoryAmountsByTransactionId.has(transaction.id)) {
      return categoryAmountsByTransactionId.get(transaction.id);
    }

    const categoryAmounts = buildCategoryAmountsForTransaction(
      transaction,
      splitsByTransaction,
      categoryIds,
    );
    categoryAmountsByTransactionId.set(transaction.id, categoryAmounts);
    return categoryAmounts;
  };

  allTransactions.forEach((transaction) => {
    const transactionDate = parseDateValue(transaction.date);
    if (!transactionDate) return;

    if (
      !isDateInPeriod(
        transactionDate,
        resolvedPeriodConfig,
        normalizedStartDate,
        normalizedEndDate,
      )
    ) {
      return;
    }

    const bucket = getBucketForState(transaction.transactionState);
    if (!bucket) return;
    if (!showStateBreakdown && bucket !== 'completed') return;

    const categoryAmounts = getCategoryAmountsForTransaction(transaction);

    categoryAmounts.forEach((categoryAmount, categoryId) => {
      const transactionLink = transactionLinkMap.get(transaction.id) || null;
      const linkedTransactionId = getLinkedTransactionId(
        transactionLink,
        transaction.id,
      );
      const linkedTransaction = linkedTransactionId
        ? allTransactionsById.get(linkedTransactionId) || null
        : null;
      const linkedTransactionDate = linkedTransaction
        ? parseDateValue(linkedTransaction.date)
        : null;
      const linkedBucket = linkedTransaction
        ? getBucketForState(linkedTransaction.transactionState)
        : null;
      const linkedTransactionInScope =
        linkedTransaction &&
        linkedTransactionDate &&
        linkedBucket &&
        (showStateBreakdown || linkedBucket === 'completed') &&
        linkedBucket === bucket &&
        isDateInPeriod(
          linkedTransactionDate,
          resolvedPeriodConfig,
          normalizedStartDate,
          normalizedEndDate,
        );
      const linkedCategoryAmount = linkedTransactionInScope
        ? getCategoryAmountsForTransaction(linkedTransaction).get(categoryId) ||
          null
        : null;

      if (linkedTransaction && linkedCategoryAmount) {
        const pairKey = buildLinkPairKey(transaction.id, linkedTransaction.id);
        const pairCategoryKey = `${pairKey}:${categoryId}:${bucket}`;

        if (processedLinkedCategoryKeys.has(pairCategoryKey)) {
          return;
        }

        processedLinkedCategoryKeys.add(pairCategoryKey);

        const primaryTransaction =
          transactionLink?.sourceTransactionId === transaction.id
            ? transaction
            : linkedTransaction;
        const secondaryTransaction =
          primaryTransaction.id === transaction.id ? linkedTransaction : transaction;
        const primaryCategoryAmount =
          primaryTransaction.id === transaction.id
            ? categoryAmount
            : linkedCategoryAmount;
        const secondaryCategoryAmount =
          primaryTransaction.id === transaction.id
            ? linkedCategoryAmount
            : categoryAmount;

        addCategoryAmount(
          categoryId,
          bucket,
          primaryCategoryAmount.amount,
          pairKey,
          subcategoryTotals.has(categoryId)
            ? {
                id: `${pairKey}:${categoryId}`,
                sourceType: 'linked-transaction',
                transactionId: primaryTransaction.id,
                linkedTransactionId: secondaryTransaction.id,
                transactionIds: [primaryTransaction.id, secondaryTransaction.id],
                date: primaryTransaction.date,
                accountId: primaryTransaction.accountId ?? null,
                linkedAccountId: secondaryTransaction.accountId ?? null,
                accountIds: [
                  primaryTransaction.accountId ?? null,
                  secondaryTransaction.accountId ?? null,
                ],
                categoryId,
                description:
                  primaryTransaction.description ||
                  secondaryTransaction.description ||
                  '',
                amount: primaryCategoryAmount.amount,
                linkedAmount: secondaryCategoryAmount.amount,
                transactionState: primaryTransaction.transactionState,
              }
            : null,
        );
        return;
      }

      addCategoryAmount(
        categoryId,
        bucket,
        categoryAmount.amount,
        transaction.id,
        subcategoryTotals.has(categoryId)
          ? {
            id: `${transaction.id}:${categoryId}`,
            sourceType: categoryAmount.isSplitEntry
              ? 'transaction-split'
              : 'transaction',
            transactionId: transaction.id,
            date: transaction.date,
            accountId: transaction.accountId ?? null,
            categoryId,
            splitIds: categoryAmount.splitIds,
            description: transaction.description || '',
            amount: categoryAmount.amount,
            transactionState: transaction.transactionState,
          }
          : null,
      );
    });
  });

  if (showStateBreakdown) {
    const recurringStartDate = getRecurringRangeStart(
      normalizedStartDate,
      referenceDate,
    );

    if (!isAfter(recurringStartDate, normalizedEndDate)) {
      recurringTransactions.forEach((rule) => {
        if (!rule.categoryId || !categoryIds.has(rule.categoryId)) return;

        generateOccurrenceDates(
          rule,
          recurringStartDate,
          normalizedEndDate,
        ).forEach((dateString) => {
          const occurrenceId = `${rule.id}:${dateString}`;
          if (realizedDatesMap.has(occurrenceId)) return;
          if (
            !isDateInPeriod(
              dateString,
              resolvedPeriodConfig,
              normalizedStartDate,
              normalizedEndDate,
            )
          ) {
            return;
          }

          addCategoryAmount(
            rule.categoryId,
            'planned',
            Number(rule.amount) || 0,
            occurrenceId,
            subcategoryTotals.has(rule.categoryId)
              ? {
                  id: `${occurrenceId}:${rule.categoryId}`,
                  sourceType: 'recurring',
                  recurringTransactionId: rule.id,
                  date: dateString,
                  accountId: rule.accountId ?? null,
                  categoryId: rule.categoryId,
                  description: rule.description || '',
                  amount: Number(rule.amount) || 0,
                  transactionState: 'recurring',
                }
              : null,
          );
        });
      });
    }
  }

  return {
    totals: finalizeMetrics(totals, totals.total, safeMonths),
    subcategoryTotals: Array.from(subcategoryTotals.values())
      .map((subcategory) => ({
        ...finalizeMetrics(subcategory, totals.total, safeMonths),
        transactions: [...subcategory.transactions].sort(sortTransactionDetails),
      }))
      .filter((subcategory) => subcategory.total !== 0)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total)),
    showStateBreakdown,
  };
}
