/**
 * Sample Statement Data Fixtures
 * Reusable test data for statement-related tests
 */

import { StatementStatusEnum } from '@/store/statements/constants';

// Valid current statement
export const validCurrentStatement = {
  id: '00000000-0000-0000-0000-000000000001',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
  ],
  startingBalance: 0,
  endingBalance: 12499, // $124.99
  totalCharges: 17499, // $174.99
  totalPayments: 5000, // $50.00
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  lockedAt: null,
};

// Valid past statement
export const validPastStatement = {
  id: '00000000-0000-0000-0000-000000000002',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2023-12-15',
  periodStart: '2023-11-16',
  periodEnd: '2023-12-15',
  statementPeriod: '2023-12',
  transactionIds: [],
  startingBalance: 25000,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 25000,
  status: StatementStatusEnum.PAST,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2023-12-01T00:00:00.000Z',
  updatedAt: '2023-12-15T00:00:00.000Z',
  lockedAt: null,
};

// Valid locked statement
export const validLockedStatement = {
  id: '00000000-0000-0000-0000-000000000003',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2023-11-15',
  periodStart: '2023-10-16',
  periodEnd: '2023-11-15',
  statementPeriod: '2023-11',
  transactionIds: ['00000000-0000-0000-0000-000000000004'],
  startingBalance: 10000,
  endingBalance: 25000,
  totalCharges: 15000,
  totalPayments: 0,
  status: StatementStatusEnum.LOCKED,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2023-11-01T00:00:00.000Z',
  updatedAt: '2023-11-30T00:00:00.000Z',
  lockedAt: '2023-11-30T00:00:00.000Z',
};

// Valid draft statement
export const validDraftStatement = {
  id: '00000000-0000-0000-0000-000000000004',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2024-02-15',
  periodStart: '2024-01-16',
  periodEnd: '2024-02-15',
  statementPeriod: '2024-02',
  transactionIds: [],
  startingBalance: 12499,
  endingBalance: 12499,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.DRAFT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-16T00:00:00.000Z',
  updatedAt: '2024-01-16T00:00:00.000Z',
  lockedAt: null,
};

// Statement with modified dates
export const validStatementWithModifiedDates = {
  id: '00000000-0000-0000-0000-000000000005',
  accountId: '00000000-0000-0000-0000-000000000003',
  closingDate: '2023-10-20', // Modified from 15
  periodStart: '2023-09-20', // Modified
  periodEnd: '2023-10-20', // Modified
  statementPeriod: '2023-10',
  transactionIds: [],
  startingBalance: 5000,
  endingBalance: 10000,
  totalCharges: 5000,
  totalPayments: 0,
  status: StatementStatusEnum.PAST,
  isStartDateModified: true,
  isEndDateModified: true,
  isTotalModified: false,
  createdAt: '2023-10-01T00:00:00.000Z',
  updatedAt: '2023-10-20T00:00:00.000Z',
  lockedAt: null,
};

// Collection of valid statements
export const validStatements = [
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  validStatementWithModifiedDates,
];

// Invalid Statement Fixtures
export const statementMissingId = {
  accountId: 'acc-credit-001',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementMissingAccountId = {
  id: 'stmt-invalid-001',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementMissingClosingDate = {
  id: 'stmt-invalid-002',
  accountId: 'acc-credit-001',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementInvalidDateFormat = {
  id: 'stmt-invalid-003',
  accountId: 'acc-credit-001',
  closingDate: '2024/01/15', // Wrong format (slashes instead of hyphens)
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementInvalidStatus = {
  id: 'stmt-invalid-004',
  accountId: 'acc-credit-001',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: 'invalid_status',
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementInvalidPeriodFormat = {
  id: 'stmt-invalid-005',
  accountId: 'acc-credit-001',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024/01', // Wrong format (should be YYYY-MM)
  transactionIds: [],
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const statementMissingTransactionIds = {
  id: 'stmt-invalid-006',
  accountId: 'acc-credit-001',
  closingDate: '2024-01-15',
  periodStart: '2023-12-16',
  periodEnd: '2024-01-15',
  statementPeriod: '2024-01',
  // transactionIds missing
  startingBalance: 0,
  endingBalance: 0,
  totalCharges: 0,
  totalPayments: 0,
  status: StatementStatusEnum.CURRENT,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

// Invalid statements collection
export const invalidStatements = [
  { statement: statementMissingId, expectedError: 'id is required' },
  {
    statement: statementMissingAccountId,
    expectedError: 'accountId is required',
  },
  {
    statement: statementMissingClosingDate,
    expectedError: 'closingDate is required',
  },
  { statement: statementInvalidStatus, expectedError: 'status must be one of' },
  {
    statement: statementMissingTransactionIds,
    expectedError: 'transactionIds is required',
  },
];

// Legacy statement with 'total' instead of 'endingBalance'
export const legacyStatementWithTotal = {
  id: 'stmt-legacy-001',
  accountId: 'acc-credit-001',
  closingDate: '2023-09-15',
  periodStart: '2023-08-16',
  periodEnd: '2023-09-15',
  statementPeriod: '2023-09',
  transactionIds: [],
  total: 15000, // Legacy field
  startingBalance: 0,
  totalCharges: 15000,
  totalPayments: 0,
  status: StatementStatusEnum.PAST,
  isStartDateModified: false,
  isEndDateModified: false,
  isTotalModified: false,
  createdAt: '2023-09-01T00:00:00.000Z',
  updatedAt: '2023-09-15T00:00:00.000Z',
};

export default {
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  validStatements,
  invalidStatements,
  legacyStatementWithTotal,
};
