import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { constants as accountConstants } from '@/store/accounts';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';

export const useAccountBalances = (accounts) => {
  // Get all transactions for the provided accounts
  const accountIds = useMemo(() => accounts.map((a) => a.id), [accounts]);
  const allRelevantTransactions = useSelector(
    transactionSelectors.selectTransactionsByAccountIds(accountIds)
  );

  return useMemo(() => {
    const totals = {
      current: 0,
      pending: 0,
      scheduled: 0,
      future: 0,
    };

    const creditCardTotals = {
      current: 0,
      pending: 0,
      scheduled: 0,
      future: 0,
    };

    const { COMPLETE, PENDING, SCHEDULED, PLANNED } =
      transactionConstants.TransactionStateEnum;

    const processedAccounts = accounts.map((account) => {
      // Filter transactions for this specific account
      const transactions = allRelevantTransactions.filter(
        (t) => t.accountId === account.id
      );

      const balances = {
        current: calculateBalance(transactions, [COMPLETE]),
        pending: calculateBalance(transactions, [COMPLETE, PENDING]),
        scheduled: calculateBalance(transactions, [
          COMPLETE,
          PENDING,
          SCHEDULED,
        ]),
        future: calculateBalance(transactions, [
          COMPLETE,
          PENDING,
          SCHEDULED,
          PLANNED,
        ]),
      };

      if (account.type === accountConstants.AccountType.CREDIT_CARD) {
        // For credit cards, track the balance separately
        // Positive balance means money owed
        Object.keys(balances).forEach((key) => {
          creditCardTotals[key] += Math.abs(balances[key]);
        });
      } else if (
        account.type === accountConstants.AccountType.CHECKING ||
        account.type === accountConstants.AccountType.SAVINGS
      ) {
        // Only include checking and savings in main totals
        Object.keys(balances).forEach((key) => {
          totals[key] += balances[key];
        });
      }

      return { ...account, ...balances };
    });

    return { accounts: processedAccounts, totals, creditCardTotals };
  }, [accounts, allRelevantTransactions]);
};

const calculateBalance = (transactions, statuses) => {
  return transactions
    .filter((tx) => statuses.includes(tx.transactionState))
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
};
