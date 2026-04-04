import { describe, expect, it } from 'vitest';
import { AccountType } from '@/store/accounts/constants';

import {
  buildCurrentMonthOverviewTotals,
  buildMonthEndProjections,
  combineOverviewTotals,
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

  it('builds current month totals from cash flow and card activity separately', () => {
    const accountMap = {
      checking: { type: AccountType.CHECKING },
      savings: { type: AccountType.SAVINGS },
      escrow: { type: AccountType.ESCROW },
      card: { type: AccountType.CREDIT_CARD },
    };

    const totals = buildCurrentMonthOverviewTotals(
      [
        { accountId: 'checking', amount: 3500, categoryId: 'groceries' },
        { accountId: 'checking', amount: 20000, categoryId: 'salary' },
        { accountId: 'checking', amount: -8000, categoryId: 'groceries' },
        { accountId: 'checking', amount: -2500, categoryId: 'cc-payment' },
        { accountId: 'checking', amount: 500, categoryId: 'account-transfer' },
        { accountId: 'card', amount: 9000, categoryId: 'groceries' },
        { accountId: 'card', amount: -1200, categoryId: 'groceries' },
        { accountId: 'card', amount: -2500, categoryId: 'cc-payment' },
        { accountId: 'savings', amount: 1500, categoryId: 'refund' },
        { accountId: 'escrow', amount: -700, categoryId: 'insurance' },
      ],
      accountMap,
      (tx) =>
        tx.categoryId === 'cc-payment' || tx.categoryId === 'account-transfer',
      (tx) => tx.categoryId === 'cc-payment',
      (tx) => tx.categoryId === 'salary',
    );

    expect(totals).toEqual({
      income: 20000,
      credits: 5000,
      incomeAndCredits: 25000,
      expenses: 11200,
      creditCardPayments: 2500,
      creditCardExpenses: 7800,
      balance: 13800,
      netFlow: 13800,
    });
  });

  it('treats transfer-based card payments as remaining month activity', () => {
    const dateRanges = {
      currentMonthStart: new Date('2026-04-01T00:00:00.000Z'),
      currentMonthEnd: new Date('2026-04-30T23:59:59.999Z'),
    };

    expect(
      isRemainingMonthTransaction(
        {
          date: '2026-04-22',
          transactionState: 'PENDING',
          categoryId: 'cc-payment',
        },
        dateRanges,
      ),
    ).toBe(true);
  });

  it('combines overview totals before building projections', () => {
    expect(
      combineOverviewTotals(
        {
          income: 42000,
          credits: 5000,
          expenses: 18000,
          creditCardPayments: 3000,
          creditCardExpenses: 7000,
        },
        {
          income: 8000,
          credits: 2000,
          expenses: 14000,
          creditCardPayments: 1500,
          creditCardExpenses: 2500,
        },
      ),
    ).toEqual({
      income: 50000,
      credits: 7000,
      incomeAndCredits: 57000,
      expenses: 32000,
      creditCardPayments: 4500,
      creditCardExpenses: 9500,
      balance: 25000,
      netFlow: 25000,
    });
  });

  it('builds total month projections with separated income and credits', () => {
    const projection = buildMonthEndProjections(
      {
        income: 42000,
        credits: 8000,
        incomeAndCredits: 50000,
        expenses: 32000,
        creditCardPayments: 4500,
        creditCardExpenses: 9500,
        balance: 18000,
      },
      {
        today: new Date('2026-04-10T12:00:00.000Z'),
        currentMonthEnd: new Date('2026-04-30T23:59:59.999Z'),
      },
    );

    expect(projection.totalIncome).toBe(42000);
    expect(projection.totalCredits).toBe(8000);
    expect(projection.totalIncomeAndCredits).toBe(50000);
    expect(projection.totalExpenses).toBe(32000);
    expect(projection.totalBalance).toBe(18000);
    expect(projection.totalCreditCardPayments).toBe(4500);
    expect(projection.totalCreditCardExpenses).toBe(9500);
    expect(projection.projectedIncome).toBe(42000);
    expect(projection.projectedCredits).toBe(8000);
    expect(projection.projectedIncomeAndCredits).toBe(50000);
    expect(projection.projectedCreditCardPayments).toBe(4500);
    expect(projection.projectedCreditCardExpenses).toBe(9500);
    expect(projection.projectedNetFlow).toBe(18000);
  });
});
