import createListSlice from './createListSlice';
import createListSlicesFromSchemas from './createListSlicesFromSchemas';
import * as hooks from './hooks';

const { useListSlice } = hooks;

const ListTypeEnum = Object.freeze({
  MAIN: 'main',
  LOADED: 'loaded',
});

export {
  ListTypeEnum,
  createListSlice,
  createListSlicesFromSchemas,
  useListSlice,
};
