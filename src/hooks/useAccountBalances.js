import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { utils as accountUtils } from '@/store/accounts';
import {
  constants as transactionConstants,
  selectors as transactionSelectors,
} from '@/store/transactions';

export const useAccountBalances = (accounts) => {
  // Get all transactions for the provided accounts
  const accountIds = useMemo(() => accounts.map((a) => a.id), [accounts]);
  const allRelevantTransactions = useSelector(
    transactionSelectors.selectTransactionsByAccountIds(accountIds),
  );

  return useMemo(
    () => buildAccountBalanceSummary(accounts, allRelevantTransactions),
    [accounts, allRelevantTransactions],
  );
};

export const buildAccountBalanceSummary = (
  accounts,
  allRelevantTransactions,
) => {
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

  const { COMPLETED, PENDING, SCHEDULED, PLANNED } =
    transactionConstants.TransactionStateEnum;

  const processedAccounts = accounts.map((account) => {
    // Filter transactions for this specific account
    const transactions = allRelevantTransactions.filter(
      (t) => t.accountId === account.id,
    );

    const balances = {
      current: calculateBalance(transactions, [COMPLETED]),
      pending: calculateBalance(transactions, [COMPLETED, PENDING]),
      scheduled: calculateBalance(transactions, [
        COMPLETED,
        PENDING,
        SCHEDULED,
      ]),
      future: calculateBalance(transactions, [
        COMPLETED,
        PENDING,
        SCHEDULED,
        PLANNED,
      ]),
    };

    if (accountUtils.isCreditCardAccountType(account.type)) {
      // Track the combined signed credit card balance separately.
      Object.keys(balances).forEach((key) => {
        creditCardTotals[key] += balances[key];
      });
    } else if (accountUtils.isIncludedInBalanceTotals(account.type)) {
      // Only include liquid cash account types in main totals
      Object.keys(balances).forEach((key) => {
        totals[key] += balances[key];
      });
    }

    return { ...account, ...balances };
  });

  return { accounts: processedAccounts, totals, creditCardTotals };
};

export const calculateBalance = (transactions, statuses) => {
  return transactions
    .filter((tx) => statuses.includes(tx.transactionState))
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
};
