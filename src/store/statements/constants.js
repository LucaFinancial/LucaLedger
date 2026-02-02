// Display states for UI (computed from dates, not stored)
export const StatementDisplayState = Object.freeze({
  DRAFT: 'draft', // Future statement (not yet started)
  CURRENT: 'current', // Active statement period (today is within dates)
  PAST: 'past', // Closed statement (today is after end date)
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
  IS_LOCKED: 'isLocked',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
});
