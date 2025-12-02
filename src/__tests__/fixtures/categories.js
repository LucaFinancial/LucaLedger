/**
 * Sample Category Data Fixtures
 * Reusable test data for category-related tests
 */

// Valid parent category
export const validParentCategory = {
  id: 'cat-parent-001',
  slug: 'test-parent',
  name: 'Test Parent Category',
  subcategories: [],
};

// Valid category with subcategories
export const validCategoryWithSubcategories = {
  id: 'cat-parent-002',
  slug: 'custom-category',
  name: 'Custom Category',
  subcategories: [
    {
      id: 'cat-sub-001',
      slug: 'custom-subcategory-one',
      name: 'Custom Subcategory One',
    },
    {
      id: 'cat-sub-002',
      slug: 'custom-subcategory-two',
      name: 'Custom Subcategory Two',
    },
  ],
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
];

// Invalid Category Fixtures
export const categoryMissingId = {
  slug: 'missing-id',
  name: 'Missing ID',
  subcategories: [],
};

export const categoryMissingSlug = {
  id: 'cat-missing-slug',
  name: 'Missing Slug',
  subcategories: [],
};

export const categoryMissingName = {
  id: 'cat-missing-name',
  slug: 'missing-name',
  subcategories: [],
};

export const categoryMissingSubcategories = {
  id: 'cat-missing-subs',
  slug: 'missing-subcategories',
  name: 'Missing Subcategories',
};

export const categoryEmptyId = {
  id: '',
  slug: 'empty-id',
  name: 'Empty ID',
  subcategories: [],
};

export const categoryEmptySlug = {
  id: 'cat-empty-slug',
  slug: '',
  name: 'Empty Slug',
  subcategories: [],
};

export const categoryEmptyName = {
  id: 'cat-empty-name',
  slug: 'empty-name',
  name: '',
  subcategories: [],
};

export const categoryInvalidSlug = {
  id: 'cat-invalid-slug',
  slug: 'Invalid Slug With Spaces', // Slugs should be kebab-case
  name: 'Invalid Slug',
  subcategories: [],
};

export const categoryInvalidSlugUppercase = {
  id: 'cat-invalid-slug-upper',
  slug: 'Invalid-Slug', // Contains uppercase
  name: 'Invalid Slug Uppercase',
  subcategories: [],
};

export const categoryInvalidSubcategory = {
  id: 'cat-invalid-sub',
  slug: 'invalid-sub',
  name: 'Invalid Subcategory',
  subcategories: [
    {
      id: '', // Invalid - empty id
      slug: 'invalid-sub-child',
      name: 'Invalid Sub Child',
    },
  ],
};

// Invalid categories collection
export const invalidCategories = [
  { category: categoryMissingId, expectedError: 'id is required' },
  { category: categoryMissingSlug, expectedError: 'slug is required' },
  { category: categoryMissingName, expectedError: 'name is required' },
  {
    category: categoryMissingSubcategories,
    expectedError: 'subcategories is required',
  },
  { category: categoryEmptyId, expectedError: 'id must not be empty' },
  { category: categoryEmptyName, expectedError: 'name must not be empty' },
];

// Sample categories from config (subset for testing)
export const sampleDefaultCategories = [
  {
    id: '00000001-0000-0000-0000-000000000000',
    slug: 'income',
    name: 'Income',
    subcategories: [
      {
        id: '00000001-0000-0000-0000-000000000001',
        slug: 'income-salary-wages',
        name: 'Salary & Wages',
      },
      {
        id: '00000001-0000-0000-0000-000000000002',
        slug: 'income-interest',
        name: 'Interest',
      },
    ],
  },
  {
    id: '00000004-0000-0000-0000-000000000000',
    slug: 'food',
    name: 'Food',
    subcategories: [
      {
        id: '00000004-0000-0000-0000-000000000001',
        slug: 'food-groceries',
        name: 'Groceries',
      },
      {
        id: '00000004-0000-0000-0000-000000000002',
        slug: 'food-restaurants',
        name: 'Restaurants',
      },
    ],
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
