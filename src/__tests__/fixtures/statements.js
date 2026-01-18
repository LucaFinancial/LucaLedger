/**
 * Sample Statement Data Fixtures
 * Reusable test data for statement-related tests
 */

import { StatementStatusEnum } from '@/store/statements/constants';

// Valid current statement
export const validCurrentStatement = {
  id: '00000000-0000-0000-0000-000000000001',
  accountId: '00000000-0000-0000-0000-000000000003',
  startDate: '2023-12-16',
  endDate: '2024-01-15',
  startingBalance: 0,
  endingBalance: 12499, // $124.99
  totalCharges: 17499, // $174.99
  totalPayments: 5000, // $50.00
  status: StatementStatusEnum.CURRENT,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

// Valid past statement
export const validPastStatement = {
  id: '00000000-0000-0000-0000-000000000002',
  accountId: '00000000-0000-0000-0000-000000000003',
  startDate: '2023-11-16',
  endDate: '2023-12-15',
  startingBalance: 25000,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 25000,
  status: StatementStatusEnum.PAST,
  createdAt: '2023-12-01T00:00:00.000Z',
  updatedAt: '2023-12-15T00:00:00.000Z',
};

// Valid locked statement
export const validLockedStatement = {
  id: '00000000-0000-0000-0000-000000000003',
  accountId: '00000000-0000-0000-0000-000000000003',
  startDate: '2023-10-16',
  endDate: '2023-11-15',
  startingBalance: 10000,
  endingBalance: 25000,
  totalCharges: 15000,
  totalPayments: 0,
  status: StatementStatusEnum.LOCKED,
  createdAt: '2023-11-01T00:00:00.000Z',
  updatedAt: '2023-11-30T00:00:00.000Z',
};

// Valid draft statement
export const validDraftStatement = {
  id: '00000000-0000-0000-0000-000000000004',
  accountId: '00000000-0000-0000-0000-000000000003',
  startDate: '2024-01-16',
  endDate: '2024-02-15',
  startingBalance: 12499,
  endingBalance: 12499,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.DRAFT,
  createdAt: '2024-01-16T00:00:00.000Z',
  updatedAt: '2024-01-16T00:00:00.000Z',
};

// Statement with modified dates
export const validStatementWithModifiedDates = {
  id: '00000000-0000-0000-0000-000000000005',
  accountId: '00000000-0000-0000-0000-000000000003',
  startDate: '2023-09-20', // Modified
  endDate: '2023-10-20', // Modified
  startingBalance: 5000,
  endingBalance: 10000,
  totalCharges: 5000,
  totalPayments: 0,
  status: StatementStatusEnum.PAST,
  createdAt: '2023-10-01T00:00:00.000Z',
  updatedAt: '2023-10-20T00:00:00.000Z',
};

// Collection of valid statements
export const validStatements = [
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  validStatementWithModifiedDates,
];

// Legacy statement with 'total' instead of 'endingBalance'
export const legacyStatementWithTotal = {
  id: '00000000-0000-0000-0000-000000000006',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2023-09-15',
  periodStart: '2023-08-16',
  periodEnd: '2023-09-15',
  total: 15000, // Legacy field
  startingBalance: 0,
  totalCharges: 15000,
  totalPayments: 0,
  status: StatementStatusEnum.PAST,
  createdAt: '2023-09-01T00:00:00.000Z',
  updatedAt: '2023-09-15T00:00:00.000Z',
};

export default {
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  validStatements,
  legacyStatementWithTotal,
};
