import { createSelector } from '@reduxjs/toolkit';

export const selectCategories = (state) => state.categories;

export const selectAllCategories = createSelector(
  selectCategories,
  (categories) => categories.categoriesList
);
