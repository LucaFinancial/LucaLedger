export const AccountType = Object.freeze({
  SAVINGS: 'Savings',
  CHECKING: 'Checking',
  CREDIT_CARD: 'Credit Card',
});

export const AccountFields = Object.freeze({
  ID: 'id',
  NAME: 'name',
  TYPE: 'type',
  STATEMENT_DAY: 'statementDay',
  STATEMENT_LOCKED_TO_MONTH: 'statementLockedToMonth',
  GROUP_BY: 'groupBy',
});

export const GroupByMode = Object.freeze({
  MONTH: 'month',
  STATEMENT: 'statement',
});
