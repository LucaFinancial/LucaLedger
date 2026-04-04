export const buildCategoriesById = (categories = []) =>
  new Map(categories.map((category) => [category.id, category]));

export const buildSplitsByTransactionId = (transactionSplits = []) => {
  const splitsByTransaction = new Map();

  transactionSplits.forEach((split) => {
    const existingSplits = splitsByTransaction.get(split.transactionId);
    if (existingSplits) {
      existingSplits.push(split);
      return;
    }

    splitsByTransaction.set(split.transactionId, [split]);
  });

  return splitsByTransaction;
};

export const getTransactionSplits = (transaction, splitsByTransaction) =>
  splitsByTransaction.get(transaction.id) || [];

export const getEffectiveCategoryIds = (transaction, splitsByTransaction) => {
  const transactionSplits = getTransactionSplits(transaction, splitsByTransaction);

  if (transactionSplits.length > 0) {
    return transactionSplits.map((split) => split.categoryId ?? null);
  }

  return [transaction.categoryId ?? null];
};

const getEffectiveCategories = (
  transaction,
  categoriesById,
  splitsByTransaction,
) =>
  getEffectiveCategoryIds(transaction, splitsByTransaction)
    .map((categoryId) => (categoryId ? categoriesById.get(categoryId) : null))
    .filter(Boolean);

export const isTransactionUncategorized = (transaction, splitsByTransaction) =>
  getEffectiveCategoryIds(transaction, splitsByTransaction).some(
    (categoryId) => !categoryId,
  );

export const hasTransactionInvalidCategories = (
  transaction,
  categoriesById,
  splitsByTransaction,
) =>
  getEffectiveCategoryIds(transaction, splitsByTransaction).some(
    (categoryId) => categoryId && !categoriesById.has(categoryId),
  );

export const transactionMatchesCategoryFilter = (
  transaction,
  filterValue,
  categoriesById,
  splitsByTransaction,
) => {
  const normalizedFilter = filterValue.trim().toLowerCase();
  if (!normalizedFilter) {
    return false;
  }

  return getEffectiveCategories(
    transaction,
    categoriesById,
    splitsByTransaction,
  ).some((category) => {
    const parentCategory = category.parentId
      ? categoriesById.get(category.parentId)
      : null;

    return (
      category.name.toLowerCase().includes(normalizedFilter) ||
      parentCategory?.name.toLowerCase().includes(normalizedFilter)
    );
  });
};
