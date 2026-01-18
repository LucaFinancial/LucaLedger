import { format, subMonths, subDays } from 'date-fns';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { StatementStatusEnum } from './constants';
import { validateSchemaSync } from '@/utils/schemaValidation';

/**
 * Generates a new statement with default values
 * @param {Object} initialData - Initial data to populate the statement
 * @param {string} initialData.accountId - Required: Account ID
 * @param {string} initialData.startDate - Required: Period start date
 * @param {string} initialData.endDate - Required: Period end date
 * @param {number} initialData.total - Optional legacy total (falls back to endingBalance)
 * @param {string} initialData.status - Optional: Statement status
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
    status: initialData.status || StatementStatusEnum.DRAFT,
    createdAt: now,
    updatedAt: now,
    // Spread initialData last to allow overrides for startDate/endDate
    ...initialData,
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
