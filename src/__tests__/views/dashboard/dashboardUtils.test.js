import { describe, expect, it } from 'vitest';

import {
  buildCombinedDashboardBalances,
  filterDashboardAccounts,
  filterRecurringTransactionsByAccountIds,
  filterTransactionSplitsByTransactionIds,
  filterTransactionsByAccountIds,
  getDefaultExcludedDashboardAccountIds,
} from '@/views/Dashboard/utils/dashboardUtils';

describe('dashboardUtils filters', () => {
  const accounts = [
    { id: 'checking', name: 'Checking', closedAt: null },
    { id: 'closed-card', name: 'Old Card', closedAt: '2025-01-01T00:00:00.000Z' },
    { id: 'savings', name: 'Savings', closedAt: null },
  ];

  it('can exclude closed accounts and manually excluded accounts', () => {
    const filteredAccounts = filterDashboardAccounts(accounts, {
      excludeClosedAccounts: true,
      excludedAccountIds: ['savings'],
    });

    expect(filteredAccounts.map((account) => account.id)).toEqual(['checking']);
  });

  it('defaults escrow accounts to excluded in dashboard analytics', () => {
    expect(
      getDefaultExcludedDashboardAccountIds([
        { id: 'checking', type: 'CHECKING' },
        { id: 'escrow-1', type: 'ESCROW' },
        { id: 'escrow-2', type: 'ESCROW' },
      ]),
    ).toEqual(['escrow-1', 'escrow-2']);
  });

  it('builds current and projected cash/card balances for the dashboard', () => {
    expect(
      buildCombinedDashboardBalances({
        totals: { current: 125000 },
        creditCardTotals: { current: 18000 },
        remainingMonthTotals: {
          balance: -22000,
          creditCardPayments: 4500,
          creditCardExpenses: 6700,
        },
      }),
    ).toEqual({
      current: 125000,
      creditCardCurrent: 18000,
      projected: 103000,
      creditCardProjected: 20200,
    });
  });

  it('filters transactions by included account ids', () => {
    const filteredTransactions = filterTransactionsByAccountIds(
      [
        { id: 'tx-1', accountId: 'checking' },
        { id: 'tx-2', accountId: 'closed-card' },
        { id: 'tx-3', accountId: 'savings' },
      ],
      ['checking', 'savings'],
    );

    expect(filteredTransactions.map((transaction) => transaction.id)).toEqual([
      'tx-1',
      'tx-3',
    ]);
  });

  it('filters recurring transactions and splits for included analytics data', () => {
    const filteredRecurringTransactions = filterRecurringTransactionsByAccountIds(
      [
        { id: 'rt-1', accountId: 'checking' },
        { id: 'rt-2', accountId: 'closed-card' },
      ],
      ['checking'],
    );

    const filteredSplits = filterTransactionSplitsByTransactionIds(
      [
        { id: 'split-1', transactionId: 'tx-1' },
        { id: 'split-2', transactionId: 'tx-2' },
      ],
      ['tx-2'],
    );

    expect(filteredRecurringTransactions.map((transaction) => transaction.id)).toEqual([
      'rt-1',
    ]);
    expect(filteredSplits.map((split) => split.id)).toEqual(['split-2']);
  });
});
