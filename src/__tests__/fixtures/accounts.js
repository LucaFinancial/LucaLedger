/**
 * Sample Account Data Fixtures
 * Reusable test data for account-related tests
 */

import { AccountType } from '@/store/accounts/constants';

// Valid Checking Account
export const validCheckingAccount = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Primary Checking',
  type: AccountType.CHECKING,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Valid Savings Account
export const validSavingsAccount = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Emergency Fund',
  type: AccountType.SAVINGS,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Valid Credit Card Account
export const validCreditCardAccount = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Rewards Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 15,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Credit Card with different statement days
export const creditCardStatementDay1 = {
  id: '00000000-0000-0000-0000-000000000004',
  name: 'Basic Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const creditCardStatementDay31 = {
  id: '00000000-0000-0000-0000-000000000005',
  name: 'Premium Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 31,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Collection of all valid accounts
export const validAccounts = [
  validCheckingAccount,
  validSavingsAccount,
  validCreditCardAccount,
  creditCardStatementDay1,
  creditCardStatementDay31,
];

// Invalid Account Fixtures (for failure tests)
export const accountMissingId = {
  name: 'No ID Account',
  type: AccountType.CHECKING,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountMissingName = {
  id: '00000000-0000-0000-0000-000000000006',
  type: AccountType.CHECKING,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountMissingType = {
  id: '00000000-0000-0000-0000-000000000007',
  name: 'Missing Type',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountEmptyName = {
  id: '00000000-0000-0000-0000-000000000008',
  name: '',
  type: AccountType.CHECKING,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountEmptyId = {
  id: '',
  name: 'Empty ID',
  type: AccountType.CHECKING,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountInvalidType = {
  id: '00000000-0000-0000-0000-000000000009',
  name: 'Invalid Type',
  type: 'InvalidType',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const creditCardMissingStatementDay = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Missing Statement Day',
  type: AccountType.CREDIT_CARD,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const creditCardInvalidStatementDay = {
  id: '00000000-0000-0000-0000-000000000011',
  name: 'Invalid Statement Day',
  type: AccountType.CREDIT_CARD,
  statementDay: 32,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const creditCardStatementDayZero = {
  id: '00000000-0000-0000-0000-000000000012',
  name: 'Statement Day Zero',
  type: AccountType.CREDIT_CARD,
  statementDay: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const creditCardStatementDayNegative = {
  id: '00000000-0000-0000-0000-000000000013',
  name: 'Statement Day Negative',
  type: AccountType.CREDIT_CARD,
  statementDay: -1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const accountWithExtraProperties = {
  id: '00000000-0000-0000-0000-000000000014',
  name: 'Extra Props Account',
  type: AccountType.CHECKING,
  extraField: 'should be removed',
  anotherExtra: 123,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Invalid account fixtures collection
export const invalidAccounts = [
  { account: accountMissingId, expectedError: 'id is required' },
  { account: accountMissingName, expectedError: 'name is required' },
  { account: accountMissingType, expectedError: 'type is required' },
  { account: accountEmptyName, expectedError: 'name must not be empty' },
  { account: accountEmptyId, expectedError: 'id must not be empty' },
  {
    account: creditCardMissingStatementDay,
    expectedError: 'statementDay is required',
  },
  {
    account: creditCardInvalidStatementDay,
    expectedError: 'statementDay must be at most 31',
  },
  {
    account: creditCardStatementDayZero,
    expectedError: 'statementDay must be at least 1',
  },
];

export default {
  validCheckingAccount,
  validSavingsAccount,
  validCreditCardAccount,
  validAccounts,
  invalidAccounts,
};
