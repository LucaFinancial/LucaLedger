import { format, parseISO } from 'date-fns';

import { TransactionStateEnum } from '@/store/transactions/constants';
import { centsToDollars, doublePrecisionFormatString } from '@/utils';

import {
  LEDGER_STATE_META,
  RECURRING_TEXT_COLOR,
} from './spendingHistoryConstants';

export function formatCurrency(amount) {
  const safeAmount = amount == null || Number.isNaN(amount) ? 0 : amount;

  return `$${doublePrecisionFormatString(safeAmount)}`;
}

export function formatCurrencyFromCents(amount) {
  return formatCurrency(centsToDollars(amount));
}

export function formatTransactionDate(dateValue) {
  if (!dateValue) return '--';

  try {
    return format(
      parseISO(String(dateValue).replace(/\//g, '-')),
      'MMM d, yyyy',
    );
  } catch {
    return String(dateValue);
  }
}

export function getTransactionDetailTextColor(transactionDetail) {
  if (
    transactionDetail.sourceType === 'recurring' ||
    transactionDetail.transactionState === 'recurring'
  ) {
    return RECURRING_TEXT_COLOR;
  }

  switch (transactionDetail.transactionState) {
    case TransactionStateEnum.COMPLETED:
      return LEDGER_STATE_META.completed.color;
    case TransactionStateEnum.PENDING:
      return LEDGER_STATE_META.pending.color;
    case TransactionStateEnum.SCHEDULED:
      return LEDGER_STATE_META.scheduled.color;
    case TransactionStateEnum.PLANNED:
      return LEDGER_STATE_META.planned.color;
    default:
      return 'inherit';
  }
}

function getTransactionDetailSortValue(transactionDetail) {
  if (!transactionDetail?.date) return 0;

  try {
    const parsedTime = parseISO(
      String(transactionDetail.date).replace(/\//g, '-'),
    ).getTime();

    return Number.isNaN(parsedTime) ? 0 : parsedTime;
  } catch {
    return 0;
  }
}

export function sortTransactionDetailsForDirection(transactions, direction) {
  const sortMultiplier = direction === 'asc' ? 1 : -1;

  return [...transactions].sort((left, right) => {
    const leftTime = getTransactionDetailSortValue(left);
    const rightTime = getTransactionDetailSortValue(right);

    if (leftTime !== rightTime) {
      return (leftTime - rightTime) * sortMultiplier;
    }

    return String(left.description || '').localeCompare(
      String(right.description || ''),
    );
  });
}
