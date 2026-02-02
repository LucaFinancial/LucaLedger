import { format, subMonths, subDays } from 'date-fns';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { validateSchemaSync } from '@/utils/schemaValidation';

/**
 * Generates a new statement with default values
 * @param {Object} initialData - Initial data to populate the statement
 * @param {string} initialData.accountId - Required: Account ID
 * @param {string} initialData.startDate - Required: Period start date
 * @param {string} initialData.endDate - Required: Period end date
 * @param {number} initialData.total - Optional legacy total (falls back to endingBalance)
 * @param {boolean} initialData.isLocked - Optional: Whether statement is locked
 * @returns {Object|null} The generated statement or null if validation fails
 */
export const generateStatement = (initialData = {}) => {
  const now = new Date().toISOString();

  const endDate =
    initialData.endDate ||
    format(subDays(new Date(), 1), config.dateFormatString);

  const statement = {
    id: uuid(),
    accountId: initialData.accountId || null,
    startDate:
      initialData.startDate ||
      format(subMonths(new Date(), 1), config.dateFormatString),
    endDate,
    startingBalance:
      typeof initialData.startingBalance === 'number'
        ? initialData.startingBalance
        : 0,
    endingBalance:
      typeof initialData.endingBalance === 'number'
        ? initialData.endingBalance
        : typeof initialData.total === 'number'
          ? initialData.total
          : 0,
    totalCharges:
      typeof initialData.totalCharges === 'number'
        ? initialData.totalCharges
        : 0,
    totalPayments:
      typeof initialData.totalPayments === 'number'
        ? initialData.totalPayments
        : 0,
    isLocked: initialData.isLocked === true ? true : false,
    createdAt: now,
    updatedAt: now,
  };

  if (typeof statement.startingBalance !== 'number') {
    statement.startingBalance = 0;
  }
  if (typeof statement.totalCharges !== 'number') {
    statement.totalCharges = 0;
  }
  if (typeof statement.totalPayments !== 'number') {
    statement.totalPayments = 0;
  }

  try {
    validateSchemaSync('statement', statement);
    return statement;
  } catch (error) {
    console.error('Statement validation failed:', error);
    return null;
  }
};
