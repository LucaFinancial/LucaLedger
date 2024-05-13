export const createLoadedListReducers = (loadedListAdapter, validate) => ({
  addLoadedItem: addLoadedItemReducer(loadedListAdapter, validate),
  addLoadedItems: addLoadedItemsReducer(loadedListAdapter, validate),
  updateLoadedItem: updateLoadedItemReducer(loadedListAdapter, validate),
  updateLoadedItems: updateLoadedItemsReducer(loadedListAdapter, validate),
  removeLoadedItem: removeLoadedItemReducer(loadedListAdapter, validate),
  removeLoadedItems: removeLoadedItemsReducer(loadedListAdapter, validate),
});

const addLoadedItemReducer =
  (loadedListAdapter, validate) => (state, action) => {
    const item = action.payload;
    const isValid = validate(item);
    const itemWithValidity = {
      ...item,
      isValid,
      isSelected: false,
      validationErrors: isValid ? null : validate.errors,
    };
    loadedListAdapter.addOne(state.loadedList, itemWithValidity);
  };

const addLoadedItemsReducer =
  (loadedListAdapter, validate) => (state, action) => {
    const items = action.payload;
    items.forEach((item) => {
      const isValid = validate(item);
      loadedListAdapter.addOne(state.loadedList, {
        ...item,
        isValid,
        isSelected: false,
        validationErrors: isValid ? null : validate.errors,
      });
    });
  };

const updateLoadedItemReducer =
  (loadedListAdapter, validate) => (state, action) => {
    const { id, changes } = action.payload;
    const item = state.loadedList.entities[id];
    if (item) {
      const updatedItem = { ...item, ...changes };
      const {
        isValid: _,
        isSelected: __,
        validationErrors: ___,
        ...relevantFields
      } = updatedItem;
      const isValid = validate(relevantFields);
      loadedListAdapter.updateOne(state.loadedList, {
        id,
        changes: {
          ...changes,
          isValid,
          validationErrors: isValid ? null : validate.errors,
        },
      });
    }
  };

const updateLoadedItemsReducer =
  (loadedListAdapter, validate) => (state, action) => {
    const updates = action.payload;
    updates.forEach((update) => {
      const item = state.loadedList.entities[update.id];
      if (item) {
        const updatedItem = { ...item, ...update.changes };
        const isValid = validate(updatedItem);
        loadedListAdapter.updateOne(state.loadedList, {
          id: update.id,
          changes: {
            ...update.changes,
            isValid,
            validationErrors: isValid ? null : validate.errors,
          },
        });
      }
    });
  };

const removeLoadedItemReducer = (loadedListAdapter) => (state, action) => {
  const id = action.payload;
  loadedListAdapter.removeOne(state.loadedList, id);
};

const removeLoadedItemsReducer = (loadedListAdapter) => (state, action) => {
  const ids = action.payload;
  loadedListAdapter.removeMany(state.loadedList, ids);
};
