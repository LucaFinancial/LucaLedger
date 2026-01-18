import { createSelector } from '@reduxjs/toolkit';

export const selectTransactionSplits = (state) => state.transactionSplits;

export const selectSplitsByTransactionId = (transactionId) =>
  createSelector([selectTransactionSplits, () => transactionId], (splits, id) =>
    splits.filter((split) => split.transactionId === id)
  );

export const selectSplitsByCategoryId = (categoryId) =>
  createSelector([selectTransactionSplits, () => categoryId], (splits, id) =>
    splits.filter((split) => split.categoryId === id)
  );
