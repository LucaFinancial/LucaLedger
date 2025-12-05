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
 * Calculate statement period string from closing date
 * This is the canonical implementation used everywhere
 * @param {string} closingDate - Closing date in YYYY/MM/DD format
 * @returns {string} Period in YYYY-MM format
 */
export function calculateStatementPeriod(closingDate) {
  const date = parseISO(closingDate.replace(/\//g, '-'));
  return format(date, 'yyyy-MM');
}

/**
 * Calculate the statement period dates for a given date and statement day
 * @param {string} dateStr - Date in YYYY/MM/DD format
 * @param {number} statementDay - Day of month when statement closes (1-31)
 * @returns {object} - { periodStart, periodEnd, closingDate } in YYYY/MM/DD format
 */
export function calculateStatementDates(dateStr, statementDay) {
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
  return calculateStatementDates(today, statementDay);
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

  return calculateStatementDates(prevDateStr, statementDay);
}

/**
 * Get the next statement period relative to a given closing date
 * @param {string} closingDate - Closing date in YYYY/MM/DD format
 * @param {number} statementDay - Day of month when statement closes (1-31)
 * @returns {object} - { periodStart, periodEnd, closingDate } in YYYY/MM/DD format
 */
export function getNextPeriod(closingDate, statementDay) {
  // Parse the closing date and go forward one day to get into next period
  const date = parseISO(closingDate.replace(/\//g, '-'));
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = format(nextDate, 'yyyy/MM/dd');

  return calculateStatementDates(nextDateStr, statementDay);
}

/**
 * Check if a statement already exists for a given period and account
 * Uses the statementPeriod field for reliable period matching
 * @param {Array} statements - Array of all statements
 * @param {string} accountId - Account ID
 * @param {string} closingDate - Closing date in YYYY/MM/DD format (used to calculate target period)
 * @returns {boolean} - True if statement exists for this period
 */
export function statementExistsForPeriod(statements, accountId, closingDate) {
  // Parse the closing date to calculate the target period (YYYY-MM format)
  const closingDateParsed = parseISO(closingDate.replace(/\//g, '-'));
  const targetPeriod = format(closingDateParsed, 'yyyy-MM');

  // Check if any statement exists for this account with matching statementPeriod
  return statements.some((stmt) => {
    if (stmt.accountId !== accountId) return false;

    // If statement has the statementPeriod field, use it for comparison
    if (stmt.statementPeriod) {
      return stmt.statementPeriod === targetPeriod;
    }

    // Fallback for old statements without statementPeriod field
    // Parse the statement's periodStart to determine its period
    const stmtPeriodStart = parseISO(stmt.periodStart.replace(/\//g, '-'));
    const stmtPeriod = format(stmtPeriodStart, 'yyyy-MM');

    return stmtPeriod === targetPeriod;
  });
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
 * Summarize transactions for a statement period
 * @param {Array} transactions - Array of all transactions
 * @param {Array} transactionIds - Array of transaction IDs to sum
 * @returns {{totalCharges: number, totalPayments: number}}
 */
export function summarizeStatementTransactions(transactions, transactionIds) {
  return transactionIds.reduce(
    (acc, id) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return acc;
      const amount = Number(transaction.amount);
      if (Number.isNaN(amount)) {
        return acc;
      }

      if (amount >= 0) {
        acc.totalCharges += amount;
      } else {
        acc.totalPayments += Math.abs(amount);
      }
      return acc;
    },
    { totalCharges: 0, totalPayments: 0 }
  );
}

/**
 * Calculate statement balances dynamically from transactions
 * This is the centralized calculation that respects locked state
 *
 * @param {Object} statement - Statement object
 * @param {Array} transactions - All transactions
 * @param {Array} allStatements - All statements (for determining starting balance)
 * @param {boolean} forceRecalculate - Force recalculation even for locked statements
 * @returns {{startingBalance: number, endingBalance: number, totalCharges: number, totalPayments: number, isCalculated: boolean}}
 */
export function calculateStatementBalances(
  statement,
  transactions,
  allStatements = [],
  forceRecalculate = false
) {
  if (!statement) {
    return {
      startingBalance: 0,
      endingBalance: 0,
      totalCharges: 0,
      totalPayments: 0,
      isCalculated: false,
    };
  }

  // For locked statements, use stored values unless forced to recalculate
  if (statement.status === 'locked' && !forceRecalculate) {
    const startingBalance =
      typeof statement.startingBalance === 'number'
        ? statement.startingBalance
        : 0;
    const totalCharges =
      typeof statement.totalCharges === 'number' ? statement.totalCharges : 0;
    const totalPayments =
      typeof statement.totalPayments === 'number' ? statement.totalPayments : 0;
    const endingBalance =
      typeof statement.endingBalance === 'number'
        ? statement.endingBalance
        : typeof statement.total === 'number'
        ? statement.total
        : startingBalance + totalCharges - totalPayments;

    return {
      startingBalance,
      endingBalance,
      totalCharges,
      totalPayments,
      isCalculated: false,
    };
  }

  // For unlocked statements or forced recalculation, calculate from transactions
  const { totalCharges, totalPayments } = summarizeStatementTransactions(
    transactions,
    statement.transactionIds || []
  );

  // Calculate starting balance from previous statements
  let startingBalance = 0;
  if (statement.closingDate && allStatements.length > 0) {
    const closingDate = parseISO(statement.closingDate.replace(/\//g, '-'));
    const accountStatements = allStatements
      .filter((s) => s.accountId === statement.accountId)
      .filter((s) => {
        const sClosingDate = parseISO(s.closingDate.replace(/\//g, '-'));
        return sClosingDate < closingDate;
      })
      .sort((a, b) => a.closingDate.localeCompare(b.closingDate));

    if (accountStatements.length > 0) {
      const prevStatement = accountStatements[accountStatements.length - 1];
      startingBalance =
        typeof prevStatement.endingBalance === 'number'
          ? prevStatement.endingBalance
          : typeof prevStatement.total === 'number'
          ? prevStatement.total
          : 0;
    }
  }

  const endingBalance = startingBalance + totalCharges - totalPayments;

  return {
    startingBalance,
    endingBalance,
    totalCharges,
    totalPayments,
    isCalculated: true,
  };
}

/**
 * Check if a locked statement is out of sync with current transaction data
 *
 * @param {Object} statement - Statement object
 * @param {Array} transactions - All transactions
 * @param {Array} allStatements - All statements
 * @returns {boolean} - True if statement is out of sync
 */
export function isStatementOutOfSync(statement, transactions, allStatements) {
  if (!statement || statement.status !== 'locked') {
    return false;
  }

  // Calculate what the values should be based on current transactions
  const calculated = calculateStatementBalances(
    statement,
    transactions,
    allStatements,
    true // Force recalculation
  );

  // Compare with stored values
  const storedStarting =
    typeof statement.startingBalance === 'number'
      ? statement.startingBalance
      : 0;
  const storedEnding =
    typeof statement.endingBalance === 'number'
      ? statement.endingBalance
      : typeof statement.total === 'number'
      ? statement.total
      : 0;
  const storedCharges =
    typeof statement.totalCharges === 'number' ? statement.totalCharges : 0;
  const storedPayments =
    typeof statement.totalPayments === 'number' ? statement.totalPayments : 0;

  // Check if any values differ (allowing small floating point differences)
  const threshold = 0.01; // 1 cent
  return (
    Math.abs(storedStarting - calculated.startingBalance) > threshold ||
    Math.abs(storedEnding - calculated.endingBalance) > threshold ||
    Math.abs(storedCharges - calculated.totalCharges) > threshold ||
    Math.abs(storedPayments - calculated.totalPayments) > threshold
  );
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
 * A period is "current" if today falls between periodStart and periodEnd (inclusive)
 * @param {string} periodStart - Period start date in YYYY/MM/DD format
 * @param {string} periodEnd - Period end date in YYYY/MM/DD format
 * @returns {string} - 'past', 'current', or 'draft'
 */
export function determineStatementStatus(periodStart, periodEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseISO(periodStart.replace(/\//g, '-'));
  start.setHours(0, 0, 0, 0);

  const end = parseISO(periodEnd.replace(/\//g, '-'));
  end.setHours(0, 0, 0, 0);

  // If today is before the period starts, it's a future/draft statement
  if (isBefore(today, start)) {
    return 'draft';
  }
  // If today is after the period ends, it's a past statement
  else if (isAfter(today, end)) {
    return 'past';
  }
  // If today is within the period (inclusive), it's current
  else {
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
  const accountStatements = statements
    .filter((s) => s.accountId === account.id)
    .sort((a, b) => a.closingDate.localeCompare(b.closingDate));

  const existingStatementsByPeriod = new Map();
  accountStatements.forEach((stmt) => {
    const key =
      stmt.statementPeriod || calculateStatementPeriod(stmt.closingDate);
    existingStatementsByPeriod.set(key, stmt);
  });

  // Start from the earliest date and walk forward
  let period = calculateStatementDates(earliestDate, statementDay);
  const firstPeriodStartDate = parseISO(period.periodStart.replace(/\//g, '-'));
  let lastKnownEndingBalance = getEndingBalanceBeforeDate(
    accountStatements,
    firstPeriodStartDate
  );
  const currentClosing = parseISO(
    currentPeriod.closingDate.replace(/\//g, '-')
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const periodClosing = parseISO(period.closingDate.replace(/\//g, '-'));

    // Stop if we've gone beyond the current period (use >= to include current)
    if (isAfter(periodClosing, currentClosing)) {
      break;
    }

    const statementPeriod = calculateStatementPeriod(period.closingDate);
    const existingStatement = existingStatementsByPeriod.get(statementPeriod);

    if (existingStatement) {
      lastKnownEndingBalance = getStatementEndingBalance(existingStatement);
    } else {
      // Get transactions for this period
      const transactionIds = getTransactionsInPeriod(
        transactions,
        account.id,
        period.periodStart,
        period.periodEnd
      );

      const { totalCharges, totalPayments } = summarizeStatementTransactions(
        transactions,
        transactionIds
      );

      let startingBalance = 0;
      if (typeof lastKnownEndingBalance === 'number') {
        startingBalance = lastKnownEndingBalance;
      }
      const endingBalance = startingBalance + totalCharges - totalPayments;

      // Determine status based on whether today falls in this period
      const status = determineStatementStatus(
        period.periodStart,
        period.periodEnd
      );

      missingPeriods.push({
        accountId: account.id,
        closingDate: period.closingDate,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        statementPeriod,
        transactionIds,
        startingBalance,
        endingBalance,
        totalCharges,
        totalPayments,
        status,
      });

      lastKnownEndingBalance = endingBalance;
    }

    // Move to next period - go forward one day from closing date
    period = getNextPeriod(period.closingDate, statementDay);
  }

  return missingPeriods;
}

function getStatementEndingBalance(statement) {
  if (typeof statement.endingBalance === 'number') {
    return statement.endingBalance;
  }
  if (typeof statement.total === 'number') {
    return statement.total;
  }
  return 0;
}

function getEndingBalanceBeforeDate(statements, targetDate) {
  let balance = 0;
  statements.forEach((stmt) => {
    const closingDate = parseISO(stmt.closingDate.replace(/\//g, '-'));
    if (closingDate < targetDate) {
      balance = getStatementEndingBalance(stmt);
    }
  });
  return balance;
}
