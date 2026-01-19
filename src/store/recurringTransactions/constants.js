export const RecurringFrequencyEnum = Object.freeze({
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
});

export const RecurringTransactionStateEnum = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

export const RecurringTransactionFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  DESCRIPTION: 'description',
  AMOUNT: 'amount',
  CATEGORY_ID: 'categoryId',
  FREQUENCY: 'frequency',
  INTERVAL: 'interval',
  START_ON: 'startOn',
  END_ON: 'endOn',
  OCCURRENCES: 'occurrences',
  RECURRING_TRANSACTION_STATE: 'recurringTransactionState',
});
