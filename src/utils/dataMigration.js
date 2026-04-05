import { AccountTypeOptions } from '@/store/accounts/constants';
import { formatAccountType } from '@/store/accounts/utils';
import { TransactionStateEnum } from '@/store/transactions/constants';
import {
  inferLinkIsSameSign,
  normalizeRecurringTransactionLinks,
  normalizeTransactionLinks,
} from '@/utils/linking';

const ACCOUNT_TYPE_MAP = new Map(
  AccountTypeOptions.flatMap((accountType) => [
    [accountType, accountType],
    [formatAccountType(accountType), accountType],
  ]),
);

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

const normalizeAccountType = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (ACCOUNT_TYPE_MAP.has(trimmedValue)) {
    return ACCOUNT_TYPE_MAP.get(trimmedValue);
  }

  const upperSnakeCaseValue = trimmedValue
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (ACCOUNT_TYPE_MAP.has(upperSnakeCaseValue)) {
    return ACCOUNT_TYPE_MAP.get(upperSnakeCaseValue);
  }

  return null;
};

const normalizeAccount = (account, timestamp) => {
  let changed = false;
  const normalized = { ...account };

  const normalizedType = normalizeAccountType(normalized.type);

  if (normalizedType && normalizedType !== normalized.type) {
    normalized.type = normalizedType;
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

const normalizeTransactionLink = (transactionLink, timestamp, options = {}) => {
  let changed = false;
  const normalized = { ...transactionLink };
  const transactionMap = new Map(
    (options.transactions || []).map((transaction) => [transaction.id, transaction]),
  );

  if (typeof normalized.isSameSign !== 'boolean') {
    const sourceTransaction =
      transactionMap.get(normalized.sourceTransactionId) || null;
    const destinationTransaction =
      transactionMap.get(normalized.destinationTransactionId) || null;
    normalized.isSameSign = inferLinkIsSameSign(
      sourceTransaction?.amount ?? 0,
      destinationTransaction?.amount ?? 0,
    );
    changed = true;
  }

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
};

const normalizeRecurringTransactionLink = (
  recurringTransactionLink,
  timestamp,
  options = {},
) => {
  let changed = false;
  const normalized = { ...recurringTransactionLink };
  const recurringTransactionMap = new Map(
    (options.recurringTransactions || []).map((transaction) => [
      transaction.id,
      transaction,
    ]),
  );

  if (typeof normalized.isSameSign !== 'boolean') {
    const sourceRecurringTransaction =
      recurringTransactionMap.get(normalized.sourceRecurringTransactionId) ||
      null;
    const destinationRecurringTransaction =
      recurringTransactionMap.get(normalized.destinationRecurringTransactionId) ||
      null;
    normalized.isSameSign = inferLinkIsSameSign(
      sourceRecurringTransaction?.amount ?? 0,
      destinationRecurringTransaction?.amount ?? 0,
    );
    changed = true;
  }

  const common = ensureCommonFields(normalized, timestamp);
  return {
    normalized: common.normalized,
    changed: changed || common.changed,
  };
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
    recurringTransactionLinks = [],
    transactionSplits = [],
    transactionLinks = [],
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

  const migratedRecurringTransactionLinks = normalizeCollection(
    recurringTransactionLinks,
    normalizeRecurringTransactionLink,
    timestamp,
    {
      ...options,
      recurringTransactions: migratedRecurringTransactions.normalized,
    },
  );
  changes.recurringTransactionLinks = migratedRecurringTransactionLinks.changed;

  const migratedTransactionSplits = normalizeCollection(
    transactionSplits,
    normalizeTransactionSplit,
    timestamp,
    options,
  );
  changes.transactionSplits = migratedTransactionSplits.changed;

  const migratedTransactionLinks = normalizeCollection(
    transactionLinks,
    normalizeTransactionLink,
    timestamp,
    {
      ...options,
      transactions: migratedTransactions.normalized,
    },
  );
  changes.transactionLinks = migratedTransactionLinks.changed;

  const normalizedRecurringTransactionLinks = normalizeRecurringTransactionLinks(
    migratedRecurringTransactionLinks.normalized,
    new Set(migratedRecurringTransactions.normalized.map((rule) => rule.id)),
    new Map(
      migratedRecurringTransactions.normalized.map((rule) => [rule.id, rule]),
    ),
  );
  if (
    JSON.stringify(normalizedRecurringTransactionLinks) !==
    JSON.stringify(migratedRecurringTransactionLinks.normalized)
  ) {
    changes.recurringTransactionLinks = true;
  }

  const normalizedTransactionLinks = normalizeTransactionLinks(
    migratedTransactionLinks.normalized,
    new Set(migratedTransactions.normalized.map((transaction) => transaction.id)),
    new Map(
      migratedTransactions.normalized.map((transaction) => [
        transaction.id,
        transaction,
      ]),
    ),
  );
  if (
    JSON.stringify(normalizedTransactionLinks) !==
    JSON.stringify(migratedTransactionLinks.normalized)
  ) {
    changes.transactionLinks = true;
  }

  const changed = Object.values(changes).some(Boolean);

  return {
    data: {
      accounts: migratedAccounts.normalized,
      transactions: migratedTransactions.normalized,
      categories: migratedCategories.normalized,
      statements: migratedStatements.normalized,
      recurringTransactions: migratedRecurringTransactions.normalized,
      recurringTransactionEvents: migratedRecurringTransactionEvents.normalized,
      recurringTransactionLinks: normalizedRecurringTransactionLinks,
      transactionSplits: migratedTransactionSplits.normalized,
      transactionLinks: normalizedTransactionLinks,
    },
    changes,
    changed,
  };
};
