/**
 * JSON Schema definitions for category validation
 *
 * These schemas define the structure and validation rules for categories.
 * Validated using AJV (Another JSON Schema Validator).
 */

// Schema for subcategories
const subcategorySchema = {
  $id: 'subcategory',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the subcategory (UUID v4)',
    },
    slug: {
      type: 'string',
      pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
      description: 'URL-friendly identifier in kebab-case',
    },
    name: {
      type: 'string',
      minLength: 1,
      description: 'Human-readable name for the subcategory',
    },
  },
  required: ['id', 'slug', 'name'],
  additionalProperties: false,
};

// Schema for categories
const categorySchema = {
  $id: 'category',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      description: 'Unique identifier for the category (UUID v4)',
    },
    slug: {
      type: 'string',
      pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
      description: 'URL-friendly identifier in kebab-case',
    },
    name: {
      type: 'string',
      minLength: 1,
      description: 'Human-readable name for the category',
    },
    subcategories: {
      type: 'array',
      items: subcategorySchema,
      description: 'Array of subcategories under this category',
    },
  },
  required: ['id', 'slug', 'name', 'subcategories'],
  additionalProperties: false,
};

export const categorySchemas = {
  category: categorySchema,
  subcategory: subcategorySchema,
};

export default categorySchemas;
