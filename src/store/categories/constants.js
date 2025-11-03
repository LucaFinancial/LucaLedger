/**
 * Constants for the categories module
 */

/**
 * System category slugs that cannot be deleted
 */
export const SYSTEM_CATEGORY_SLUGS = ['none'];

/**
 * Check if a category is a system category that cannot be deleted
 */
export const isSystemCategory = (category) => {
  return SYSTEM_CATEGORY_SLUGS.includes(category.slug);
};
