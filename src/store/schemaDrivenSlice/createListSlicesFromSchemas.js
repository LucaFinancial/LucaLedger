import createListSlice from './createListSlice';

export default function createListSlicesFromSchemas(schemas, validator) {
  const slices = {};

  Object.keys(schemas).forEach((key) => {
    const validateSchema = validator.getSchema(key);

    if (validateSchema) {
      const { reducer, sliceActions, mainListSelectors, loadedListSelectors } =
        createListSlice(key, validateSchema);
      slices[key] = {
        reducer,
        sliceActions,
        mainListSelectors,
        loadedListSelectors,
        sliceSelector: (state) => state[key],
      };
    }
  });

  return slices;
}
