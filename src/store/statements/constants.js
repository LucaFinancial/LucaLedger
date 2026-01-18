export const StatementStatusEnum = Object.freeze({
  DRAFT: 'draft',
  CURRENT: 'current',
  PAST: 'past',
  LOCKED: 'locked',
});

export const StatementFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  STARTING_BALANCE: 'startingBalance',
  ENDING_BALANCE: 'endingBalance',
  TOTAL_CHARGES: 'totalCharges',
  TOTAL_PAYMENTS: 'totalPayments',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
});
