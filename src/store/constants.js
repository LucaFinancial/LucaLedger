const TransactionStateEnum = Object.freeze({
  PLANNED: 'PLANNED',
  SCHEDULED: 'SCHEDULED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
  TENTATIVE: 'TENTATIVE',
  UPCOMING: 'UPCOMING',
  DELETED: 'DELETED',
});

const CategoryTypeEnum = Object.freeze({
  DEFAULT: 'DEFAULT',
  MODIFIED: 'MODIFIED',
  CUSTOM: 'CUSTOM',
});

const EntityTypeEnum = Object.freeze({
  ACCOUNT: 'ACCOUNT',
  RETAILER: 'RETAILER',
  BUSINESS: 'BUSINESS',
  INDIVIDUAL: 'INDIVIDUAL',
  UTILITY: 'UTILITY',
  GOVERNMENT: 'GOVERNMENT',
});

const EntityStatusEnum = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
  CLOSED: 'CLOSED',
});

const RepeatedTransactionFrequencyEnum = Object.freeze({
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
});

const RepeatedTransactionStateEnum = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

const RepeatedTransactionOccurrenceStatusEnum = Object.freeze({
  MODIFIED: 'MODIFIED',
  DELETED: 'DELETED',
});

export {
  TransactionStateEnum,
  CategoryTypeEnum,
  EntityTypeEnum,
  EntityStatusEnum,
  RepeatedTransactionFrequencyEnum,
  RepeatedTransactionStateEnum,
  RepeatedTransactionOccurrenceStatusEnum,
};
