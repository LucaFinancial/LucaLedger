import { format, isValid, parseISO } from 'date-fns';
import { AccountType, AccountTypeOptions } from './constants';

const ACCOUNT_TYPES_INCLUDED_IN_BALANCE_TOTALS = new Set(
  [AccountType.CHECKING, AccountType.SAVINGS, AccountType.CASH].filter(Boolean),
);

export const isAccountClosed = (account) => Boolean(account?.closedAt);

export const formatAccountType = (accountType = '') =>
  accountType
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const sortAccountTypes = (accountTypes = AccountTypeOptions) =>
  [...accountTypes].sort((left, right) =>
    formatAccountType(left).localeCompare(formatAccountType(right)),
  );

export const isCreditCardAccountType = (accountType) =>
  accountType === AccountType.CREDIT_CARD;

export const isIncludedInBalanceTotals = (accountType) =>
  ACCOUNT_TYPES_INCLUDED_IN_BALANCE_TOTALS.has(accountType);

export const formatAccountClosedAt = (
  closedAt,
  formatString = 'MMM d, yyyy',
) => {
  if (!closedAt) {
    return null;
  }

  try {
    const parsedDate = parseISO(closedAt);

    if (!isValid(parsedDate)) {
      return null;
    }

    return format(parsedDate, formatString);
  } catch {
    return null;
  }
};
