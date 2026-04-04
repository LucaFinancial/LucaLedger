import { describe, expect, it, vi } from 'vitest';

import {
  buildMonthEndProjections,
  isRemainingMonthTransaction,
  sumTransactionTotals,
} from '@/views/Dashboard/hooks/useTransactionTotals';

describe('useTransactionTotals helpers', () => {
  const categorizeTransaction = (tx) => {
    if (tx.kind === 'income') {
      return { income: Math.abs(tx.amount), expense: 0 };
    }

    return { income: 0, expense: Math.abs(tx.amount) };
  };

  it('returns a balance that matches income minus expenses', () => {
    const totals = sumTransactionTotals(
      [
        { amount: 25000, kind: 'income' },
        { amount: -9000, kind: 'expense' },
        { amount: -4000, kind: 'expense' },
      ],
      categorizeTransaction,
    );

    expect(totals).toEqual({
      income: 25000,
      expenses: 13000,
      balance: 12000,
      netFlow: 12000,
    });
  });

  it('treats planned transactions as remaining month activity', () => {
    const dateRanges = {
      currentMonthStart: new Date('2026-04-01T00:00:00.000Z'),
      currentMonthEnd: new Date('2026-04-30T23:59:59.999Z'),
    };

    expect(
      isRemainingMonthTransaction(
        {
          date: '2026-04-22',
          transactionState: 'PLANNED',
        },
        dateRanges,
        vi.fn(() => false),
      ),
    ).toBe(true);
  });

  it('builds total month projections with a total balance', () => {
    const projection = buildMonthEndProjections(
      {
        income: 50000,
        expenses: 32000,
        balance: 18000,
      },
      {
        today: new Date('2026-04-10T12:00:00.000Z'),
        currentMonthEnd: new Date('2026-04-30T23:59:59.999Z'),
      },
    );

    expect(projection.totalIncome).toBe(50000);
    expect(projection.totalExpenses).toBe(32000);
    expect(projection.totalBalance).toBe(18000);
    expect(projection.projectedNetFlow).toBe(18000);
  });
});
