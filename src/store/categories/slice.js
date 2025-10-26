import { createSlice } from '@reduxjs/toolkit';

const categories = createSlice({
  name: 'categories',
  initialState: [],
  reducers: {
    setCategories: (state, action) => {
      return action.payload;
    },
  },
});

export default categories.reducer;

export const { setCategories } = categories.actions;
