import { AccountType } from '@/store/accounts/constants';
import { TransactionStateEnum } from '@/store/transactions/constants';

const ACCOUNT_TYPE_MAP = new Map([
  ['Checking', AccountType.CHECKING],
  ['Savings', AccountType.SAVINGS],
  ['Credit Card', AccountType.CREDIT_CARD],
]);

const TRANSACTION_STATE_MAP = new Map([
  ['planned', TransactionStateEnum.PLANNED],
  ['scheduled', TransactionStateEnum.SCHEDULED],
  ['pending', TransactionStateEnum.PENDING],
  ['complete', TransactionStateEnum.COMPLETED],
]);

const ensureCommonFields = (record, timestamp) => {
  let changed = false;
  const normalized = { ...record };

  if (typeof normalized.createdAt !== 'string' || normalized.createdAt === '') {
    normalized.createdAt = timestamp;
    changed = true;
  }

  if (
    typeof normalized.updatedAt === 'undefined' ||
    normalized.updatedAt === '' ||
    (typeof normalized.updatedAt !== 'string' && normalized.updatedAt !== null)
  ) {
    normalized.updatedAt = null;
    changed = true;
  }

  return { normalized, changed };
};

const slugify = (value) => {
  if (typeof value !== 'string') return 'untitled';
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'untitled';
};

const normalizeAccount = (account, timestamp) => {
  let changed = false;
  const normalized = { ...account };

  if (ACCOUNT_TYPE_MAP.has(normalized.type)) {
    normalized.type = ACCOUNT_TYPE_MAP.get(normalized.type);
    changed = true;
  }

  if (
    typeof normalized.statementClosingDay === 'undefined' &&
    'statementDay' in normalized
  ) {
    normalized.statementClosingDay = normalized.statementDay ?? null;
    changed = true;
  }

  if ('statementDay' in normalized) {
    delete normalized.statementDay;
    changed = true;
  }

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
};

const normalizeTransaction = (transaction, timestamp) => {
  let changed = false;
  const normalized = { ...transaction };

  if (!normalized.transactionState) {
    const status =
      typeof normalized.status === 'string'
        ? normalized.status.toLowerCase().trim()
        : null;
    normalized.transactionState =
      (status && TRANSACTION_STATE_MAP.get(status)) ||
      TransactionStateEnum.PLANNED;
    changed = true;
  }

  if ('status' in normalized) {
    delete normalized.status;
    changed = true;
  }

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
};

const normalizeCategory = (category, timestamp) => {
  let changed = false;
  const normalized = { ...category };

  if (typeof normalized.slug !== 'string' || normalized.slug.trim() === '') {
    normalized.slug = slugify(normalized.name);
    changed = true;
  }

  if (typeof normalized.parentId === 'undefined') {
    normalized.parentId = null;
    changed = true;
  }

  if (typeof normalized.description === 'undefined') {
    normalized.description = null;
    changed = true;
  }

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
};

const normalizeStatement = (statement, timestamp) => {
  let changed = false;
  const normalized = { ...statement };

  // Migrate old status field to isLocked boolean (schema 2.2.0+)
  if ('status' in normalized && !('isLocked' in normalized)) {
    normalized.isLocked = normalized.status === 'locked';
    changed = true;
  }

  // Remove old status field if it exists
  if ('status' in normalized) {
    delete normalized.status;
    changed = true;
  }

  // Ensure isLocked exists and is boolean
  if (typeof normalized.isLocked !== 'boolean') {
    normalized.isLocked = false;
    changed = true;
  }

  // Migrate old date field names
  if (!normalized.startDate && normalized.periodStart) {
    normalized.startDate = normalized.periodStart;
    changed = true;
  }

  if (!normalized.endDate) {
    normalized.endDate = normalized.periodEnd || normalized.closingDate;
    changed = true;
  }

  // Ensure numeric fields exist
  if (typeof normalized.startingBalance !== 'number') {
    normalized.startingBalance = 0;
    changed = true;
  }

  if (typeof normalized.endingBalance !== 'number') {
    normalized.endingBalance =
      typeof normalized.total === 'number' ? normalized.total : 0;
    changed = true;
  }

  if (typeof normalized.totalCharges !== 'number') {
    normalized.totalCharges = 0;
    changed = true;
  }

  if (typeof normalized.totalPayments !== 'number') {
    normalized.totalPayments = 0;
    changed = true;
  }

  // Remove deprecated fields
  const deprecatedFields = [
    'periodStart',
    'periodEnd',
    'closingDate',
    'statementPeriod',
    'transactionIds',
    'isStartDateModified',
    'isEndDateModified',
    'isTotalModified',
    'lockedAt',
    'total',
  ];

  deprecatedFields.forEach((field) => {
    if (field in normalized) {
      delete normalized[field];
      changed = true;
    }
  });

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
};

