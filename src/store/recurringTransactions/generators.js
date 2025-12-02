import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { RecurringFrequencyEnum } from './constants';
import { validateRecurringTransactionSync } from '@/validation/validator';

/**
 * Generates a new recurring transaction with default values
 * @param {Object} initialData - Initial data to populate the recurring transaction
 * @returns {Object|null} The generated recurring transaction or null if validation fails
 */
export const generateRecurringTransaction = (initialData = {}) => {
  const now = new Date().toISOString();

  const recurringTransaction = {
    id: uuid(),
    accountId: initialData.accountId || null,
    description: initialData.description || 'New recurring transaction',
    amount: initialData.amount ?? 0,
    categoryId: initialData.categoryId || null,
    frequency: initialData.frequency || RecurringFrequencyEnum.MONTHLY,
    startDate: initialData.startDate || dayjs().format(config.dateFormatString),
    endDate: initialData.endDate || null,
    createdAt: now,
    updatedAt: now,
    ...initialData,
  };

  try {
    validateRecurringTransactionSync(recurringTransaction);
    return recurringTransaction;
  } catch (error) {
    console.error('Recurring transaction validation failed:', error);
    return null;
  }
};

/**
 * Generates occurrence dates for a recurring transaction
 * @param {Object} recurringTransaction - The recurring transaction rule
 * @param {Date} fromDate - Start generating from this date
 * @param {Date} toDate - Stop generating at this date
 * @returns {Array<string>} Array of date strings in YYYY/MM/DD format
 */
export const generateOccurrenceDates = (
  recurringTransaction,
  fromDate,
  toDate
) => {
  const { frequency, startDate, endDate } = recurringTransaction;
  const dates = [];

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
    case RecurringFrequencyEnum.DAILY:
      return date.add(1, 'day');
    case RecurringFrequencyEnum.WEEKLY:
      return date.add(1, 'week');
    case RecurringFrequencyEnum.BI_WEEKLY:
      return date.add(2, 'week');
    case RecurringFrequencyEnum.MONTHLY:
      return date.add(1, 'month');
    case RecurringFrequencyEnum.YEARLY:
      return date.add(1, 'year');
    default:
      return date.add(1, 'month');
  }
};
