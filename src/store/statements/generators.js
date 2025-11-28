import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import config from '@/config';
import { StatementStatusEnum } from './constants';
import { validateStatementSync } from '@/validation/validator';

/**
 * Generates a new statement with default values
 * @param {Object} initialData - Initial data to populate the statement
 * @param {string} initialData.accountId - Required: Account ID
 * @param {string} initialData.closingDate - Required: Statement closing date
 * @param {string} initialData.periodStart - Required: Period start date
 * @param {string} initialData.periodEnd - Required: Period end date
 * @param {Array<string>} initialData.transactionIds - Optional: Transaction IDs
 * @param {number} initialData.total - Optional: Statement total in cents
 * @param {string} initialData.status - Optional: Statement status
 * @returns {Object|null} The generated statement or null if validation fails
 */
export const generateStatement = (initialData = {}) => {
  const now = new Date().toISOString();

  const statement = {
    id: uuid(),
    accountId: initialData.accountId || null,
    closingDate:
      initialData.closingDate || dayjs().format(config.dateFormatString),
    periodStart:
      initialData.periodStart ||
      dayjs().subtract(1, 'month').format(config.dateFormatString),
    periodEnd:
      initialData.periodEnd ||
      dayjs().subtract(1, 'day').format(config.dateFormatString),
    transactionIds: initialData.transactionIds || [],
    total: initialData.total || 0,
    status: initialData.status || StatementStatusEnum.DRAFT,
    isStartDateModified: initialData.isStartDateModified || false,
    isEndDateModified: initialData.isEndDateModified || false,
    isTotalModified: initialData.isTotalModified || false,
    createdAt: now,
    updatedAt: now,
    lockedAt: initialData.lockedAt || null,
    ...initialData,
  };

  try {
    validateStatementSync(statement);
    return statement;
  } catch (error) {
    console.error('Statement validation failed:', error);
    return null;
  }
};
