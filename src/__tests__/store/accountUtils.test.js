import { describe, expect, it } from 'vitest';

import { AccountType, AccountTypeOptions } from '@/store/accounts/constants';
import {
  formatAccountClosedAt,
  formatAccountType,
  isCreditCardAccountType,
  isAccountClosed,
  isIncludedInBalanceTotals,
  sortAccountTypes,
} from '@/store/accounts/utils';

describe('account utils', () => {
  it('treats accounts with a closedAt timestamp as closed', () => {
    expect(isAccountClosed({ closedAt: '2025-02-14T00:00:00.000Z' })).toBe(
      true,
    );
  });

  it('treats accounts without a closedAt timestamp as open', () => {
    expect(isAccountClosed({ closedAt: null })).toBe(false);
    expect(isAccountClosed({})).toBe(false);
  });

  it('formats closedAt dates for UI display', () => {
    expect(formatAccountClosedAt('2025-02-14T12:00:00.000Z')).toBe(
      'Feb 14, 2025',
    );
  });

  it('returns null for missing or invalid closedAt dates', () => {
    expect(formatAccountClosedAt(null)).toBeNull();
    expect(formatAccountClosedAt('not-a-date')).toBeNull();
  });

  it('formats account types for display', () => {
    expect(formatAccountType(AccountType.CREDIT_CARD)).toBe('Credit Card');
    expect(formatAccountType(AccountType.ESCROW)).toBe('Escrow');
  });

  it('sorts account types by their display label', () => {
    expect(
      sortAccountTypes([
        AccountType.ESCROW,
        AccountType.CREDIT_CARD,
        AccountType.CASH,
      ]),
    ).toEqual([AccountType.CASH, AccountType.CREDIT_CARD, AccountType.ESCROW]);
  });

  it('exposes account types from the shared schema enum', () => {
    expect(AccountTypeOptions).toContain(AccountType.CASH);
    expect(AccountTypeOptions).toContain(AccountType.ESCROW);
  });

  it('only includes liquid cash account types in dashboard balance totals', () => {
    expect(isIncludedInBalanceTotals(AccountType.CHECKING)).toBe(true);
    expect(isIncludedInBalanceTotals(AccountType.SAVINGS)).toBe(true);
    expect(isIncludedInBalanceTotals(AccountType.CASH)).toBe(true);
    expect(isIncludedInBalanceTotals(AccountType.ESCROW)).toBe(false);
    expect(isIncludedInBalanceTotals(AccountType.EXTERNAL)).toBe(false);
    expect(isIncludedInBalanceTotals(AccountType.CREDIT_CARD)).toBe(false);
    expect(isCreditCardAccountType(AccountType.CREDIT_CARD)).toBe(true);
  });
});
