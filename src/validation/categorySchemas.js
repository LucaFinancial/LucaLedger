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
    parentId: {
      anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
      description: 'Parent category id; null for top-level categories',
    },
  },
  required: ['id', 'slug', 'name', 'parentId'],
  additionalProperties: false,
};

export const categorySchemas = {
  category: categorySchema,
};

export default categorySchemas;
