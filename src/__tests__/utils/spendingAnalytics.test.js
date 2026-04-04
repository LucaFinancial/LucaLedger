import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildAvailableSpendingPeriods,
  buildCategoryTotalsData,
  buildDashboardSpendingHistoryData,
} from '@/utils/spendingAnalytics';

const categories = [
  {
    id: 'food',
    name: 'Food',
    slug: 'food',
    parentId: null,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    parentId: 'food',
  },
  {
    id: 'dining',
    name: 'Dining Out',
    parentId: 'food',
  },
  {
    id: 'income',
    name: 'Income',
    slug: 'income',
    parentId: null,
  },
  {
    id: 'salary',
    name: 'Salary',
    parentId: 'income',
  },
  {
    id: 'transfers',
    name: 'Transfers',
    slug: 'transfers',
    parentId: null,
  },
  {
    id: 'between-accounts',
    name: 'Between Accounts',
    parentId: 'transfers',
  },
];

const transactions = [
  {
    id: 'tx-2025-completed',
    date: '2025-11-05',
    amount: -1200,
    categoryId: 'groceries',
    transactionState: 'COMPLETED',
  },
  {
    id: 'tx-2025-pending',
    date: '2025-12-20',
    amount: -900,
    categoryId: 'groceries',
    transactionState: 'PENDING',
  },
  {
    id: 'tx-completed',
    date: '2026-01-10',
    amount: -5000,
    categoryId: 'groceries',
    transactionState: 'COMPLETED',
  },
  {
    id: 'tx-split',
    date: '2026-04-05',
    amount: -7000,
    categoryId: null,
    transactionState: 'COMPLETED',
  },
  {
    id: 'tx-pending',
    date: '2026-04-10',
    amount: -2000,
    categoryId: 'dining',
    transactionState: 'PENDING',
  },
  {
    id: 'tx-scheduled',
    date: '2026-12-01',
    amount: -8000,
    categoryId: 'food',
    transactionState: 'SCHEDULED',
  },
  {
    id: 'tx-planned',
    date: '2026-06-15',
    amount: -3000,
    categoryId: 'groceries',
    transactionState: 'PLANNED',
  },
  {
    id: 'tx-income',
    date: '2026-02-01',
    amount: 100000,
    categoryId: 'salary',
    transactionState: 'COMPLETED',
  },
  {
    id: 'tx-transfer',
    date: '2026-03-01',
    amount: -2500,
    categoryId: 'between-accounts',
    transactionState: 'COMPLETED',
  },
];

const transactionSplits = [
  {
    id: 'split-1',
    transactionId: 'tx-split',
    categoryId: 'groceries',
    amount: -4000,
  },
  {
    id: 'split-2',
    transactionId: 'tx-split',
    categoryId: 'dining',
    amount: -3000,
  },
];

const recurringTransactions = [
  {
    id: 'rt-food',
    categoryId: 'dining',
    amount: -1500,
    frequency: 'MONTH',
    interval: 1,
    startOn: '2026-04-20',
    endOn: null,
  },
  {
    id: 'rt-income',
    categoryId: 'salary',
    amount: 20000,
    frequency: 'MONTH',
    interval: 1,
    startOn: '2026-04-15',
    endOn: null,
  },
];

const realizedDatesMap = new Map([['rt-food:2026-06-20', 'realized-tx']]);

describe('spendingAnalytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds dashboard state totals for current-year ranges and includes recurring planned spending', () => {
    const result = buildDashboardSpendingHistoryData({
      allTransactions: transactions,
      transactionSplits,
      categories,
      recurringTransactions,
      realizedDatesMap,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T00:00:00Z'),
      numMonths: 12,
      referenceDate: new Date('2026-04-03T12:00:00Z'),
    });

    expect(result.showStateBreakdown).toBe(true);
    expect(result.stateTotals.completed).toBe(12000);
    expect(result.stateTotals.pending).toBe(2000);
    expect(result.stateTotals.scheduled).toBe(8000);
    expect(result.stateTotals.planned).toBe(15000);
    expect(result.totalExpenses).toBe(37000);
    expect(result.totalTransactions).toBe(13);

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({
      id: 'food',
      completed: 12000,
      pending: 2000,
      scheduled: 8000,
      planned: 15000,
      total: 37000,
    });
    expect(result.categories[0].subcategories).toEqual([
      expect.objectContaining({
        id: 'dining',
        completed: 3000,
        pending: 2000,
        planned: 12000,
        total: 17000,
      }),
      expect.objectContaining({
        id: 'groceries',
        completed: 9000,
        planned: 3000,
        total: 12000,
      }),
    ]);
  });

  it('keeps all-historical dashboard ranges on completed-only totals', () => {
    const result = buildDashboardSpendingHistoryData({
      allTransactions: transactions,
      transactionSplits,
      categories,
      recurringTransactions,
      realizedDatesMap,
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2025-12-31T00:00:00Z'),
      numMonths: 12,
      referenceDate: new Date('2026-04-03T12:00:00Z'),
    });

    expect(result.showStateBreakdown).toBe(false);
    expect(result.totalExpenses).toBe(1200);
    expect(result.totalTransactions).toBe(1);
    expect(result.stateTotals.completed).toBe(1200);
    expect(result.stateTotals.pending).toBe(0);
    expect(result.stateTotals.planned).toBe(0);
    expect(result.categories).toEqual([
      expect.objectContaining({
        id: 'food',
        total: 1200,
        count: 1,
      }),
    ]);
  });

  it('builds signed category totals and category-specific period options', () => {
    const result = buildCategoryTotalsData({
      category: {
        id: 'food',
        name: 'Food',
        subcategories: [
          { id: 'groceries', name: 'Groceries' },
          { id: 'dining', name: 'Dining Out' },
        ],
      },
      allTransactions: transactions,
      transactionSplits,
      recurringTransactions,
      realizedDatesMap,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T00:00:00Z'),
      referenceDate: new Date('2026-04-03T12:00:00Z'),
    });

    expect(result.showStateBreakdown).toBe(true);
    expect(result.totals).toMatchObject({
      completed: -12000,
      pending: -2000,
      scheduled: -8000,
      planned: -15000,
      total: -37000,
    });
    expect(result.subcategoryTotals).toEqual([
      expect.objectContaining({
        id: 'dining',
        completed: -3000,
        pending: -2000,
        planned: -12000,
        total: -17000,
      }),
      expect.objectContaining({
        id: 'groceries',
        completed: -9000,
        planned: -3000,
        total: -12000,
      }),
    ]);

    const periods = buildAvailableSpendingPeriods({
      allTransactions: transactions,
      transactionSplits,
      recurringTransactions,
      realizedDatesMap,
      projectionEndDate: new Date('2027-04-03T00:00:00Z'),
      referenceDate: new Date('2026-04-03T12:00:00Z'),
      categoryIdFilter: (categoryId) =>
        new Set(['food', 'groceries', 'dining']).has(categoryId),
    });

    expect(periods.availableMonths).toContain('2026-04');
    expect(periods.availableMonths).toContain('2025-11');
    expect(periods.availableMonths).toContain('2027-03');
    expect(periods.availableYears).toContain(2026);
    expect(periods.availableYears).toContain(2027);
  });
});
