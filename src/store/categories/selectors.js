/**
 * Returns all categories
 */
export const selectAllCategories = (state) => state.categories;

/**
 * Returns a flat list of all categories and subcategories
 * Useful for lookups and validation
 */
export const selectAllCategoriesFlat = (state) => {
  const categories = state.categories;
  const flat = [];

  categories.forEach((category) => {
    flat.push({
      id: category.id,
      slug: category.slug,
      name: category.name,
      isParent: true,
    });

    category.subcategories.forEach((subcategory) => {
      flat.push({
        id: subcategory.id,
        slug: subcategory.slug,
        name: subcategory.name,
        parentId: category.id,
        parentName: category.name,
        isParent: false,
      });
    });
  });

  return flat;
};

/**
 * Returns a category (or subcategory) by ID
 */
export const selectCategoryById = (categoryId) => (state) => {
  const flatCategories = selectAllCategoriesFlat(state);
  return flatCategories.find((cat) => cat.id === categoryId);
};
