export const selectCategories = (state) => state.categories;

export const selectCategoryById = (state, categoryId) => {
  return state.categories.find((category) => category.id === categoryId);
};
