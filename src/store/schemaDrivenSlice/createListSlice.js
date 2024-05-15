import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { createMainListReducers } from './createMainListReducers';
import { createLoadedListReducers } from './createLoadedListReducers';

export default function createListSlice(name, validate) {
  const mainListAdapter = createEntityAdapter();
  const loadedListAdapter = createEntityAdapter();

  const mainListReducers = createMainListReducers(mainListAdapter, validate);
  const loadedListReducers = createLoadedListReducers(
    loadedListAdapter,
    validate
  );

  const initialState = {
    mainList: mainListAdapter.getInitialState(),
    loadedList: loadedListAdapter.getInitialState(),
    loading: false,
    error: null,
  };

  const setLoadingReducer = (state, action) => {
    state.loading = action.payload;
  };

  const setErrorReducer = (state, action) => {
    state.error = action.payload;
  };

  const importLoadedItemReducer = (state, action) => {
    const id = action.payload;
    const item = state.loadedList.entities[id];
    if (item && item.isValid) {
      mainListAdapter.addOne(state.mainList, item);
      loadedListAdapter.removeOne(state.loadedList, id);
    }
  };

  const importLoadedItemsReducer = (state, action) => {
    const requireIsSelected = action.payload?.requireIsSelected;
    const itemsToImport = Object.values(state.loadedList.entities).filter(
      (item) => item.isValid && (!requireIsSelected || item.isSelected)
    );
    itemsToImport.forEach((item) => {
      mainListAdapter.addOne(state.mainList, item);
      loadedListAdapter.removeOne(state.loadedList, item.id);
    });
  };

  const reducers = {
    setLoading: setLoadingReducer,
    setError: setErrorReducer,
    importLoadedItem: importLoadedItemReducer,
    importLoadedItems: importLoadedItemsReducer,
    ...mainListReducers,
    ...loadedListReducers,
  };

  const slice = createSlice({
    name,
    initialState,
    reducers,
  });

  const mainListSelectors = mainListAdapter.getSelectors(
    (state) => state[name].mainList
  );
  const loadedListSelectors = loadedListAdapter.getSelectors(
    (state) => state[name].loadedList
  );

  return {
    reducer: slice.reducer,
    sliceActions: slice.actions,
    mainListSelectors,
    loadedListSelectors,
  };
}
