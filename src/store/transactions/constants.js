export const TransactionStateEnum = Object.freeze({
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  PLANNED: 'PLANNED',
  SCHEDULED: 'SCHEDULED',
  REFUNDED: 'REFUNDED',
});

export const TransactionFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  TRANSACTION_STATE: 'transactionState',
  DATE: 'date',
  AMOUNT: 'amount',
  DESCRIPTION: 'description',
});
