import { validators } from '@luca-financial/luca-schema';
import { createListSlice } from '../utils/createListSlice';

const { validateEntity } = validators;

const entitiesSlice = createListSlice('entities', validateEntity);
export const {
  setLoading: setEntitiesLoading,
  setError: setEntitiesError,
  addItem: addEntity,
  updateItem: updateEntity,
  removeItem: removeEntity,
} = entitiesSlice.actions;
export const entitiesReducer = entitiesSlice.reducer;
