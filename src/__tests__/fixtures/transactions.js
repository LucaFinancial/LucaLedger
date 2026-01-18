/**
 * Sample Transaction Data Fixtures
 * Reusable test data for transaction-related tests
 */

import { TransactionStateEnum } from '@/store/transactions/constants';

// Valid Transactions
export const validCompletedTransaction = {
  id: '00000000-0000-0000-0000-000000000001',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000, // $50.00 in cents
  description: 'Grocery Store Purchase',
  categoryId: '00000004-0000-0000-0000-000000000001', // Food - Groceries
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validPendingTransaction = {
  id: '00000000-0000-0000-0000-000000000002',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.PENDING,
  date: '2024-01-16',
  amount: 2500,
  description: 'Restaurant Payment',
  categoryId: '00000004-0000-0000-0000-000000000002', // Food - Restaurants
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validScheduledTransaction = {
  id: '00000000-0000-0000-0000-000000000003',
  accountId: '00000000-0000-0000-0000-000000000003',
  transactionState: TransactionStateEnum.SCHEDULED,
  date: '2024-02-01',
  amount: 150000, // $1,500.00
  description: 'Monthly Rent',
  categoryId: '00000002-0000-0000-0000-000000000001', // Housing - Rent & Mortgage
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validPlannedTransaction = {
  id: '00000000-0000-0000-0000-000000000004',
  accountId: '00000000-0000-0000-0000-000000000002',
  transactionState: TransactionStateEnum.SCHEDULED,
  date: '2024-03-15',
  amount: -100000, // -$1,000.00 (deposit/income)
  description: 'Planned Salary Deposit',
  categoryId: '00000001-0000-0000-0000-000000000001', // Income - Salary
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validNegativeAmountTransaction = {
  id: '00000000-0000-0000-0000-000000000005',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-01',
  amount: -500000, // -$5,000.00 (deposit)
  description: 'Direct Deposit Paycheck',
  categoryId: '00000001-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validZeroAmountTransaction = {
  id: '00000000-0000-0000-0000-000000000006',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-10',
  amount: 0,
  description: 'Account Adjustment',
  categoryId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const validTransactionNullCategory = {
  id: '00000000-0000-0000-0000-000000000007',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-20',
  amount: 1599,
  description: 'Uncategorized Purchase',
  categoryId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Collection of valid transactions
export const validTransactions = [
  validCompletedTransaction,
  validPendingTransaction,
  validScheduledTransaction,
  validPlannedTransaction,
  validNegativeAmountTransaction,
  validZeroAmountTransaction,
  validTransactionNullCategory,
];

// Transactions for credit card statement testing
export const creditCardTransactions = [
  {
    id: '00000000-0000-0000-0000-000000000008',
    accountId: '00000000-0000-0000-0000-000000000003',
    transactionState: TransactionStateEnum.COMPLETED,
    date: '2024-01-05',
    amount: 4999, // $49.99
    description: 'Subscription Service',
    categoryId: '00000009-0000-0000-0000-000000000001', // Entertainment - Streaming
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    accountId: '00000000-0000-0000-0000-000000000003',
    transactionState: TransactionStateEnum.COMPLETED,
    date: '2024-01-10',
    amount: 12500, // $125.00
    description: 'Utility Bill',
    categoryId: '0000000e-0000-0000-0000-000000000001', // Utilities - Gas & Electric
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    accountId: '00000000-0000-0000-0000-000000000003',
    transactionState: TransactionStateEnum.COMPLETED,
    date: '2024-01-12',
    amount: -5000, // -$50.00 (payment)
    description: 'Credit Card Payment',
    categoryId: '00000010-0000-0000-0000-000000000001', // Transfers - CC Payments
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
];

// Invalid Transaction Fixtures (for failure tests)
export const transactionMissingId = {
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000,
  description: 'Missing ID',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionMissingAccountId = {
  id: '00000000-0000-0000-0000-000000000011',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000,
  description: 'Missing Account ID',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionMissingStatus = {
  id: '00000000-0000-0000-0000-000000000012',
  accountId: '00000000-0000-0000-0000-000000000001',
  date: '2024-01-15',
  amount: 5000,
  description: 'Missing Status',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionInvalidStatus = {
  id: '00000000-0000-0000-0000-000000000013',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: 'invalid_status',
  date: '2024-01-15',
  amount: 5000,
  description: 'Invalid Status',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionMissingDate = {
  id: '00000000-0000-0000-0000-000000000014',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  amount: 5000,
  description: 'Missing Date',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionInvalidDateFormat = {
  id: '00000000-0000-0000-0000-000000000015',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024/01/15', // Wrong format (slashes instead of hyphens)
  amount: 5000,
  description: 'Invalid Date Format',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionInvalidDateFormat2 = {
  id: '00000000-0000-0000-0000-000000000016',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '01/15/2024', // Wrong order
  amount: 5000,
  description: 'Invalid Date Order',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionMissingAmount = {
  id: '00000000-0000-0000-0000-000000000017',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  description: 'Missing Amount',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionStringAmount = {
  id: '00000000-0000-0000-0000-000000000018',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: '5000',
  description: 'String Amount',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionMissingDescription = {
  id: '00000000-0000-0000-0000-000000000019',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000,
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionEmptyDescription = {
  id: '00000000-0000-0000-0000-000000000020',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000,
  description: '',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const transactionWithExtraProperties = {
  id: '00000000-0000-0000-0000-000000000021',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: TransactionStateEnum.COMPLETED,
  date: '2024-01-15',
  amount: 5000,
  description: 'Extra Props Transaction',
  categoryId: null,
  extraField: 'should be removed',
  anotherExtra: 123,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Legacy transaction with trailing space in status (for sanitization tests)
export const transactionLegacyStatusSpaces = {
  id: '00000000-0000-0000-0000-000000000022',
  accountId: '00000000-0000-0000-0000-000000000001',
  transactionState: 'complete ', // trailing space
  date: '2024-01-15',
  amount: 5000,
  description: 'Legacy Status with Spaces',
  categoryId: '00000004-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Invalid transactions collection
export const invalidTransactions = [
  { transaction: transactionMissingId, expectedError: 'id is required' },
  {
    transaction: transactionMissingAccountId,
    expectedError: 'accountId is required',
  },
  {
    transaction: transactionMissingStatus,
    expectedError: 'status is required',
  },
  {
    transaction: transactionInvalidStatus,
    expectedError: 'status must be one of',
  },
  { transaction: transactionMissingDate, expectedError: 'date is required' },
  {
    transaction: transactionMissingAmount,
    expectedError: 'amount is required',
  },
  {
    transaction: transactionStringAmount,
    expectedError: 'amount must be a number',
  },
  {
    transaction: transactionMissingDescription,
    expectedError: 'description is required',
  },
  {
    transaction: transactionEmptyDescription,
    expectedError: 'description must not be empty',
  },
];

export default {
  validCompletedTransaction,
  validTransactions,
  creditCardTransactions,
  invalidTransactions,
  transactionLegacyStatusSpaces,
};
