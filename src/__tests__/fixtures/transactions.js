/**
 * Sample Transaction Data Fixtures
 * Reusable test data for transaction-related tests
 */

import { TransactionStatusEnum } from '@/store/transactions/constants';

// Valid Transactions
export const validCompletedTransaction = {
  id: 'tx-001',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000, // $50.00 in cents
  description: 'Grocery Store Purchase',
  categoryId: '00000004-0000-0000-0000-000000000001', // Food - Groceries
};

export const validPendingTransaction = {
  id: 'tx-002',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.PENDING,
  date: '2024/01/16',
  amount: 2500,
  description: 'Restaurant Payment',
  categoryId: '00000004-0000-0000-0000-000000000002', // Food - Restaurants
};

export const validScheduledTransaction = {
  id: 'tx-003',
  accountId: 'acc-credit-001',
  status: TransactionStatusEnum.SCHEDULED,
  date: '2024/02/01',
  amount: 150000, // $1,500.00
  description: 'Monthly Rent',
  categoryId: '00000002-0000-0000-0000-000000000001', // Housing - Rent & Mortgage
};

export const validPlannedTransaction = {
  id: 'tx-004',
  accountId: 'acc-savings-001',
  status: TransactionStatusEnum.PLANNED,
  date: '2024/03/15',
  amount: -100000, // -$1,000.00 (deposit/income)
  description: 'Planned Salary Deposit',
  categoryId: '00000001-0000-0000-0000-000000000001', // Income - Salary
};

export const validNegativeAmountTransaction = {
  id: 'tx-005',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/01',
  amount: -500000, // -$5,000.00 (deposit)
  description: 'Direct Deposit Paycheck',
  categoryId: '00000001-0000-0000-0000-000000000001',
};

export const validZeroAmountTransaction = {
  id: 'tx-006',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/10',
  amount: 0,
  description: 'Account Adjustment',
  categoryId: null,
};

export const validTransactionNullCategory = {
  id: 'tx-007',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/20',
  amount: 1599,
  description: 'Uncategorized Purchase',
  categoryId: null,
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
    id: 'cc-tx-001',
    accountId: 'acc-credit-001',
    status: TransactionStatusEnum.COMPLETE,
    date: '2024/01/05',
    amount: 4999, // $49.99
    description: 'Subscription Service',
    categoryId: '00000009-0000-0000-0000-000000000001', // Entertainment - Streaming
  },
  {
    id: 'cc-tx-002',
    accountId: 'acc-credit-001',
    status: TransactionStatusEnum.COMPLETE,
    date: '2024/01/10',
    amount: 12500, // $125.00
    description: 'Utility Bill',
    categoryId: '0000000e-0000-0000-0000-000000000001', // Utilities - Gas & Electric
  },
  {
    id: 'cc-tx-003',
    accountId: 'acc-credit-001',
    status: TransactionStatusEnum.COMPLETE,
    date: '2024/01/12',
    amount: -5000, // -$50.00 (payment)
    description: 'Credit Card Payment',
    categoryId: '00000010-0000-0000-0000-000000000001', // Transfers - CC Payments
  },
];

// Invalid Transaction Fixtures (for failure tests)
export const transactionMissingId = {
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000,
  description: 'Missing ID',
};

export const transactionMissingAccountId = {
  id: 'tx-invalid-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000,
  description: 'Missing Account ID',
};

export const transactionMissingStatus = {
  id: 'tx-invalid-002',
  accountId: 'acc-checking-001',
  date: '2024/01/15',
  amount: 5000,
  description: 'Missing Status',
};

export const transactionInvalidStatus = {
  id: 'tx-invalid-003',
  accountId: 'acc-checking-001',
  status: 'invalid_status',
  date: '2024/01/15',
  amount: 5000,
  description: 'Invalid Status',
};

export const transactionMissingDate = {
  id: 'tx-invalid-004',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  amount: 5000,
  description: 'Missing Date',
};

export const transactionInvalidDateFormat = {
  id: 'tx-invalid-005',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024-01-15', // Wrong format (hyphens instead of slashes)
  amount: 5000,
  description: 'Invalid Date Format',
};

export const transactionInvalidDateFormat2 = {
  id: 'tx-invalid-006',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '01/15/2024', // Wrong order
  amount: 5000,
  description: 'Invalid Date Order',
};

export const transactionMissingAmount = {
  id: 'tx-invalid-007',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  description: 'Missing Amount',
};

export const transactionStringAmount = {
  id: 'tx-invalid-008',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: '5000',
  description: 'String Amount',
};

export const transactionMissingDescription = {
  id: 'tx-invalid-009',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000,
};

export const transactionEmptyDescription = {
  id: 'tx-invalid-010',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000,
  description: '',
};

export const transactionWithExtraProperties = {
  id: 'tx-extra-props',
  accountId: 'acc-checking-001',
  status: TransactionStatusEnum.COMPLETE,
  date: '2024/01/15',
  amount: 5000,
  description: 'Extra Props Transaction',
  categoryId: null,
  extraField: 'should be removed',
  anotherExtra: 123,
};

// Legacy transaction with trailing space in status (for sanitization tests)
export const transactionLegacyStatusSpaces = {
  id: 'tx-legacy-001',
  accountId: 'acc-checking-001',
  status: 'complete ', // trailing space
  date: '2024/01/15',
  amount: 5000,
  description: 'Legacy Status with Spaces',
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
