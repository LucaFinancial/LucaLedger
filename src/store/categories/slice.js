import { createSlice } from '@reduxjs/toolkit';

import {
  addCategoryReducer,
  removeCategoryReducer,
  updateCategoryReducer,
} from './reducers';

const categories = createSlice({
  name: 'categories',
  initialState: [],
  reducers: {
    addCategory: addCategoryReducer,
    removeCategory: removeCategoryReducer,
    updateCategory: updateCategoryReducer,
  },
});

export default categories.reducer;

export const { addCategory, removeCategory, updateCategory } =
  categories.actions;
