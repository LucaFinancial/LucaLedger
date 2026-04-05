import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { LINK_VALIDATION_REASONS } from '@/utils/linking';

export const TRANSACTION_NEAR_MATCH_DAY_WINDOW = 3;

export const RESOLVABLE_TRANSACTION_LINK_REASONS = new Set([
  LINK_VALIDATION_REASONS.DATE_MISMATCH,
  LINK_VALIDATION_REASONS.AMOUNT_MISMATCH,
]);

export const formatTransactionLinkCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((amount || 0) / 100);

export const formatTransactionLinkDateLabel = (dateValue) => {
  if (!dateValue) return '--';

  try {
    return format(parseISO(String(dateValue).replace(/\//g, '-')), 'MMM d, yyyy');
  } catch {
    return String(dateValue);
  }
};

export const getTransactionDateDistanceInDays = (leftDate, rightDate) => {
  if (!leftDate || !rightDate) return Number.POSITIVE_INFINITY;

  try {
    return Math.abs(
      differenceInCalendarDays(
        parseISO(String(leftDate).replace(/\//g, '-')),
        parseISO(String(rightDate).replace(/\//g, '-')),
      ),
    );
  } catch {
    return Number.POSITIVE_INFINITY;
  }
};
