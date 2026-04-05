import { format, getDate, getDay, parseISO } from 'date-fns';
import { LINK_VALIDATION_REASONS } from '@/utils/linking';

export const RECURRING_NEAR_MATCH_DAY_WINDOW = 5;

export const RESOLVABLE_RECURRING_LINK_REASONS = new Set([
  LINK_VALIDATION_REASONS.AMOUNT_MISMATCH,
  LINK_VALIDATION_REASONS.SCHEDULE_MISMATCH,
]);

export const formatRecurringLinkCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((amount || 0) / 100);

const formatScheduleDate = (dateValue) => {
  if (!dateValue) return '--';

  try {
    return format(parseISO(String(dateValue).replace(/\//g, '-')), 'MMM d, yyyy');
  } catch {
    return String(dateValue);
  }
};

export const formatRecurringScheduleLabel = (transaction) =>
  `Starts ${formatScheduleDate(transaction.startOn)} | Every ${transaction.interval} ${transaction.frequency}${transaction.endOn ? ` | Ends ${formatScheduleDate(transaction.endOn)}` : ''}`;

const parseScheduleDate = (dateValue) => {
  if (!dateValue) return null;

  try {
    return parseISO(String(dateValue).replace(/\//g, '-'));
  } catch {
    return null;
  }
};

export const getRecurringScheduleDayDistance = (
  sourceRecurringTransaction,
  destinationRecurringTransaction,
) => {
  const sourceDate = parseScheduleDate(sourceRecurringTransaction?.startOn);
  const destinationDate = parseScheduleDate(
    destinationRecurringTransaction?.startOn,
  );

  if (!sourceDate || !destinationDate) return Number.POSITIVE_INFINITY;

  if (
    sourceRecurringTransaction?.frequency === 'WEEK' &&
    destinationRecurringTransaction?.frequency === 'WEEK'
  ) {
    const rawDistance = Math.abs(getDay(sourceDate) - getDay(destinationDate));
    return Math.min(rawDistance, 7 - rawDistance);
  }

  return Math.abs(getDate(sourceDate) - getDate(destinationDate));
};
