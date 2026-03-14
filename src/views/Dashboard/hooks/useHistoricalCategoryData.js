import { useMemo } from 'react';
import {
  parseISO,
  startOfDay,
  isBefore,
  isAfter,
} from 'date-fns';
import { constants as transactionConstants } from '@/store/transactions';

/**
 * Computes categorized expense data for a historical date range.
 *
 * @param {object} params
 * @param {Array} params.allTransactions
 * @param {Array} params.allCategories - hierarchical category list
 * @param {Date} params.startDate
 * @param {Date} params.endDate
 * @param {number} params.numMonths - denominator for monthly averages
 * @returns {{ categories, totalExpenses, monthlyAvgExpenses, totalTransactions }}
 */
export function useHistoricalCategoryData({
  allTransactions,
  allCategories,
  startDate,
  endDate,
  numMonths,
}) {
  return useMemo(() => {
    // Identify transfer and income category IDs to exclude
    const transfersCategory = allCategories.find((c) => c.slug === 'transfers');
    const allTransferIds = transfersCategory
      ? [transfersCategory.id, ...transfersCategory.subcategories.map((s) => s.id)]
      : [];

    const incomeCategory = allCategories.find((c) => c.slug === 'income');
    const allIncomeIds = incomeCategory
      ? [incomeCategory.id, ...incomeCategory.subcategories.map((s) => s.id)]
      : [];

    // Filter: date range, completed only, exclude transfers/income
    const periodTransactions = allTransactions.filter((tx) => {
      if (tx.transactionState !== transactionConstants.TransactionStateEnum.COMPLETED) {
        return false;
      }
      const txDate = startOfDay(parseISO(tx.date.replace(/\//g, '-')));
      if (isBefore(txDate, startDate) || isAfter(txDate, endDate)) {
        return false;
      }
      if (tx.categoryId && allTransferIds.includes(tx.categoryId)) return false;
      if (tx.categoryId && allIncomeIds.includes(tx.categoryId)) return false;
      return true;
    });

    // Aggregate by category / subcategory
    const categoryTotals = new Map();
    let totalExpenses = 0;

    periodTransactions.forEach((tx) => {
      const amount = Math.abs(tx.amount);
      totalExpenses += amount;

      if (!tx.categoryId) return;

      let parentCategory = null;
      let subcategoryInfo = null;

      for (const cat of allCategories) {
        if (cat.id === tx.categoryId) {
          parentCategory = cat;
          break;
        }
        const sub = cat.subcategories.find((s) => s.id === tx.categoryId);
        if (sub) {
          parentCategory = cat;
          subcategoryInfo = sub;
          break;
        }
      }

      if (!parentCategory) return;

      if (!categoryTotals.has(parentCategory.id)) {
        categoryTotals.set(parentCategory.id, {
          id: parentCategory.id,
          name: parentCategory.name,
          total: 0,
          count: 0,
          subcategories: new Map(),
        });
      }

      const catData = categoryTotals.get(parentCategory.id);
      catData.total += amount;
      catData.count += 1;

      if (subcategoryInfo) {
        if (!catData.subcategories.has(subcategoryInfo.id)) {
          catData.subcategories.set(subcategoryInfo.id, {
            id: subcategoryInfo.id,
            name: subcategoryInfo.name,
            total: 0,
            count: 0,
          });
        }
        const subData = catData.subcategories.get(subcategoryInfo.id);
        subData.total += amount;
        subData.count += 1;
      }
    });

    const safeMonths = Math.max(1, numMonths);

    const categories = Array.from(categoryTotals.values())
      .map((cat) => ({
        ...cat,
        monthlyAvg: cat.total / safeMonths,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
        subcategories: Array.from(cat.subcategories.values())
          .map((sub) => ({
            ...sub,
            monthlyAvg: sub.total / safeMonths,
            percentage: cat.total > 0 ? (sub.total / cat.total) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total),
      }))
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      categories,
      totalExpenses,
      monthlyAvgExpenses: totalExpenses / safeMonths,
      totalTransactions: periodTransactions.length,
    };
  }, [allTransactions, allCategories, startDate, endDate, numMonths]);
}
