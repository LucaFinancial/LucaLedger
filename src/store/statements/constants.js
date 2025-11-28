export const StatementStatusEnum = Object.freeze({
  DRAFT: 'draft',
  CURRENT: 'current',
  PAST: 'past',
  LOCKED: 'locked',
});

export const StatementFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  CLOSING_DATE: 'closingDate',
  PERIOD_START: 'periodStart',
  PERIOD_END: 'periodEnd',
  TRANSACTION_IDS: 'transactionIds',
  TOTAL: 'total',
  STATUS: 'status',
  IS_START_DATE_MODIFIED: 'isStartDateModified',
  IS_END_DATE_MODIFIED: 'isEndDateModified',
  IS_TOTAL_MODIFIED: 'isTotalModified',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  LOCKED_AT: 'lockedAt',
});
