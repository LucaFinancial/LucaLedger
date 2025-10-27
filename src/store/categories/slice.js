import { createSlice } from '@reduxjs/toolkit';
import config from '@/config';

const categories = createSlice({
  name: 'categories',
  initialState: config.categories || [],
  reducers: {
    setCategories: (state, action) => {
      return action.payload;
    },
  },
});

export default categories.reducer;

export const { setCategories } = categories.actions;
