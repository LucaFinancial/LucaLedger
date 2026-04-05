const SAME_SIGN = 'same-sign';
const OPPOSITE_SIGN = 'opposite-sign';

const getTimestampValue = (link) => {
  const candidate = link?.updatedAt || link?.createdAt || null;
  const parsed = candidate ? Date.parse(candidate) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildInvalidResult = (reason) => ({
  valid: false,
  reason,
});

const inferIsSameSignFromAmounts = (amountA = 0, amountB = 0) => {
  const amountASign = Math.sign(amountA);
  const amountBSign = Math.sign(amountB);

  if (amountASign === 0 || amountBSign === 0) {
    return true;
  }

  return amountASign === amountBSign;
};

const getLinkedId = (link, id, sourceKey, destinationKey) => {
  if (!link || !id) return null;
  if (link[sourceKey] === id) return link[destinationKey];
  if (link[destinationKey] === id) return link[sourceKey];
  return null;
};

const buildNormalizedLinkCollection = ({
  links = [],
  validIdSet,
  sourceKey,
  destinationKey,
  recordById = null,
}) => {
  const activeLinks = [];
  const deletedLinks = [];
  const usedIds = new Set();

  const sortedLinks = [...links].sort(
    (left, right) => getTimestampValue(right) - getTimestampValue(left),
  );

  sortedLinks.forEach((link) => {
    const sourceId = link?.[sourceKey];
    const destinationId = link?.[destinationKey];

    if (
      !sourceId ||
      !destinationId ||
      sourceId === destinationId ||
      !validIdSet.has(sourceId) ||
      !validIdSet.has(destinationId)
    ) {
      return;
    }

    const sourceRecord = recordById?.get(sourceId) || null;
    const destinationRecord = recordById?.get(destinationId) || null;
    const normalizedLink =
      typeof link?.isSameSign === 'boolean'
        ? link
        : {
            ...link,
            isSameSign: inferIsSameSignFromAmounts(
              sourceRecord?.amount ?? 0,
              destinationRecord?.amount ?? 0,
            ),
          };

    if (!isLinkActive(normalizedLink)) {
      deletedLinks.push(normalizedLink);
      return;
    }

    if (usedIds.has(sourceId) || usedIds.has(destinationId)) {
      return;
    }

    usedIds.add(sourceId);
    usedIds.add(destinationId);
    activeLinks.push(normalizedLink);
  });

  return [...activeLinks, ...deletedLinks];
};

const hasMatchingScheduleShape = (sourceTransaction, destinationTransaction) =>
  sourceTransaction.startOn === destinationTransaction.startOn &&
  sourceTransaction.frequency === destinationTransaction.frequency &&
  sourceTransaction.interval === destinationTransaction.interval &&
  (sourceTransaction.endOn || null) === (destinationTransaction.endOn || null);

export const LINK_ORIENTATION = Object.freeze({
  SAME_SIGN,
  OPPOSITE_SIGN,
});

export const LINK_VALIDATION_REASONS = Object.freeze({
  MISSING_RECORD: 'Both records must exist.',
  SAME_RECORD: 'A record cannot be linked to itself.',
  SAME_ACCOUNT: 'Linked records must belong to different accounts.',
  SOURCE_ALREADY_LINKED: 'This record is already linked to another record.',
  TARGET_ALREADY_LINKED: 'That record is already linked to another record.',
  DATE_MISMATCH: 'Linked transactions must share the same date.',
  AMOUNT_MISMATCH: 'Linked records must share the same absolute amount.',
  SOURCE_HAS_SPLITS: 'Transactions with splits cannot be linked yet.',
  TARGET_HAS_SPLITS: 'Transactions with splits cannot be linked yet.',
  SCHEDULE_MISMATCH:
    'Linked recurring transactions must share the same schedule.',
});

export const isLinkActive = (link) => !link?.deletedAt;

export const getTransactionLinkEndpoints = (link) => [
  link?.sourceTransactionId ?? null,
  link?.destinationTransactionId ?? null,
];

export const getRecurringTransactionLinkEndpoints = (link) => [
  link?.sourceRecurringTransactionId ?? null,
  link?.destinationRecurringTransactionId ?? null,
];

export const getLinkedTransactionId = (link, transactionId) =>
  getLinkedId(
    link,
    transactionId,
    'sourceTransactionId',
    'destinationTransactionId',
  );

export const getLinkedRecurringTransactionId = (link, recurringTransactionId) =>
  getLinkedId(
    link,
    recurringTransactionId,
    'sourceRecurringTransactionId',
    'destinationRecurringTransactionId',
  );

export const buildLinkMapById = (
  links = [],
  { sourceKey, destinationKey, activeOnly = true },
) => {
  const linkMap = new Map();

  links.forEach((link) => {
    if (activeOnly && !isLinkActive(link)) return;

    const sourceId = link?.[sourceKey];
    const destinationId = link?.[destinationKey];
    if (!sourceId || !destinationId) return;

    linkMap.set(sourceId, link);
    linkMap.set(destinationId, link);
  });

  return linkMap;
};

export const buildTransactionLinkMapByTransactionId = (links = []) =>
  buildLinkMapById(links, {
    sourceKey: 'sourceTransactionId',
    destinationKey: 'destinationTransactionId',
  });

export const buildRecurringLinkMapByRecurringTransactionId = (links = []) =>
  buildLinkMapById(links, {
    sourceKey: 'sourceRecurringTransactionId',
    destinationKey: 'destinationRecurringTransactionId',
  });

export const normalizeTransactionLinks = (
  links = [],
  validTransactionIds,
  transactionById = null,
) =>
  buildNormalizedLinkCollection({
    links,
    validIdSet: validTransactionIds,
    sourceKey: 'sourceTransactionId',
    destinationKey: 'destinationTransactionId',
    recordById: transactionById,
  });

export const normalizeRecurringTransactionLinks = (
  links = [],
  validRecurringTransactionIds,
  recurringTransactionById = null,
) =>
  buildNormalizedLinkCollection({
    links,
    validIdSet: validRecurringTransactionIds,
    sourceKey: 'sourceRecurringTransactionId',
    destinationKey: 'destinationRecurringTransactionId',
    recordById: recurringTransactionById,
  });

export const inferLinkIsSameSign = inferIsSameSignFromAmounts;

export const resolveLinkIsSameSign = ({
  link = null,
  amountA = 0,
  amountB = 0,
}) =>
  typeof link?.isSameSign === 'boolean'
    ? link.isSameSign
    : inferIsSameSignFromAmounts(amountA, amountB);

export const getSignOrientation = (amountA = 0, amountB = 0) => {
  return inferIsSameSignFromAmounts(amountA, amountB)
    ? SAME_SIGN
    : OPPOSITE_SIGN;
};

export const getCounterpartAmountForLinkedPair = ({
  sourceAmount,
  counterpartAmount,
  isSameSign,
  orientation = getSignOrientation(sourceAmount, counterpartAmount),
}) => {
  const absoluteAmount = Math.abs(sourceAmount);
  if (absoluteAmount === 0) return 0;

  const sourceSign = Math.sign(sourceAmount) || Math.sign(counterpartAmount) || 1;
  const resolvedIsSameSign =
    typeof isSameSign === 'boolean'
      ? isSameSign
      : orientation === SAME_SIGN;
  const counterpartSign = resolvedIsSameSign ? sourceSign : sourceSign * -1;

  return absoluteAmount * counterpartSign;
};

export const validateTransactionLinkCandidate = ({
  sourceTransaction,
  destinationTransaction,
  transactionLinks = [],
  sourceHasSplits = false,
  destinationHasSplits = false,
}) => {
  if (!sourceTransaction || !destinationTransaction) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.MISSING_RECORD);
  }

  if (sourceTransaction.id === destinationTransaction.id) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SAME_RECORD);
  }

  if (sourceTransaction.accountId === destinationTransaction.accountId) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SAME_ACCOUNT);
  }

  if (sourceHasSplits) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SOURCE_HAS_SPLITS);
  }

  if (destinationHasSplits) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.TARGET_HAS_SPLITS);
  }

  const linkMap = buildTransactionLinkMapByTransactionId(transactionLinks);
  const sourceLink = linkMap.get(sourceTransaction.id) || null;
  const destinationLink = linkMap.get(destinationTransaction.id) || null;

  if (
    sourceLink &&
    getLinkedTransactionId(sourceLink, sourceTransaction.id) !==
      destinationTransaction.id
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SOURCE_ALREADY_LINKED);
  }

  if (
    destinationLink &&
    getLinkedTransactionId(destinationLink, destinationTransaction.id) !==
      sourceTransaction.id
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.TARGET_ALREADY_LINKED);
  }

  if (sourceTransaction.date !== destinationTransaction.date) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.DATE_MISMATCH);
  }

  if (
    Math.abs(sourceTransaction.amount) !== Math.abs(destinationTransaction.amount)
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.AMOUNT_MISMATCH);
  }

  return { valid: true, reason: null };
};

