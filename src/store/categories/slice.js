import { createSlice } from '@reduxjs/toolkit';
import config from '@/config';

const categories = createSlice({
  name: 'categories',
  initialState: config.categories || [],
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
      return state.filter((cat) => cat.id !== action.payload);
    },
    addSubcategory: (state, action) => {
      const { categoryId, subcategory } = action.payload;
      const category = state.find((cat) => cat.id === categoryId);
      if (category) {
        category.subcategories.push(subcategory);
      }
    },
    updateSubcategory: (state, action) => {
      const { categoryId, subcategory } = action.payload;
      const category = state.find((cat) => cat.id === categoryId);
      if (category) {
        const subIndex = category.subcategories.findIndex(
          (sub) => sub.id === subcategory.id
        );
        if (subIndex !== -1) {
          category.subcategories[subIndex] = subcategory;
        }
      }
    },
    removeSubcategory: (state, action) => {
      const { categoryId, subcategoryId } = action.payload;
      const category = state.find((cat) => cat.id === categoryId);
      if (category) {
        category.subcategories = category.subcategories.filter(
          (sub) => sub.id !== subcategoryId
        );
      }
    },
  },
});

export default categories.reducer;

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  addSubcategory,
  updateSubcategory,
  removeSubcategory,
} = categories.actions;
