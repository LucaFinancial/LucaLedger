import { v4 as uuid } from 'uuid';
import {
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  removeCategory as removeCategoryAction,
} from './slice';

/**
 * Generate a slug from a name
 * Falls back to 'untitled' if the name contains only special characters
 */
const generateSlug = (name) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'untitled';
};

/**
 * Create a new parent category
 */
export const createCategory = (name) => (dispatch) => {
  const category = {
    id: uuid(),
    slug: generateSlug(name),
    name,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  dispatch(addCategoryAction(category));
  return category;
};

/**
 * Create a new subcategory
 */
export const createSubcategory = (parentId, name) => (dispatch) => {
  const subcategory = {
    id: uuid(),
    slug: generateSlug(name),
    name,
    parentId,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  dispatch(addCategoryAction(subcategory));
  return subcategory;
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
 * Delete a category (and all its subcategories if it's a parent)
 */
export const deleteCategory = (categoryId) => (dispatch) => {
  dispatch(removeCategoryAction(categoryId));
};
