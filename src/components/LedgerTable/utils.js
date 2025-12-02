import dayjs from 'dayjs';

import config from '@/config';

export const dateCompareFn = (a, b) => {
  const aDate = dayjs(a.date).format(config.compareDateFormatString);
  const bDate = dayjs(b.date).format(config.compareDateFormatString);
  if (aDate < bDate) {
    return -1;
  }
  if (aDate > bDate) {
    return 1;
  }
  return 0;
};

export const computeStatementMonth = (transaction, statementDay) => {
  const transactionDate = dayjs(transaction.date);
  return transactionDate.date() >= statementDay
    ? transactionDate.add(1, 'month').format('MMMM YYYY')
    : transactionDate.format('MMMM YYYY');
};

/**
 * Generates virtual transactions from recurring transaction rules
 * @param {Array} recurringTransactions - Array of recurring transaction rules
 * @param {Map} realizedDatesMap - Map of "ruleId:date" -> realizedTransactionId
 * @param {number} monthsAhead - Number of months to forecast (default 15)
 * @returns {Array} Array of virtual transaction objects
 */
export const generateVirtualTransactions = (
  recurringTransactions,
  realizedDatesMap,
  monthsAhead = 15
) => {
  const virtualTransactions = [];
  const today = dayjs();
  const endDate = today.add(monthsAhead, 'month');

  recurringTransactions.forEach((rule) => {
    const occurrenceDates = generateOccurrenceDatesForRule(
      rule,
      today.toDate(),
      endDate.toDate()
    );

    occurrenceDates.forEach((dateStr) => {
      // Check if this occurrence has been realized
      const key = `${rule.id}:${dateStr}`;
      if (realizedDatesMap.has(key)) {
        return; // Skip realized occurrences
      }

      // Create a virtual transaction
      virtualTransactions.push({
        id: `virtual-${rule.id}-${dateStr}`,
        accountId: rule.accountId,
        date: dateStr,
        amount: rule.amount,
        description: rule.description,
        categoryId: rule.categoryId,
        status: 'recurring',
        isVirtual: true,
        recurringTransactionId: rule.id,
        recurringTransaction: rule,
      });
    });
  });

  return virtualTransactions;
};

/**
 * Generates occurrence dates for a recurring transaction rule
 * @param {Object} rule - The recurring transaction rule
 * @param {Date} fromDate - Start generating from this date
 * @param {Date} toDate - Stop generating at this date
 * @returns {Array<string>} Array of date strings in YYYY/MM/DD format
 */
const generateOccurrenceDatesForRule = (rule, fromDate, toDate) => {
  const dates = [];
  const { frequency, startDate, endDate } = rule;

  let current = dayjs(startDate.replace(/\//g, '-'));
  const from = dayjs(fromDate);
  const to = dayjs(toDate);
  const end = endDate ? dayjs(endDate.replace(/\//g, '-')) : null;

  // Skip to the first occurrence on or after fromDate
  while (current.isBefore(from)) {
    current = advanceDate(current, frequency);
  }

  // Generate dates up to toDate
  while (
    (current.isBefore(to) || current.isSame(to, 'day')) &&
    (!end || current.isBefore(end) || current.isSame(end, 'day'))
  ) {
    dates.push(current.format(config.dateFormatString));
    current = advanceDate(current, frequency);
  }

  return dates;
};

/**
 * Advances a date by the specified frequency
 * @param {dayjs} date - The current date
 * @param {string} frequency - The frequency to advance by
 * @returns {dayjs} The advanced date
 */
const advanceDate = (date, frequency) => {
  switch (frequency) {
    case 'daily':
      return date.add(1, 'day');
    case 'weekly':
      return date.add(1, 'week');
    case 'bi-weekly':
      return date.add(2, 'week');
    case 'monthly':
      return date.add(1, 'month');
    case 'yearly':
      return date.add(1, 'year');
    default:
      return date.add(1, 'month');
  }
};
