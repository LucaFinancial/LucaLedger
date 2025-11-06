import { createSlice } from '@reduxjs/toolkit';

/**
 * Categories are stored as a flat array where each item can be:
 * - A parent category (parentId = null)
 * - A subcategory (parentId = parent category's id)
 */
const categories = createSlice({
  name: 'categories',
  initialState: [], // Start empty, let store migration handle defaults
  reducers: {
    setCategories: (state, action) => {
      return action.payload;
    },
    addCategory: (state, action) => {
      state.push(action.payload);
    },
    updateCategory: (state, action) => {
      const index = state.findIndex((cat) => cat.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    removeCategory: (state, action) => {
      const categoryId = action.payload;
      // Remove the category and all its children
      return state.filter(
        (cat) => cat.id !== categoryId && cat.parentId !== categoryId
      );
    },
  },
});

export default categories.reducer;

export const { setCategories, addCategory, updateCategory, removeCategory } =
  categories.actions;
