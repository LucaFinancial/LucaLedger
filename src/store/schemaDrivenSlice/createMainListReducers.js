export const createMainListReducers = (mainListAdapter, validate) => ({
  addMainItem: addMainItemReducer(mainListAdapter, validate),
  addMainItems: addMainItemsReducer(mainListAdapter, validate),
  updateMainItem: updateMainItemReducer(mainListAdapter, validate),
  updateMainItems: updateMainItemsReducer(mainListAdapter, validate),
  removeMainItem: removeMainItemReducer(mainListAdapter),
  removeMainItems: removeMainItemsReducer(mainListAdapter),
});

const addMainItemReducer = (mainListAdapter, validate) => (state, action) => {
  const item = action.payload;
  const isValid = validate(item);
  if (isValid) {
    mainListAdapter.addOne(state.mainList, item);
  } else {
    state.error = `Validation failed for adding item: ${validate.errors.map((err) => err.message).join(', ')}`;
  }
};

const addMainItemsReducer = (mainListAdapter, validate) => (state, action) => {
  const items = action.payload;
  const validItems = [];
  let errorMessages = [];
  items.forEach((item) => {
    const isValid = validate(item);
    if (isValid) {
      validItems.push(item);
    } else {
      const itemErrors = validate.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      );
      errorMessages = errorMessages.concat(itemErrors);
    }
  });
  if (validItems.length) {
    mainListAdapter.addMany(state.mainList, validItems);
  }
  if (errorMessages.length) {
    state.error = `Validation failed for adding items: ${errorMessages.join(', ')}`;
  }
};

const updateMainItemReducer =
  (mainListAdapter, validate) => (state, action) => {
    const { id, changes } = action.payload;
    const item = state.mainList.entities[id];
    if (!item) {
      state.error = `Item with id ${id} not found for updating`;
      return;
    }
    const updatedItem = { ...item, ...changes };
    const isValid = validate(updatedItem);
    if (isValid) {
      mainListAdapter.updateOne(state.mainList, { id, changes });
    } else {
      state.error = `Validation failed for updating item: ${validate.errors.map((err) => err.message).join(', ')}`;
    }
  };

const updateMainItemsReducer =
  (mainListAdapter, validate) => (state, action) => {
    const updates = action.payload;
    const errorMessages = [];
    updates.forEach((update) => {
      const item = state.mainList.entities[update.id];
      if (!item) {
        errorMessages.push(`Item with id ${update.id} not found for updating`);
        return;
      }
      const updatedItem = { ...item, ...update.changes };
      const isValid = validate(updatedItem);
      if (!isValid) {
        errorMessages.push(
          `Validation failed for item with id ${update.id}: ${validate.errors.map((err) => err.message).join(', ')}`
        );
        return;
      }
      mainListAdapter.updateOne(state.mainList, update);
    });
    if (errorMessages.length) {
      state.error = `Update errors: ${errorMessages.join('; ')}`;
    }
  };

const removeMainItemReducer = (mainListAdapter) => (state, action) => {
  const id = action.payload;
  mainListAdapter.removeOne(state.mainList, id);
};

const removeMainItemsReducer = (mainListAdapter) => (state, action) => {
  const ids = action.payload;
  mainListAdapter.removeMany(state.mainList, ids);
};
