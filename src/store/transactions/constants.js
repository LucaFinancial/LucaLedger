export const TransactionStateEnum = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  SCHEDULED: 'SCHEDULED',
  PLANNED: 'PLANNED',
  VOID: 'VOID',
});

export const TransactionFields = Object.freeze({
  ID: 'id',
  ACCOUNT_ID: 'accountId',
  TRANSACTION_STATE: 'transactionState',
  DATE: 'date',
  AMOUNT: 'amount',
  DESCRIPTION: 'description',
});
