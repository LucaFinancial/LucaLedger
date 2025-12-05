import { format, parseISO, getDate, addMonths } from 'date-fns';

import config from '@/config';

export const dateCompareFn = (a, b) => {
  const aDate = format(
    parseISO(a.date.replace(/\//g, '-')),
    config.compareDateFormatString.replace(/\//g, '-')
  );
  const bDate = format(
    parseISO(b.date.replace(/\//g, '-')),
    config.compareDateFormatString.replace(/\//g, '-')
  );
  if (aDate < bDate) {
    return -1;
  }
  if (aDate > bDate) {
    return 1;
  }
  return 0;
};

export const computeStatementMonth = (transaction, statementDay) => {
  const transactionDate = parseISO(transaction.date.replace(/\//g, '-'));
  return getDate(transactionDate) >= statementDay
    ? format(addMonths(transactionDate, 1), 'MMMM yyyy')
    : format(transactionDate, 'MMMM yyyy');
};
