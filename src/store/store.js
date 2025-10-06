import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  return result;
};

// Migration function to handle renaming 'accounts' to 'accountsLegacy'
const migrateState = (persistedState) => {
  if (!persistedState) return {};

  // If we have 'accounts' but not 'accountsLegacy', migrate it
  if (persistedState.accounts && !persistedState.accountsLegacy) {
    const { accounts, ...rest } = persistedState;
    return {
      ...rest,
      accountsLegacy: accounts,
    };
  }

  return persistedState;
};

export default configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(JSON.parse(localStorage.getItem('reduxState'))),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
