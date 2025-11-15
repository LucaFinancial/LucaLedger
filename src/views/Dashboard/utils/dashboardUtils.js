import { centsToDollars, doublePrecisionFormatString } from '@/utils';

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