const normalizeRecurringTransaction = (recurringTransaction, timestamp) => {
  const common = ensureCommonFields(recurringTransaction, timestamp);
  return common;
};

const normalizeRecurringTransactionEvent = (
  recurringTransactionEvent,
  timestamp,
) => {
  const common = ensureCommonFields(recurringTransactionEvent, timestamp);
  return common;
};

const normalizeTransactionSplit = (transactionSplit, timestamp) => {
  const common = ensureCommonFields(transactionSplit, timestamp);
  return common;
};

const normalizeCollection = (records, normalizer, timestamp, options) => {
  let changed = false;
  const normalized = (records || []).map((record) => {
    const result = normalizer(record, timestamp, options);
    changed = changed || result.changed;
    return result.normalized;
  });
  return { normalized, changed };
};

export const migrateDataToSchema = (
  {
    accounts = [],
    transactions = [],
    categories = [],
    statements = [],
    recurringTransactions = [],
    recurringTransactionEvents = [],
    transactionSplits = [],
  },
  options = {},
) => {
  const timestamp = options.timestamp || new Date().toISOString();
  const changes = {};

  const migratedAccounts = normalizeCollection(
    accounts,
    normalizeAccount,
    timestamp,
    options,
  );
  changes.accounts = migratedAccounts.changed;

  const migratedTransactions = normalizeCollection(
    transactions,
    normalizeTransaction,
    timestamp,
    options,
  );
  changes.transactions = migratedTransactions.changed;

  const migratedCategories = normalizeCollection(
    categories,
    normalizeCategory,
    timestamp,
    options,
  );
  changes.categories = migratedCategories.changed;

  const migratedStatements = normalizeCollection(
    statements,
    normalizeStatement,
    timestamp,
    options,
  );
  changes.statements = migratedStatements.changed;

  const migratedRecurringTransactions = normalizeCollection(
    recurringTransactions,
    normalizeRecurringTransaction,
    timestamp,
    options,
  );
  changes.recurringTransactions = migratedRecurringTransactions.changed;

  const migratedRecurringTransactionEvents = normalizeCollection(
    recurringTransactionEvents,
    normalizeRecurringTransactionEvent,
    timestamp,
    options,
  );
  changes.recurringTransactionEvents =
    migratedRecurringTransactionEvents.changed;

  const migratedTransactionSplits = normalizeCollection(
    transactionSplits,
    normalizeTransactionSplit,
    timestamp,
    options,
  );
  changes.transactionSplits = migratedTransactionSplits.changed;

  const changed = Object.values(changes).some(Boolean);

  return {
    data: {
      accounts: migratedAccounts.normalized,
      transactions: migratedTransactions.normalized,
      categories: migratedCategories.normalized,
      statements: migratedStatements.normalized,
      recurringTransactions: migratedRecurringTransactions.normalized,
      recurringTransactionEvents: migratedRecurringTransactionEvents.normalized,
      transactionSplits: migratedTransactionSplits.normalized,
    },
    changes,
    changed,
  };
};
