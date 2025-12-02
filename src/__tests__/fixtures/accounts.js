/**
 * Sample Account Data Fixtures
 * Reusable test data for account-related tests
 */

import { AccountType } from '@/store/accounts/constants';

// Valid Checking Account
export const validCheckingAccount = {
  id: 'acc-checking-001',
  name: 'Primary Checking',
  type: AccountType.CHECKING,
};

// Valid Savings Account
export const validSavingsAccount = {
  id: 'acc-savings-001',
  name: 'Emergency Fund',
  type: AccountType.SAVINGS,
};

// Valid Credit Card Account
export const validCreditCardAccount = {
  id: 'acc-credit-001',
  name: 'Rewards Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 15,
};

// Credit Card with different statement days
export const creditCardStatementDay1 = {
  id: 'acc-credit-002',
  name: 'Basic Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 1,
};

export const creditCardStatementDay31 = {
  id: 'acc-credit-003',
  name: 'Premium Card',
  type: AccountType.CREDIT_CARD,
  statementDay: 31,
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
};

export const accountMissingName = {
  id: 'acc-no-name',
  type: AccountType.CHECKING,
};

export const accountMissingType = {
  id: 'acc-no-type',
  name: 'Missing Type',
};

export const accountEmptyName = {
  id: 'acc-empty-name',
  name: '',
  type: AccountType.CHECKING,
};

export const accountEmptyId = {
  id: '',
  name: 'Empty ID',
  type: AccountType.CHECKING,
};

export const accountInvalidType = {
  id: 'acc-invalid-type',
  name: 'Invalid Type',
  type: 'InvalidType',
};

export const creditCardMissingStatementDay = {
  id: 'acc-cc-no-statement',
  name: 'Missing Statement Day',
  type: AccountType.CREDIT_CARD,
};

export const creditCardInvalidStatementDay = {
  id: 'acc-cc-invalid-day',
  name: 'Invalid Statement Day',
  type: AccountType.CREDIT_CARD,
  statementDay: 32,
};

export const creditCardStatementDayZero = {
  id: 'acc-cc-day-zero',
  name: 'Statement Day Zero',
  type: AccountType.CREDIT_CARD,
  statementDay: 0,
};

export const creditCardStatementDayNegative = {
  id: 'acc-cc-day-negative',
  name: 'Statement Day Negative',
  type: AccountType.CREDIT_CARD,
  statementDay: -1,
};

export const accountWithExtraProperties = {
  id: 'acc-extra-props',
  name: 'Extra Props Account',
  type: AccountType.CHECKING,
  extraField: 'should be removed',
  anotherExtra: 123,
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
