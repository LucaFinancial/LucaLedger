/**
 * Sample Category Data Fixtures
 * Reusable test data for category-related tests
 */

// Valid parent category
export const validParentCategory = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'test-parent',
  name: 'Test Parent Category',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Valid category with subcategories
export const validCategoryWithSubcategories = {
  id: '00000000-0000-0000-0000-000000000002',
  slug: 'custom-category',
  name: 'Custom Category',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Valid subcategory
export const validSubcategory = {
  id: '00000000-0000-0000-0000-000000000003',
  slug: 'standalone-subcategory',
  name: 'Standalone Subcategory',
  parentId: '00000000-0000-0000-0000-000000000001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// Flat categories for store (as used in Redux store)
export const flatCategories = [
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'parent-one',
    name: 'Parent One',
    parentId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    slug: 'parent-one-child',
    name: 'Child of Parent One',
    parentId: '00000000-0000-0000-0000-000000000004',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    slug: 'parent-two',
    name: 'Parent Two',
    parentId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
];

// Collection of valid categories
export const validCategories = [
  validParentCategory,
  validCategoryWithSubcategories,
  // include a sample subcategory as flat entry
  {
    id: '00000000-0000-0000-0000-000000000007',
    slug: 'custom-subcategory-one',
    name: 'Custom Subcategory One',
    parentId: '00000000-0000-0000-0000-000000000002',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    slug: 'custom-subcategory-two',
    name: 'Custom Subcategory Two',
    parentId: '00000000-0000-0000-0000-000000000002',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  },
];

// Invalid Category Fixtures
export const categoryMissingId = {
  slug: 'missing-id',
  name: 'Missing ID',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryMissingSlug = {
  id: '00000000-0000-0000-0000-000000000009',
  name: 'Missing Slug',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryMissingName = {
  id: '00000000-0000-0000-0000-000000000010',
  slug: 'missing-name',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryMissingSubcategories = {
  id: '00000000-0000-0000-0000-000000000011',
  slug: 'missing-subcategories',
  name: 'Missing Subcategories',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

// For new flat schema the equivalent missing-field fixture is missing parentId
export const categoryMissingParentId = {
  id: '00000000-0000-0000-0000-000000000012',
  slug: 'missing-parent',
  name: 'Missing Parent',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryEmptyId = {
  id: '',
  slug: 'empty-id',
  name: 'Empty ID',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryEmptySlug = {
  id: '00000000-0000-0000-0000-000000000013',
  slug: '',
  name: 'Empty Slug',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryEmptyName = {
  id: '00000000-0000-0000-0000-000000000014',
  slug: 'empty-name',
  name: '',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryInvalidSlug = {
  id: '00000000-0000-0000-0000-000000000015',
  slug: 'Invalid Slug With Spaces', // Slugs should be kebab-case
  name: 'Invalid Slug',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryInvalidSlugUppercase = {
  id: '00000000-0000-0000-0000-000000000016',
  slug: 'Invalid-Slug', // Contains uppercase
  name: 'Invalid Slug Uppercase',
  parentId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
};

export const categoryInvalidSubcategory = {
  id: '00000000-0000-0000-0000-000000000017',
  slug: 'invalid-sub',
  name: 'Invalid Subcategory',
  parentId: '00000000-0000-0000-0000-000000000002',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
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
