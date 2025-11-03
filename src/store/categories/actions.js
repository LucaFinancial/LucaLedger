import { v4 as uuid } from 'uuid';
import {
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  removeCategory as removeCategoryAction,
  addSubcategory as addSubcategoryAction,
  updateSubcategory as updateSubcategoryAction,
  removeSubcategory as removeSubcategoryAction,
} from './slice';

/**
 * Generate a slug from a name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Create a new category
 */
export const createCategory = (name) => (dispatch) => {
  const category = {
    id: uuid(),
    slug: generateSlug(name),
    name,
    subcategories: [],
  };
  dispatch(addCategoryAction(category));
  return category;
};

/**
 * Update an existing category
 */
export const updateCategory = (categoryId, updates) => (dispatch, getState) => {
  const state = getState();
  const category = state.categories.find((cat) => cat.id === categoryId);

  if (!category) {
    throw new Error(`Category with id ${categoryId} not found`);
  }

  const updatedCategory = {
    ...category,
    ...updates,
    // Update slug if name changed
    slug: updates.name ? generateSlug(updates.name) : category.slug,
  };

  dispatch(updateCategoryAction(updatedCategory));
  return updatedCategory;
};

/**
 * Delete a category
 */
export const deleteCategory = (categoryId) => (dispatch) => {
  dispatch(removeCategoryAction(categoryId));
};

/**
 * Create a new subcategory
 */
export const createSubcategory = (categoryId, name) => (dispatch) => {
  const subcategory = {
    id: uuid(),
    slug: generateSlug(name),
    name,
  };
  dispatch(addSubcategoryAction({ categoryId, subcategory }));
  return subcategory;
};

/**
 * Update an existing subcategory
 */
export const updateSubcategory =
  (categoryId, subcategoryId, updates) => (dispatch, getState) => {
    const state = getState();
    const category = state.categories.find((cat) => cat.id === categoryId);

    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }

    const subcategory = category.subcategories.find(
      (sub) => sub.id === subcategoryId
    );

    if (!subcategory) {
      throw new Error(`Subcategory with id ${subcategoryId} not found`);
    }

    const updatedSubcategory = {
      ...subcategory,
      ...updates,
      // Update slug if name changed
      slug: updates.name ? generateSlug(updates.name) : subcategory.slug,
    };

    dispatch(
      updateSubcategoryAction({ categoryId, subcategory: updatedSubcategory })
    );
    return updatedSubcategory;
  };

/**
 * Delete a subcategory
 */
export const deleteSubcategory = (categoryId, subcategoryId) => (dispatch) => {
  dispatch(removeSubcategoryAction({ categoryId, subcategoryId }));
};
