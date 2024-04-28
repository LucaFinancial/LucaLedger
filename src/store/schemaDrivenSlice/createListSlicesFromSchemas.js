import createListSlice from './createListSlice';

export default function createListSlicesFromSchemas(SchemaKeys, validators) {
  const slices = {};

  Object.keys(SchemaKeys).forEach((key) => {
    const schemaKey = SchemaKeys[key];
    const validator = validators[schemaKey];

    if (validator) {
      const { reducer, sliceActions, mainListSelectors, loadedListSelectors } =
        createListSlice(schemaKey, validator);
      slices[schemaKey] = {
        reducer,
        sliceActions,
        mainListSelectors,
        loadedListSelectors,
        sliceSelector: (state) => state[schemaKey],
      };
    }
  });

  return slices;
}
