/**
 * Sample Category Data Fixtures
 * Reusable test data for category-related tests
 */

// Valid parent category
export const validParentCategory = {
  id: 'cat-parent-001',
  slug: 'test-parent',
  name: 'Test Parent Category',
  parentId: null,
};

// Valid category with subcategories
export const validCategoryWithSubcategories = {
  id: 'cat-parent-002',
  slug: 'custom-category',
  name: 'Custom Category',
  parentId: null,
};

// Valid subcategory
export const validSubcategory = {
  id: 'cat-sub-003',
  slug: 'standalone-subcategory',
  name: 'Standalone Subcategory',
};

// Flat categories for store (as used in Redux store)
export const flatCategories = [
  {
    id: 'flat-cat-001',
    slug: 'parent-one',
    name: 'Parent One',
    parentId: null,
  },
  {
    id: 'flat-cat-002',
    slug: 'parent-one-child',
    name: 'Child of Parent One',
    parentId: 'flat-cat-001',
  },
  {
    id: 'flat-cat-003',
    slug: 'parent-two',
    name: 'Parent Two',
    parentId: null,
  },
];

// Collection of valid categories
export const validCategories = [
  validParentCategory,
  validCategoryWithSubcategories,
  // include a sample subcategory as flat entry
  {
    id: 'cat-sub-001',
    slug: 'custom-subcategory-one',
    name: 'Custom Subcategory One',
    parentId: 'cat-parent-002',
  },
  {
    id: 'cat-sub-002',
    slug: 'custom-subcategory-two',
    name: 'Custom Subcategory Two',
    parentId: 'cat-parent-002',
  },
];

// Invalid Category Fixtures
export const categoryMissingId = {
  slug: 'missing-id',
  name: 'Missing ID',
  parentId: null,
};

export const categoryMissingSlug = {
  id: 'cat-missing-slug',
  name: 'Missing Slug',
  parentId: null,
};

export const categoryMissingName = {
  id: 'cat-missing-name',
  slug: 'missing-name',
  parentId: null,
};

export const categoryMissingSubcategories = {
  id: 'cat-missing-subs',
  slug: 'missing-subcategories',
  name: 'Missing Subcategories',
};

// For new flat schema the equivalent missing-field fixture is missing parentId
export const categoryMissingParentId = {
  id: 'cat-missing-parent',
  slug: 'missing-parent',
  name: 'Missing Parent',
};

export const categoryEmptyId = {
  id: '',
  slug: 'empty-id',
  name: 'Empty ID',
  parentId: null,
};

export const categoryEmptySlug = {
  id: 'cat-empty-slug',
  slug: '',
  name: 'Empty Slug',
  parentId: null,
};

export const categoryEmptyName = {
  id: 'cat-empty-name',
  slug: 'empty-name',
  name: '',
  parentId: null,
};

export const categoryInvalidSlug = {
  id: 'cat-invalid-slug',
  slug: 'Invalid Slug With Spaces', // Slugs should be kebab-case
  name: 'Invalid Slug',
  parentId: null,
};

export const categoryInvalidSlugUppercase = {
  id: 'cat-invalid-slug-upper',
  slug: 'Invalid-Slug', // Contains uppercase
  name: 'Invalid Slug Uppercase',
  parentId: null,
};

export const categoryInvalidSubcategory = {
  id: 'cat-invalid-sub',
  slug: 'invalid-sub',
  name: 'Invalid Subcategory',
  parentId: 'cat-parent-002',
};

// Invalid categories collection
export const invalidCategories = [
  { category: categoryMissingId, expectedError: 'id is required' },
  { category: categoryMissingSlug, expectedError: 'slug is required' },
  { category: categoryMissingName, expectedError: 'name is required' },
  { category: categoryMissingParentId, expectedError: 'parentId is required' },
  { category: categoryEmptyId, expectedError: 'id must not be empty' },
  { category: categoryEmptyName, expectedError: 'name must not be empty' },
];

// Sample categories from config (subset for testing)
export const sampleDefaultCategories = [
  // Income parent
  {
    id: '00000001-0000-0000-0000-000000000000',
    slug: 'income',
    name: 'Income',
    parentId: null,
  },
  // Income children
  {
    id: '00000001-0000-0000-0000-000000000001',
    slug: 'income-salary-wages',
    name: 'Salary & Wages',
    parentId: '00000001-0000-0000-0000-000000000000',
  },
  {
    id: '00000001-0000-0000-0000-000000000002',
    slug: 'income-interest',
    name: 'Interest',
    parentId: '00000001-0000-0000-0000-000000000000',
  },
  // Food parent
  {
    id: '00000004-0000-0000-0000-000000000000',
    slug: 'food',
    name: 'Food',
    parentId: null,
  },
  // Food children
  {
    id: '00000004-0000-0000-0000-000000000001',
    slug: 'food-groceries',
    name: 'Groceries',
    parentId: '00000004-0000-0000-0000-000000000000',
  },
  {
    id: '00000004-0000-0000-0000-000000000002',
    slug: 'food-restaurants',
    name: 'Restaurants',
    parentId: '00000004-0000-0000-0000-000000000000',
  },
];

export default {
  validParentCategory,
  validCategoryWithSubcategories,
  validCategories,
  flatCategories,
  invalidCategories,
  sampleDefaultCategories,
};
