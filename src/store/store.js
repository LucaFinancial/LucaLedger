import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  return result;
};

// Migration function to handle schema versions and data migration
const migrateState = (persistedState) => {
  if (!persistedState) return {};

  // Check for schema version in the persisted data
  const dataSchemaVersion = persistedState.schemaVersion;
  const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

  // If no schema version found in data, this is invalid - refuse to load
  if (!dataSchemaVersion) {
    console.error(
      'No schema version found in persisted data. Data load refused.'
    );
    alert(
      'Unable to load data: No schema version found. Your data may be corrupted or from an unsupported format.'
    );
    return {};
  }

  // If data is v2, check if it matches our expected format
  if (dataSchemaVersion === '2.0.0') {
    // Data is already v2 format, should be good to go
    console.log('Loading v2.0.0 schema data');

    // Update stored schema version if different
    if (storedSchemaVersion !== dataSchemaVersion) {
      localStorage.setItem('dataSchemaVersion', dataSchemaVersion);
    }

    return persistedState;
  }

  // If data is v1, check for legacy format and refuse to load
  if (dataSchemaVersion === '1.0.0') {
    // Double-check by looking for v1 indicators (accounts with embedded transactions)
    if (persistedState.accounts && Array.isArray(persistedState.accounts)) {
      const hasEmbeddedTransactions = persistedState.accounts.some(
        (account) => account.transactions && Array.isArray(account.transactions)
      );

      if (hasEmbeddedTransactions) {
        console.error(
          'v1.0.0 schema data detected with embedded transactions. Migration not supported.'
        );
        alert(
          'Unable to load data: This appears to be v1.0.0 format data which is not supported. Please contact support for migration assistance.'
        );
        return {};
      }
    }
  }

  // Unknown or unsupported version - refuse to load
  console.error(`Unsupported schema version: ${dataSchemaVersion}`);
  alert(
    `Unable to load data: Unsupported schema version "${dataSchemaVersion}". Please update your application.`
  );
  return {};
};

export default configureStore({
  reducer: rootReducer,
  preloadedState: migrateState(JSON.parse(localStorage.getItem('reduxState'))),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
