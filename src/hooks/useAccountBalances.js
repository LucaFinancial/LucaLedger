import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { constants as accountConstants } from '@/store/accounts';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';

export const useAccountBalances = (accounts) => {
  const allTransactions = useSelector(transactionSelectors.selectTransactions);

  return useMemo(() => {
    const totals = {
      current: 0,
      pending: 0,
      scheduled: 0,
      future: 0,
    };

    const { COMPLETE, PENDING, SCHEDULED, PLANNED } =
      transactionConstants.TransactionStatusEnum;

    const processedAccounts = accounts.map((account) => {
      // Filter transactions for this account
      const transactions = allTransactions.filter(
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
        Object.keys(balances).forEach((key) => {
          totals[key] -= Math.max(balances[key], 0);
        });
      } else {
        Object.keys(balances).forEach((key) => {
          totals[key] += balances[key];
        });
      }

      return { ...account, ...balances };
    });

    return { accounts: processedAccounts, totals };
  }, [accounts, allTransactions]);
};

const calculateBalance = (transactions, statuses) => {
  return transactions
    .filter((tx) => statuses.includes(tx.status))
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
};
