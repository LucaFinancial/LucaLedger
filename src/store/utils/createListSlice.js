import { createSlice } from '@reduxjs/toolkit';

export const createListSlice = (name, validate) => {
  const setLoadingReducer = (state, action) => {
    state.loading = action.payload;
  };

  const setErrorReducer = (state, action) => {
    state.error = action.payload;
  };

  const addItemReducer = (state, action) => {
    const isValid = validate(action.payload);
    if (!isValid) {
      console.log('Validation failed for adding item', validate.errors);
      state.error = 'Validation failed for adding item';
      return;
    }
    state[`${name}List`].push(action.payload);
  };

  const updateItemReducer = (state, action) => {
    const { id, ...updates } = action.payload;
    const index = state[`${name}List`].findIndex((item) => item.id === id);
    if (index === -1) {
      console.log(`Item with id ${id} not found for updating`);
      state.error = `Item with id ${id} not found for updating`;
      return;
    }
    const updatedItem = { ...state[`${name}List`][index], ...updates };
    const isValid = validate(updatedItem);
    if (!isValid) {
      console.log('Validation failed for updating item', validate.errors);
      state.error = 'Validation failed for updating item';
      return;
    }
    state[`${name}List`][index] = updatedItem;
  };

  const removeItemReducer = (state, action) => {
    const id = action.payload;
    state[`${name}List`] = state[`${name}List`].filter(
      (item) => item.id !== id
    );
  };

  const initialState = {
    [`${name}List`]: [],
    loading: false,
    error: null,
  };

  return createSlice({
    name,
    initialState,
    reducers: {
      setLoading: setLoadingReducer,
      setError: setErrorReducer,
      addItem: addItemReducer,
      updateItem: updateItemReducer,
      removeItem: removeItemReducer,
    },
  });
};
