export const addCategoryReducer = (state, action) => {
  const categoryExists = state.some(
    (category) => category.id === action.payload.id
  );
  if (categoryExists) {
    return;
  }
  state.push(action.payload);
};

export const removeCategoryReducer = (state, action) => {
  const { payload } = action;
  return state.filter((category) => category.id !== payload);
};

export const updateCategoryReducer = (state, action) => {
  const updatedCategory = action.payload;
  const categoryIndex = state.findIndex((category) => {
    return category.id === updatedCategory.id;
  });
  if (categoryIndex === -1) {
    return;
  }
  state[categoryIndex] = { ...state[categoryIndex], ...updatedCategory };
};
