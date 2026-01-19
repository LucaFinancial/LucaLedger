export const TransactionStateEnum = Object.freeze({
  PLANNED: 'PLANNED',
  ON_DECK: 'ON_DECK',
  SCHEDULED: 'SCHEDULED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
  DELETED: 'DELETED',
});

export const TransactionFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  TRANSACTION_STATE: 'transactionState',
  DATE: 'date',
  AMOUNT: 'amount',
  DESCRIPTION: 'description',
});
