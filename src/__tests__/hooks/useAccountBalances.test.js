import { describe, expect, it } from 'vitest';

import { AccountType } from '@/store/accounts/constants';
import { TransactionStateEnum } from '@/store/transactions/constants';
import { buildAccountBalanceSummary } from '@/hooks/useAccountBalances';

describe('buildAccountBalanceSummary', () => {
  it('uses completed transactions for the current combined savings/checking balance', () => {
    const accounts = [
      { id: 'checking-1', type: AccountType.CHECKING },
      { id: 'savings-1', type: AccountType.SAVINGS },
      { id: 'cash-1', type: AccountType.CASH },
      { id: 'escrow-1', type: AccountType.ESCROW },
      { id: 'external-1', type: AccountType.EXTERNAL },
      { id: 'credit-1', type: AccountType.CREDIT_CARD },
    ];

    const transactions = [
      {
        id: 'tx-1',
        accountId: 'checking-1',
        amount: 50000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-2',
        accountId: 'checking-1',
        amount: -12000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-3',
        accountId: 'savings-1',
        amount: 8000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-4',
        accountId: 'cash-1',
        amount: 2500,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-5',
        accountId: 'escrow-1',
        amount: 20000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-6',
        accountId: 'external-1',
        amount: 100000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
      {
        id: 'tx-7',
        accountId: 'checking-1',
        amount: -3000,
        transactionState: TransactionStateEnum.PENDING,
      },
      {
        id: 'tx-8',
        accountId: 'credit-1',
        amount: -10000,
        transactionState: TransactionStateEnum.COMPLETED,
      },
    ];

    const summary = buildAccountBalanceSummary(accounts, transactions);

    expect(summary.totals.current).toBe(48500);
    expect(summary.totals.pending).toBe(45500);
    expect(summary.creditCardTotals.current).toBe(10000);
  });
});
