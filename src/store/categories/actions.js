import { generateCategory } from './generators';
import { addCategory, removeCategory, updateCategory } from './slice';

export const createNewCategory = (initialData) => (dispatch) => {
  dispatch(addCategory(generateCategory(initialData)));
};

export const loadCategory = (category) => (dispatch) => {
  dispatch(addCategory(generateCategory(category)));
};

export const removeCategoryById = (id) => (dispatch) => {
  dispatch(removeCategory(id));
};

export const updateCategoryName = (id, name) => (dispatch) => {
  dispatch(updateCategory({ id, name }));
};
