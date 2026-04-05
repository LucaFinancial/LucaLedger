import { useMemo } from 'react';
import { add } from 'date-fns';
import { useSelector } from 'react-redux';

import { selectors as accountSelectors } from '@/store/accounts';
import { selectors as categorySelectors } from '@/store/categories';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as settingsSelectors } from '@/store/settings';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { selectors as transactionSelectors } from '@/store/transactions';
import {
  buildAvailableSpendingPeriods,
  buildDashboardSpendingHistoryData,
  getSpendingPeriodConfig,
} from '@/utils/spendingAnalytics';
import {
  filterRecurringTransactionsByAccountIds,
  filterTransactionSplitsByTransactionIds,
  filterTransactionsByAccountIds,
} from '@/views/Dashboard/utils/dashboardUtils';

export default function useSpendingHistorySectionData({
  includedAccountIds,
  activeSelection,
}) {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectTransactionSplits,
  );
  const categories = useSelector(categorySelectors.selectAllCategories);
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactions,
  );
  const realizedDatesMap = useSelector(
    recurringTransactionEventSelectors.selectAllRealizedDatesMap,
  );
  const recurringProjection = useSelector(
    settingsSelectors.selectRecurringProjection,
  );

  const includedAccountIdSet = useMemo(
    () =>
      includedAccountIds == null ? null : new Set(includedAccountIds),
    [includedAccountIds],
  );

  const filteredAccounts = useMemo(() => {
    if (!includedAccountIdSet) {
      return accounts;
    }

    return accounts.filter((account) => includedAccountIdSet.has(account.id));
  }, [accounts, includedAccountIdSet]);

  const filteredTransactions = useMemo(() => {
    if (!includedAccountIdSet) {
      return allTransactions;
    }

    return filterTransactionsByAccountIds(allTransactions, includedAccountIdSet);
  }, [allTransactions, includedAccountIdSet]);

  const filteredTransactionIds = useMemo(
    () => new Set(filteredTransactions.map((transaction) => transaction.id)),
    [filteredTransactions],
  );

  const filteredTransactionSplits = useMemo(() => {
    if (!includedAccountIdSet) {
      return transactionSplits;
    }

    return filterTransactionSplitsByTransactionIds(
      transactionSplits,
      filteredTransactionIds,
    );
  }, [transactionSplits, includedAccountIdSet, filteredTransactionIds]);

  const filteredRecurringTransactions = useMemo(() => {
    if (!includedAccountIdSet) {
      return recurringTransactions;
    }

    return filterRecurringTransactionsByAccountIds(
      recurringTransactions,
      includedAccountIdSet,
    );
  }, [recurringTransactions, includedAccountIdSet]);

  const projectionEndDate = useMemo(
    () =>
      add(new Date(), {
        [recurringProjection.unit]: recurringProjection.amount,
      }),
    [recurringProjection],
  );

  const accountsById = useMemo(
    () => new Map(filteredAccounts.map((account) => [account.id, account.name])),
    [filteredAccounts],
  );

  const spendingCategoryFilter = useMemo(() => {
    const categoriesById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const excludedCategoryIds = new Set();

    categories.forEach((category) => {
      if (category.slug === 'income' || category.slug === 'transfers') {
        excludedCategoryIds.add(category.id);
        return;
      }

      if (!category.parentId) return;

      const parentCategory = categoriesById.get(category.parentId);
      if (
        parentCategory?.slug === 'income' ||
        parentCategory?.slug === 'transfers'
      ) {
        excludedCategoryIds.add(category.id);
      }
    });

    return (categoryId) =>
      Boolean(categoryId) && !excludedCategoryIds.has(categoryId);
  }, [categories]);

  const { availableMonths, availableYears } = useMemo(
    () =>
      buildAvailableSpendingPeriods({
        allTransactions: filteredTransactions,
        transactionSplits: filteredTransactionSplits,
        recurringTransactions: filteredRecurringTransactions,
        realizedDatesMap,
        projectionEndDate,
        categoryIdFilter: spendingCategoryFilter,
      }),
    [
      filteredTransactions,
      filteredTransactionSplits,
      filteredRecurringTransactions,
      realizedDatesMap,
      projectionEndDate,
      spendingCategoryFilter,
    ],
  );

  const periodConfig = useMemo(
    () =>
      getSpendingPeriodConfig(activeSelection, {
        availableMonths,
        availableYears,
      }),
    [activeSelection, availableMonths, availableYears],
  );

  const {
    categories: categoryData,
    totalExpenses,
    monthlyAvgExpenses,
    totalTransactions,
    showStateBreakdown,
    stateTotals,
  } = useMemo(
    () =>
      buildDashboardSpendingHistoryData({
        allTransactions: filteredTransactions,
        transactionSplits: filteredTransactionSplits,
        categories,
        recurringTransactions: filteredRecurringTransactions,
        realizedDatesMap,
        periodConfig,
      }),
    [
      filteredTransactions,
      filteredTransactionSplits,
      categories,
      filteredRecurringTransactions,
      realizedDatesMap,
      periodConfig,
    ],
  );

  const pieData = useMemo(
    () =>
      categoryData.map((category) => ({
        name: category.name,
        value: category.total,
      })),
    [categoryData],
  );

  return {
    accountsById,
    availableMonths,
    availableYears,
    categoryData,
    monthlyAvgExpenses,
    periodConfig,
    pieData,
    showStateBreakdown,
    stateTotals,
    totalExpenses,
    totalTransactions,
  };
}
