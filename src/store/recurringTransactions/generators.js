import {
  format,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isSameDay,
} from 'date-fns';
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
    startDate:
      initialData.startDate || format(new Date(), config.dateFormatString),
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

  let current = parseISO(startDate.replace(/\//g, '-'));
  const from = fromDate instanceof Date ? fromDate : parseISO(fromDate);
  const to = toDate instanceof Date ? toDate : parseISO(toDate);
  const end = endDate ? parseISO(endDate.replace(/\//g, '-')) : null;

  // Skip to the first occurrence on or after fromDate
  while (isBefore(current, from)) {
    current = advanceDate(current, frequency);
  }

  // Generate dates up to toDate
  while (
    (isBefore(current, to) || isSameDay(current, to)) &&
    (!end || isBefore(current, end) || isSameDay(current, end))
  ) {
    dates.push(format(current, config.dateFormatString));
    current = advanceDate(current, frequency);
  }

  return dates;
};

/**
 * Advances a date by the specified frequency
 * @param {Date} date - The current date
 * @param {string} frequency - The frequency to advance by
 * @returns {Date} The advanced date
 */
const advanceDate = (date, frequency) => {
  switch (frequency) {
    case RecurringFrequencyEnum.DAILY:
      return addDays(date, 1);
    case RecurringFrequencyEnum.WEEKLY:
      return addWeeks(date, 1);
    case RecurringFrequencyEnum.BI_WEEKLY:
      return addWeeks(date, 2);
    case RecurringFrequencyEnum.MONTHLY:
      return addMonths(date, 1);
    case RecurringFrequencyEnum.YEARLY:
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
};
