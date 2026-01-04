import { useMemo } from 'react';
import {
  parseISO,
  differenceInMilliseconds,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';
import { constants as accountConstants } from '@/store/accounts';
import { constants as transactionConstants } from '@/store/transactions';

/**
 * Custom hook to filter transactions by time period and status
 * @param {Array} allTransactions - All transactions from Redux
 * @param {Object} dateRanges - Date ranges for filtering
 * @param {Object} accountMap - Map of account IDs to account info
 * @param {Function} isTransferTransaction - Function to check if transaction is a transfer
 * @returns {Object} Filtered transaction arrays
 */
export function useFilteredTransactions(
  allTransactions,
  dateRanges,
  accountMap,
  isTransferTransaction
) {
  // Filter recent transactions (last 14 days, excluding transfers and credit cards)
  const recentTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = parseISO(tx.date.replace(/\//g, '-'));
        const account = accountMap[tx.accountId];

        // Exclude transfers
        if (isTransferTransaction(tx)) {
          return false;
        }

        // Exclude credit card accounts
        if (account?.type === accountConstants.AccountType.CREDIT_CARD) {
          return false;
        }

        return (
          (isAfter(txDate, dateRanges.recentStart) ||
            isSameDay(txDate, dateRanges.recentStart)) &&
          (isBefore(txDate, dateRanges.todayEnd) ||
            isSameDay(txDate, dateRanges.todayEnd)) &&
          (tx.transactionState ===
            transactionConstants.TransactionStateEnum.COMPLETED ||
            tx.transactionState ===
              transactionConstants.TransactionStateEnum.PENDING)
        );
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date.replace(/\//g, '-'));
        const dateB = parseISO(b.date.replace(/\//g, '-'));
        return differenceInMilliseconds(dateB, dateA);
      });
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

  // Current month transactions (completed only)
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = parseISO(tx.date.replace(/\//g, '-'));

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (isAfter(txDate, dateRanges.currentMonthStart) ||
          isSameDay(txDate, dateRanges.currentMonthStart)) &&
        (isBefore(txDate, dateRanges.currentMonthEnd) ||
          isSameDay(txDate, dateRanges.currentMonthEnd)) &&
        tx.transactionState ===
          transactionConstants.TransactionStateEnum.COMPLETED
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

  // All current month transactions (for projections)
  const allMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = parseISO(tx.date.replace(/\//g, '-'));

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (isAfter(txDate, dateRanges.currentMonthStart) ||
          isSameDay(txDate, dateRanges.currentMonthStart)) &&
        (isBefore(txDate, dateRanges.currentMonthEnd) ||
          isSameDay(txDate, dateRanges.currentMonthEnd))
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

  // Future transactions (next 30 days, excluding transfers and credit cards)
  const futureTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = parseISO(tx.date.replace(/\//g, '-'));
        const account = accountMap[tx.accountId];

        // Exclude transfers
        if (isTransferTransaction(tx)) {
          return false;
        }

        // Exclude credit card accounts
        if (account?.type === accountConstants.AccountType.CREDIT_CARD) {
          return false;
        }

        return (
          isAfter(txDate, dateRanges.today) &&
          (isBefore(txDate, dateRanges.futureEnd) ||
            isSameDay(txDate, dateRanges.futureEnd)) &&
          tx.transactionState ===
            transactionConstants.TransactionStateEnum.SCHEDULED
        );
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date.replace(/\//g, '-'));
        const dateB = parseISO(b.date.replace(/\//g, '-'));
        return differenceInMilliseconds(dateA, dateB);
      });
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

  return {
    recentTransactions,
    currentMonthTransactions,
    allMonthTransactions,
    futureTransactions,
  };
}
