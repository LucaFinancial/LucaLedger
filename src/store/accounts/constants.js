import { enums } from '@luca-financial/luca-schema';

const fallbackAccountTypeOptions = [
  'CHECKING',
  'SAVINGS',
  'CASH',
  'CREDIT_CARD',
  'ESCROW',
  'EXTERNAL',
];

const schemaAccountTypeOptions = enums?.AccountType?.enum;

export const AccountTypeOptions = Object.freeze(
  Array.isArray(schemaAccountTypeOptions) && schemaAccountTypeOptions.length > 0
    ? [...schemaAccountTypeOptions]
    : [...fallbackAccountTypeOptions],
);

export const AccountType = Object.freeze(
  Object.fromEntries(
    AccountTypeOptions.map((accountType) => [accountType, accountType]),
  ),
);

export const AccountFields = Object.freeze({
  ID: 'id',
  NAME: 'name',
  TYPE: 'type',
  STATEMENT_DAY: 'statementClosingDay',
  CLOSED_AT: 'closedAt',
});
