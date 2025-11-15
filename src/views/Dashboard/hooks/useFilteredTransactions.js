import { useMemo } from 'react';
import dayjs from 'dayjs';
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
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
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
          (txDate.isAfter(dateRanges.recentStart) ||
            txDate.isSame(dateRanges.recentStart, 'day')) &&
          (txDate.isBefore(dateRanges.todayEnd) ||
            txDate.isSame(dateRanges.todayEnd, 'day')) &&
          (tx.status === transactionConstants.TransactionStatusEnum.COMPLETE ||
            tx.status === transactionConstants.TransactionStatusEnum.PENDING)
        );
      })
      .sort((a, b) => {
        const dateA = dayjs(a.date, 'YYYY/MM/DD');
        const dateB = dayjs(b.date, 'YYYY/MM/DD');
        return dateB.diff(dateA);
      });
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

  // Current month transactions (completed only)
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD');

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day')) &&
        tx.status === transactionConstants.TransactionStatusEnum.COMPLETE
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

  // All current month transactions (for projections)
  const allMonthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = dayjs(tx.date, 'YYYY/MM/DD');

      // Exclude transfers
      if (isTransferTransaction(tx)) {
        return false;
      }

      return (
        (txDate.isAfter(dateRanges.currentMonthStart) ||
          txDate.isSame(dateRanges.currentMonthStart, 'day')) &&
        (txDate.isBefore(dateRanges.currentMonthEnd) ||
          txDate.isSame(dateRanges.currentMonthEnd, 'day'))
      );
    });
  }, [allTransactions, dateRanges, isTransferTransaction]);

  // Future transactions (next 30 days, excluding transfers and credit cards)
  const futureTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const txDate = dayjs(tx.date, 'YYYY/MM/DD');
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
          txDate.isAfter(dateRanges.today) &&
          (txDate.isBefore(dateRanges.futureEnd) ||
            txDate.isSame(dateRanges.futureEnd, 'day')) &&
          (tx.status === transactionConstants.TransactionStatusEnum.SCHEDULED ||
            tx.status === transactionConstants.TransactionStatusEnum.PLANNED)
        );
      })
      .sort((a, b) => {
        const dateA = dayjs(a.date, 'YYYY/MM/DD');
        const dateB = dayjs(b.date, 'YYYY/MM/DD');
        return dateA.diff(dateB);
      });
  }, [allTransactions, dateRanges, accountMap, isTransferTransaction]);

  return {
    recentTransactions,
    currentMonthTransactions,
    allMonthTransactions,
    futureTransactions,
  };
}