export const validateRecurringLinkCandidate = ({
  sourceRecurringTransaction,
  destinationRecurringTransaction,
  recurringTransactionLinks = [],
}) => {
  if (!sourceRecurringTransaction || !destinationRecurringTransaction) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.MISSING_RECORD);
  }

  if (sourceRecurringTransaction.id === destinationRecurringTransaction.id) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SAME_RECORD);
  }

  if (
    sourceRecurringTransaction.accountId === destinationRecurringTransaction.accountId
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SAME_ACCOUNT);
  }

  const linkMap = buildRecurringLinkMapByRecurringTransactionId(
    recurringTransactionLinks,
  );
  const sourceLink = linkMap.get(sourceRecurringTransaction.id) || null;
  const destinationLink = linkMap.get(destinationRecurringTransaction.id) || null;

  if (
    sourceLink &&
    getLinkedRecurringTransactionId(sourceLink, sourceRecurringTransaction.id) !==
      destinationRecurringTransaction.id
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SOURCE_ALREADY_LINKED);
  }

  if (
    destinationLink &&
    getLinkedRecurringTransactionId(
      destinationLink,
      destinationRecurringTransaction.id,
    ) !== sourceRecurringTransaction.id
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.TARGET_ALREADY_LINKED);
  }

  if (
    Math.abs(sourceRecurringTransaction.amount) !==
    Math.abs(destinationRecurringTransaction.amount)
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.AMOUNT_MISMATCH);
  }

  if (
    !hasMatchingScheduleShape(
      sourceRecurringTransaction,
      destinationRecurringTransaction,
    )
  ) {
    return buildInvalidResult(LINK_VALIDATION_REASONS.SCHEDULE_MISMATCH);
  }

  return { valid: true, reason: null };
};

export const buildLinkPairKey = (firstId, secondId) =>
  [firstId, secondId].filter(Boolean).sort().join('::');
