import { format, parseISO, getDate, addMonths, compareAsc } from 'date-fns';

export const dateCompareFn = (a, b) => {
  const aDate = parseISO(a.date.replace(/\//g, '-'));
  const bDate = parseISO(b.date.replace(/\//g, '-'));
  return compareAsc(aDate, bDate);
};

export const computeStatementMonth = (transaction, statementDay) => {
  const transactionDate = parseISO(transaction.date.replace(/\//g, '-'));
  return getDate(transactionDate) >= statementDay
    ? format(addMonths(transactionDate, 1), 'MMMM yyyy')
    : format(transactionDate, 'MMMM yyyy');
};
