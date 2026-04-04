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
import { buildCategoriesById, buildSplitsByTransactionId } from './transactionCategoryState';

export const AGGREGATE_PERIODS = Object.freeze([
  { key: 'last-3-months', label: '3 Months' },
  { key: 'ytd', label: 'YTD' },
  { key: 'last-12-months', label: '12 Months' },
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

const createCategoryNode = (id, name) => ({
  id,
  name,
  ...createMetrics(),
  subcategories: new Map(),
});

const createSubcategoryNode = (id, name) => ({
  id,
  name,
  ...createMetrics(),
});

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
    }));
  }

  return [
    {
      categoryId: transaction.categoryId ?? null,
      amount: Number(transaction.amount) || 0,
    },
  ];
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

const finalizeCategoryNode = (node, totalBase, safeMonths) => {
  const { subcategories, ...metrics } = node;
  const finalized = finalizeMetrics(metrics, totalBase, safeMonths);

  return {
    ...finalized,
    subcategories: Array.from(subcategories.values())
      .map((subcategory) =>
        finalizeMetrics(subcategory, finalized.total || 0, safeMonths),
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

export function getAggregatePeriodConfig(
  key,
  referenceDate = new Date(),
) {
  switch (key) {
    case 'last-3-months':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 3)),
        endDate: endOfMonth(subMonths(referenceDate, 1)),
        numMonths: 3,
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
        label: `YTD (${format(referenceDate, 'yyyy')})`,
      };
    }
    case 'last-12-months':
      return {
        startDate: startOfMonth(subMonths(referenceDate, 12)),
        endDate: endOfMonth(subMonths(referenceDate, 1)),
        numMonths: 12,
        label: 'Last 12 Months',
      };
    default:
      return getAggregatePeriodConfig('last-3-months', referenceDate);
  }
}

export function getSpendingPeriodConfig(
  selection,
  referenceDate = new Date(),
) {
  if (!selection?.type) {
    return getAggregatePeriodConfig('last-3-months', referenceDate);
  }

  if (selection.type === 'aggregate') {
    return getAggregatePeriodConfig(selection.value, referenceDate);
  }

  if (selection.type === 'month' && selection.value) {
    const monthDate = parse(selection.value, 'yyyy-MM', referenceDate);

    if (!isNaN(monthDate.getTime())) {
      return {
        startDate: startOfMonth(monthDate),
        endDate: endOfMonth(monthDate),
        numMonths: 1,
        label: format(monthDate, 'MMMM yyyy'),
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
        label: String(selection.value),
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

export function buildDashboardSpendingHistoryData({
  allTransactions = [],
  transactionSplits = [],
  categories = [],
  recurringTransactions = [],
  realizedDatesMap = EMPTY_REALIZED_DATES,
  startDate,
  endDate,
  numMonths = 1,
  referenceDate = new Date(),
}) {
  const normalizedStartDate = parseDateValue(startDate);
  const normalizedEndDate = parseDateValue(endDate);
  const safeMonths = Math.max(1, numMonths);

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
        createCategoryNode(categoryMeta.parentId, categoryMeta.parentName),
      );
    }

    return categoryTotals.get(categoryMeta.parentId);
  };

  const addCategoryAmount = (categoryId, bucket, amount, countedId) => {
    if (!categoryId || excludedCategoryIds.has(categoryId)) return;

    const categoryMeta = categoryLookup.get(categoryId);
    if (!categoryMeta) return;

    const normalizedAmount = Math.abs(amount);
    if (normalizedAmount === 0) return;

    const parentNode = getOrCreateParentNode(categoryMeta);
    addToMetrics(parentNode, bucket, normalizedAmount, countedId);
    addToMetrics(overallTotals, bucket, normalizedAmount, countedId);

    if (!categoryMeta.subcategoryId) return;

    if (!parentNode.subcategories.has(categoryMeta.subcategoryId)) {
      parentNode.subcategories.set(
        categoryMeta.subcategoryId,
        createSubcategoryNode(
          categoryMeta.subcategoryId,
          categoryMeta.subcategoryName,
        ),
      );
    }

    addToMetrics(
      parentNode.subcategories.get(categoryMeta.subcategoryId),
      bucket,
      normalizedAmount,
      countedId,
    );
  };

  allTransactions.forEach((transaction) => {
    const transactionDate = parseDateValue(transaction.date);
    if (!transactionDate) return;

    if (
      isBefore(transactionDate, normalizedStartDate) ||
      isAfter(transactionDate, normalizedEndDate)
    ) {
      return;
    }

    const bucket = getBucketForState(transaction.transactionState);
    if (!bucket) return;
    if (!showStateBreakdown && bucket !== 'completed') return;

    getTransactionEntries(transaction, splitsByTransaction).forEach((entry) => {
      addCategoryAmount(entry.categoryId, bucket, entry.amount, transaction.id);
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

        generateOccurrenceDates(
          rule,
          recurringStartDate,
          normalizedEndDate,
        ).forEach((dateString) => {
          const occurrenceId = `${rule.id}:${dateString}`;
          if (realizedDatesMap.has(occurrenceId)) return;

          addCategoryAmount(
            rule.categoryId,
            'planned',
            Number(rule.amount) || 0,
            occurrenceId,
          );
        });
      });
    }
  }

  const finalizedStateTotals = finalizeMetrics(overallTotals, overallTotals.total, safeMonths);
  const finalizedCategories = Array.from(categoryTotals.values())
    .map((category) =>
      finalizeCategoryNode(category, overallTotals.total || 0, safeMonths),
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
  transactionSplits = [],
  recurringTransactions = [],
  realizedDatesMap = EMPTY_REALIZED_DATES,
  startDate,
  endDate,
  referenceDate = new Date(),
}) {
  const normalizedStartDate = parseDateValue(startDate);
  const normalizedEndDate = parseDateValue(endDate);

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
  const subcategoryTotals = new Map(
    (category.subcategories || []).map((subcategory) => [
      subcategory.id,
      createSubcategoryNode(subcategory.id, subcategory.name),
    ]),
  );

  const addCategoryAmount = (categoryId, bucket, amount, countedId) => {
    if (!categoryId || !categoryIds.has(categoryId)) return;
    if (amount === 0) return;

    addToMetrics(totals, bucket, amount, countedId);

    if (subcategoryTotals.has(categoryId)) {
      addToMetrics(subcategoryTotals.get(categoryId), bucket, amount, countedId);
    }
  };

  allTransactions.forEach((transaction) => {
    const transactionDate = parseDateValue(transaction.date);
    if (!transactionDate) return;

    if (
      isBefore(transactionDate, normalizedStartDate) ||
      isAfter(transactionDate, normalizedEndDate)
    ) {
      return;
    }

    const bucket = getBucketForState(transaction.transactionState);
    if (!bucket) return;
    if (!showStateBreakdown && bucket !== 'completed') return;

    getTransactionEntries(transaction, splitsByTransaction).forEach((entry) => {
      addCategoryAmount(entry.categoryId, bucket, entry.amount, transaction.id);
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

          addCategoryAmount(
            rule.categoryId,
            'planned',
            Number(rule.amount) || 0,
            occurrenceId,
          );
        });
      });
    }
  }

  return {
    totals: finalizeMetrics(totals, totals.total, 1),
    subcategoryTotals: Array.from(subcategoryTotals.values())
      .map((subcategory) => finalizeMetrics(subcategory, totals.total, 1))
      .filter((subcategory) => subcategory.total !== 0)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total)),
    showStateBreakdown,
  };
}
