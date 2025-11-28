/**
 * Utility functions for statement period calculations and auto-generation
 */

import {
  parseISO,
  endOfMonth,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  format,
  min,
} from 'date-fns';

/**
 * Calculate the statement period for a given date and statement day
 * @param {string} dateStr - Date in YYYY/MM/DD format
 * @param {number} statementDay - Day of month when statement closes (1-31)
 * @returns {object} - { periodStart, periodEnd, closingDate } in YYYY/MM/DD format
 */
export function calculateStatementPeriod(dateStr, statementDay) {
  // Convert slash format to hyphen format for parseISO
  const date = parseISO(dateStr.replace(/\//g, '-'));
  const dayOfMonth = date.getDate();

  let closingDate;

  // If we're before or on the statement day, the period ends this month
  if (dayOfMonth <= statementDay) {
    // Closing date is this month's statement day
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDayOfMonth = endOfMonth(date).getDate();
    const actualDay = Math.min(statementDay, lastDayOfMonth);
    closingDate = new Date(year, month, actualDay);
  } else {
    // If we're after the statement day, the period ends next month
    const nextMonth = addMonths(date, 1);
    const year = nextMonth.getFullYear();
    const month = nextMonth.getMonth();
    const lastDayOfMonth = endOfMonth(nextMonth).getDate();
    const actualDay = Math.min(statementDay, lastDayOfMonth);
    closingDate = new Date(year, month, actualDay);
  }

  // Period ends on the closing date
  const periodEnd = closingDate;

  // Period starts the day after the previous closing date
  const prevMonth = subMonths(closingDate, 1);
  const prevYear = prevMonth.getFullYear();
  const prevMonthNum = prevMonth.getMonth();
  const lastDayOfPrevMonth = endOfMonth(prevMonth).getDate();
  const prevActualDay = Math.min(statementDay, lastDayOfPrevMonth);
  const prevClosingDate = new Date(prevYear, prevMonthNum, prevActualDay);

  // Start is the day after previous closing
  const periodStart = new Date(prevClosingDate);
  periodStart.setDate(periodStart.getDate() + 1);

  // Convert to YYYY/MM/DD format with slashes
  return {
    closingDate: format(closingDate, 'yyyy/MM/dd'),
    periodStart: format(periodStart, 'yyyy/MM/dd'),
    periodEnd: format(periodEnd, 'yyyy/MM/dd'),
  };
}

/**
 * Get the current statement period for an account
 * @param {number} statementDay - Day of month when statement closes (1-31)
 * @returns {object} - { periodStart, periodEnd, closingDate } in YYYY/MM/DD format
 */
export function getCurrentPeriod(statementDay) {
  const today = format(new Date(), 'yyyy/MM/dd');
  return calculateStatementPeriod(today, statementDay);
}

/**
 * Get the previous statement period relative to a given closing date
 * @param {string} closingDate - Closing date in YYYY/MM/DD format
 * @param {number} statementDay - Day of month when statement closes (1-31)
 * @returns {object} - { periodStart, periodEnd, closingDate } in YYYY/MM/DD format
 */
export function getPreviousPeriod(closingDate, statementDay) {
  // Parse the closing date and go back one day to get into previous period
  const date = parseISO(closingDate.replace(/\//g, '-'));
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = format(prevDate, 'yyyy/MM/dd');

  return calculateStatementPeriod(prevDateStr, statementDay);
}

/**
 * Check if a statement already exists for a given period and account
 * @param {Array} statements - Array of all statements
 * @param {string} accountId - Account ID
 * @param {string} closingDate - Closing date in YYYY/MM/DD format
 * @returns {boolean} - True if statement exists
 */
export function statementExistsForPeriod(statements, accountId, closingDate) {
  return statements.some(
    (stmt) => stmt.accountId === accountId && stmt.closingDate === closingDate
  );
}

/**
 * Calculate transactions that fall within a statement period
 * @param {Array} transactions - Array of all transactions
 * @param {string} accountId - Account ID
 * @param {string} periodStart - Period start date in YYYY/MM/DD format
 * @param {string} periodEnd - Period end date in YYYY/MM/DD format
 * @returns {Array} - Array of transaction IDs that fall in the period
 */
export function getTransactionsInPeriod(
  transactions,
  accountId,
  periodStart,
  periodEnd
) {
  const startDate = parseISO(periodStart.replace(/\//g, '-'));
  const endDate = parseISO(periodEnd.replace(/\//g, '-'));

  return transactions
    .filter((t) => {
      if (t.accountId !== accountId) return false;
      const txDate = parseISO(t.date.replace(/\//g, '-'));
      return !isBefore(txDate, startDate) && !isAfter(txDate, endDate);
    })
    .map((t) => t.id);
}

/**
 * Calculate total amount for transactions in a period
 * @param {Array} transactions - Array of all transactions
 * @param {Array} transactionIds - Array of transaction IDs to sum
 * @returns {number} - Total amount in cents
 */
export function calculatePeriodTotal(transactions, transactionIds) {
  return transactionIds.reduce((sum, id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return sum;
    return sum + transaction.amount;
  }, 0);
}

/**
 * Determine the earliest date we should generate statements for an account
 * @param {object} account - Account object with createdAt timestamp
 * @param {Array} transactions - Array of transactions for this account
 * @returns {string} - Date in YYYY/MM/DD format
 */
export function getEarliestStatementDate(account, transactions) {
  // Get account creation date
  const accountCreated = account.createdAt
    ? new Date(account.createdAt)
    : new Date();

  // Get earliest transaction date for this account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === account.id
  );

  if (accountTransactions.length === 0) {
    return format(accountCreated, 'yyyy/MM/dd');
  }

  const earliestTxDate = accountTransactions.reduce(
    (earliest, t) => {
      const txDate = parseISO(t.date.replace(/\//g, '-'));
      return isBefore(txDate, earliest) ? txDate : earliest;
    },
    parseISO(accountTransactions[0].date.replace(/\//g, '-'))
  );

  // Use whichever is earlier
  const earliestDate = min([accountCreated, earliestTxDate]);
  return format(earliestDate, 'yyyy/MM/dd');
}

/**
 * Determine if a date is in the past, present, or future relative to today
 * @param {string} closingDate - Closing date in YYYY/MM/DD format
 * @returns {string} - 'past', 'current', or 'future'
 */
export function determineStatementStatus(closingDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = parseISO(closingDate.replace(/\//g, '-'));
  closing.setHours(0, 0, 0, 0);

  if (isBefore(closing, today)) {
    return 'past';
  } else if (isAfter(closing, today)) {
    return 'draft';
  } else {
    return 'current';
  }
}

/**
 * Generate all missing statements for an account from earliest date to current period
 * @param {object} account - Account object
 * @param {Array} statements - Existing statements for this account
 * @param {Array} transactions - All transactions for this account
 * @returns {Array} - Array of statement period definitions to create
 */
export function getMissingStatementPeriods(account, statements, transactions) {
  const { statementDay } = account;
  if (!statementDay) return [];

  const missingPeriods = [];
  const earliestDate = getEarliestStatementDate(account, transactions);
  const currentPeriod = getCurrentPeriod(statementDay);

  // Start from the earliest date and walk forward
  let period = calculateStatementPeriod(earliestDate, statementDay);
  const currentClosing = parseISO(
    currentPeriod.closingDate.replace(/\//g, '-')
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const periodClosing = parseISO(period.closingDate.replace(/\//g, '-'));

    // Stop if we've gone beyond the current period
    if (isAfter(periodClosing, currentClosing)) {
      break;
    }

    // Check if statement exists for this period
    if (!statementExistsForPeriod(statements, account.id, period.closingDate)) {
      // Get transactions for this period
      const transactionIds = getTransactionsInPeriod(
        transactions,
        account.id,
        period.periodStart,
        period.periodEnd
      );

      // Calculate total
      const total = calculatePeriodTotal(transactions, transactionIds);

      // Determine status
      const status = determineStatementStatus(period.closingDate);

      missingPeriods.push({
        accountId: account.id,
        closingDate: period.closingDate,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        transactionIds,
        total,
        status,
      });
    }

    // Move to next period
    period = getPreviousPeriod(period.closingDate, statementDay);
    // Actually we want to move forward, so let's calculate the next period
    // by going forward one month from the current closing date
    const nextMonth = addMonths(
      parseISO(period.closingDate.replace(/\//g, '-')),
      2 // Add 2 because we went back 1, so we need to go forward 2 total
    );
    const nextDateStr = format(nextMonth, 'yyyy/MM/dd');
    period = calculateStatementPeriod(nextDateStr, statementDay);
  }

  return missingPeriods;
}
