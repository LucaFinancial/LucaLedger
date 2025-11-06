import { createSelector } from '@reduxjs/toolkit';

/**
 * Returns all categories (flat array)
 */
export const selectAllCategories = (state) => state.categories;

/**
 * Returns only parent categories (no parentId)
 */
export const selectParentCategories = createSelector(
  [selectAllCategories],
  (categories) => categories.filter((cat) => !cat.parentId)
);

/**
 * Returns subcategories for a specific parent category
 */
export const selectSubcategoriesByParent = (parentId) =>
  createSelector([selectAllCategories], (categories) =>
    categories.filter((cat) => cat.parentId === parentId)
  );

/**
 * Returns a category by ID
 */
export const selectCategoryById = (categoryId) => (state) => {
  return state.categories.find((cat) => cat.id === categoryId);
};

/**
 * Returns categories in hierarchical structure (for backward compatibility)
 * This creates the nested structure that UI components expect
 */
export const selectCategoriesHierarchical = createSelector(
  [selectAllCategories],
  (categories) => {
    const parents = categories.filter((cat) => !cat.parentId);
    return parents.map((parent) => ({
      ...parent,
      subcategories: categories.filter((cat) => cat.parentId === parent.id),
    }));
  }
);
