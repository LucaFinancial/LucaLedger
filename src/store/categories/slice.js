import { validators } from '@luca-financial/luca-schema';
import { createListSlice } from '../utils/createListSlice';

const { validateCategory } = validators;

const categoriesSlice = createListSlice('categories', validateCategory);
export const {
  setLoading: setCategoriesLoading,
  setError: setCategoriesError,
  addItem: addCategory,
  updateItem: updateCategory,
  removeItem: removeCategory,
} = categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
