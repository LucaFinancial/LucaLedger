import { centsToDollars, doublePrecisionFormatString } from '@/utils';
import { AccountType } from '@/store/accounts/constants';
import { utils as accountUtils } from '@/store/accounts';

/**
 * Format an amount in cents to currency string
 * @param {number} amount - Amount in cents
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return `$${doublePrecisionFormatString(centsToDollars(amount))}`;
}

/**
 * Format transaction amount as absolute value (no negative sign)
 * The color already indicates if it's income (green) or expense (red)
 * @param {number} amount - Transaction amount in cents
 * @returns {string} Formatted currency string
 */
export function formatTransactionAmount(amount) {
  return formatCurrency(Math.abs(amount));
}

/**
 * Get account name from account map
 * @param {Object} accountMap - Map of account IDs to account objects
 * @param {string} accountId - Account ID to lookup
 * @returns {string} Account name or 'Unknown Account'
 */
export function getAccountName(accountMap, accountId) {
  return accountMap[accountId]?.name || 'Unknown Account';
}

/**
 * Create account lookup map for performance
 * @param {Array} accounts - Array of account objects
 * @returns {Object} Map of account IDs to account info
 */
export function createAccountMap(accounts) {
  return accounts.reduce((map, account) => {
    map[account.id] = { name: account.name, type: account.type };
    return map;
  }, {});
}

export function getDefaultExcludedDashboardAccountIds(accounts = []) {
  return accounts
    .filter((account) => account.type === AccountType.ESCROW)
    .map((account) => account.id);
}

export function buildCombinedDashboardBalances({
  totals = {},
  creditCardTotals = {},
  remainingMonthTotals = {},
} = {}) {
  const current = totals.current || 0;
  const creditCardCurrent = creditCardTotals.current || 0;
  const projected = current + (remainingMonthTotals.balance || 0);
  const creditCardProjected =
    creditCardCurrent +
    (remainingMonthTotals.creditCardExpenses || 0) -
    (remainingMonthTotals.creditCardPayments || 0);

  return {
    current,
    creditCardCurrent,
    projected,
    creditCardProjected,
  };
}

export function filterDashboardAccounts(
  accounts,
  { excludeClosedAccounts = false, excludedAccountIds = [] } = {},
) {
  const excludedAccountIdSet = new Set(excludedAccountIds);

  return accounts.filter((account) => {
    if (excludeClosedAccounts && accountUtils.isAccountClosed(account)) {
      return false;
    }

    return !excludedAccountIdSet.has(account.id);
  });
}

export function filterTransactionsByAccountIds(transactions, accountIds = []) {
  const accountIdSet =
    accountIds instanceof Set ? accountIds : new Set(accountIds);

  return transactions.filter((transaction) =>
    accountIdSet.has(transaction.accountId),
  );
}

export function filterRecurringTransactionsByAccountIds(
  recurringTransactions,
  accountIds = [],
) {
  const accountIdSet =
    accountIds instanceof Set ? accountIds : new Set(accountIds);

  return recurringTransactions.filter((transaction) =>
    accountIdSet.has(transaction.accountId),
  );
}

export function filterTransactionSplitsByTransactionIds(
  transactionSplits,
  transactionIds = [],
) {
  const transactionIdSet =
    transactionIds instanceof Set ? transactionIds : new Set(transactionIds);

  return transactionSplits.filter((split) =>
    transactionIdSet.has(split.transactionId),
  );
}
