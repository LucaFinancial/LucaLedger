import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { StatementStatusEnum } from './constants';
import { validateStatementSync } from '@/validation/validator';
import { calculateStatementPeriod } from './utils';

/**
 * Generates a new statement with default values
 * @param {Object} initialData - Initial data to populate the statement
 * @param {string} initialData.accountId - Required: Account ID
 * @param {string} initialData.closingDate - Required: Statement closing date
 * @param {string} initialData.periodStart - Required: Period start date
 * @param {string} initialData.periodEnd - Required: Period end date
 * @param {Array<string>} initialData.transactionIds - Optional: Transaction IDs
 * @param {number} initialData.total - Optional legacy total (falls back to endingBalance)
 * @param {string} initialData.status - Optional: Statement status
 * @returns {Object|null} The generated statement or null if validation fails
 */
export const generateStatement = (initialData = {}) => {
  const now = new Date().toISOString();

  const closingDate =
    initialData.closingDate || dayjs().format(config.dateFormatString);

  // Calculate statementPeriod from closingDate to ensure consistency
  const statementPeriod = calculateStatementPeriod(closingDate);

  const statement = {
    id: uuid(),
    accountId: initialData.accountId || null,
    closingDate,
    periodStart:
      initialData.periodStart ||
      dayjs().subtract(1, 'month').format(config.dateFormatString),
    periodEnd:
      initialData.periodEnd ||
      dayjs().subtract(1, 'day').format(config.dateFormatString),
    transactionIds: initialData.transactionIds || [],
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
    isStartDateModified: initialData.isStartDateModified || false,
    isEndDateModified: initialData.isEndDateModified || false,
    isTotalModified: initialData.isTotalModified || false,
    createdAt: now,
    updatedAt: now,
    lockedAt: initialData.lockedAt || null,
    // Spread initialData but ensure statementPeriod is never overwritten
    ...initialData,
    statementPeriod, // Always use calculated value from closingDate
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
    validateStatementSync(statement);
    return statement;
  } catch (error) {
    console.error('Statement validation failed:', error);
    return null;
  }
};
