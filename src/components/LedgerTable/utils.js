import { format, parseISO, getDate, addMonths, compareAsc } from 'date-fns';

import { generators as recurringTransactionGenerators } from '@/store/recurringTransactions';

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

/**
 * Generates virtual transactions from recurring transaction rules
 * @param {Array} recurringTransactions - Array of recurring transaction rules
 * @param {Map} realizedDatesMap - Map of "ruleId:date" -> realizedTransactionId
 * @param {Date} projectionEndDate - Date to forecast until
 * @returns {Array} Array of virtual transaction objects
 */
export const generateVirtualTransactions = (
  recurringTransactions,
  realizedDatesMap,
  projectionEndDate
) => {
  const virtualTransactions = [];
  const today = new Date();
  // Default to 15 months if not provided (legacy support)
  const endDate = projectionEndDate || addMonths(today, 15);

  recurringTransactions.forEach((rule) => {
    const occurrenceDates =
      recurringTransactionGenerators.generateOccurrenceDates(
        rule,
        today,
        endDate
      );

    occurrenceDates.forEach((dateStr) => {
      // Check if this occurrence has been realized
      const key = `${rule.id}:${dateStr}`;
      if (realizedDatesMap.has(key)) {
        return; // Skip realized occurrences
      }

      // Create a virtual transaction
      virtualTransactions.push({
        id: `virtual-${rule.id}-${dateStr}`,
        accountId: rule.accountId,
        date: dateStr,
        amount: rule.amount,
        description: rule.description,
        categoryId: rule.categoryId,
        status: 'recurring',
        isVirtual: true,
        recurringTransactionId: rule.id,
        recurringTransaction: rule,
      });
    });
  });

  return virtualTransactions;
};
