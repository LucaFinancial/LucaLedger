import { validateCategory } from '../validators';
import { createListSlice } from '../utils/createListSlice';

const categoriesSlice = createListSlice('categories', validateCategory);
export const {
  setLoading: setCategoriesLoading,
  setError: setCategoriesError,
  addItem: addCategory,
  updateItem: updateCategory,
  removeItem: removeCategory,
} = categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
