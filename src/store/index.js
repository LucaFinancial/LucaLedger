import { validators } from '@luca-financial/luca-schema';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { constants } from './lucaSchema';
import { createListSlicesFromSchemas } from './schemaDrivenSlice';

const slices = createListSlicesFromSchemas(constants.SchemaKeys, validators);

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  return result;
};

const rootReducer = combineReducers(
  // iterate over all schema keys and add the reducer for each slice
  Object.values(constants.SchemaKeys).reduce((acc, schemaKey) => {
    if (slices[schemaKey]) {
      // extract the reducer from the slice and add it to the accumulator object
      acc[schemaKey] = slices[schemaKey].reducer;
    }
    // return the accumulator object containing all the reducers
    return acc;
  }, {})
);

export default configureStore({
  reducer: rootReducer,
  preloadedState: JSON.parse(localStorage.getItem('reduxState')) || {},
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export { slices };
