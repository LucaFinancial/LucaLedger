import { describe, expect, it } from 'vitest';
import {
  buildCategoriesById,
  buildSplitsByTransactionId,
  hasTransactionInvalidCategories,
  isTransactionUncategorized,
  transactionMatchesCategoryFilter,
} from '@/utils/transactionCategoryState';

const categories = [
  { id: 'food', name: 'Food', parentId: null },
  { id: 'groceries', name: 'Groceries', parentId: 'food' },
  { id: 'utilities', name: 'Utilities', parentId: null },
];

describe('transactionCategoryState', () => {
  it('treats split categories as the authoritative ledger category', () => {
    const transaction = {
      id: 'txn-1',
      categoryId: 'deleted-category',
    };
    const categoriesById = buildCategoriesById(categories);
    const splitsByTransaction = buildSplitsByTransactionId([
      {
        id: 'split-1',
        transactionId: 'txn-1',
        categoryId: 'groceries',
        amount: 1250,
      },
    ]);

    expect(
      transactionMatchesCategoryFilter(
        transaction,
        'groc',
        categoriesById,
        splitsByTransaction,
      ),
    ).toBe(true);
    expect(
      transactionMatchesCategoryFilter(
        transaction,
        'food',
        categoriesById,
        splitsByTransaction,
      ),
    ).toBe(true);
    expect(
      transactionMatchesCategoryFilter(
        transaction,
        'util',
        categoriesById,
        splitsByTransaction,
      ),
    ).toBe(false);
    expect(
      hasTransactionInvalidCategories(
        transaction,
        categoriesById,
        splitsByTransaction,
      ),
    ).toBe(false);
  });

  it('does not count fully categorized split transactions as uncategorized', () => {
    const transaction = {
      id: 'txn-2',
      categoryId: null,
    };
    const splitsByTransaction = buildSplitsByTransactionId([
      {
        id: 'split-2',
        transactionId: 'txn-2',
        categoryId: 'groceries',
        amount: 500,
      },
      {
        id: 'split-3',
        transactionId: 'txn-2',
        categoryId: 'utilities',
        amount: 500,
      },
    ]);

    expect(isTransactionUncategorized(transaction, splitsByTransaction)).toBe(
      false,
    );
  });

  it('flags partially categorized splits as uncategorized', () => {
    const transaction = {
      id: 'txn-3',
      categoryId: null,
    };
    const splitsByTransaction = buildSplitsByTransactionId([
      {
        id: 'split-4',
        transactionId: 'txn-3',
        categoryId: 'groceries',
        amount: 500,
      },
      {
        id: 'split-5',
        transactionId: 'txn-3',
        categoryId: null,
        amount: 500,
      },
    ]);

    expect(isTransactionUncategorized(transaction, splitsByTransaction)).toBe(
      true,
    );
  });

  it('still falls back to the primary category when no splits exist', () => {
    const transaction = {
      id: 'txn-4',
      categoryId: 'utilities',
    };
    const categoriesById = buildCategoriesById(categories);
    const splitsByTransaction = buildSplitsByTransactionId([]);

    expect(
      transactionMatchesCategoryFilter(
        transaction,
        'util',
        categoriesById,
        splitsByTransaction,
      ),
    ).toBe(true);
    expect(
      isTransactionUncategorized(transaction, splitsByTransaction),
    ).toBe(false);
  });
});
