import { useEffect } from 'react';

// This should be imported from the LucaSchema module when available
// For now, we'll use a constant that matches the expected v2 schema version
// Version 2.0.1: Monetary amounts stored as integer cents instead of float dollars
const CURRENT_SCHEMA_VERSION = '2.0.1';

export default function SchemaVersionProvider() {
  useEffect(() => {
    const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

    if (!storedSchemaVersion) {
      // No schema version set - this is either a new user or needs migration
      // Set it to current version immediately so new transactions are marked correctly
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
      console.log(
        `Data schema version initialized to ${CURRENT_SCHEMA_VERSION}`
      );
    } else if (storedSchemaVersion !== CURRENT_SCHEMA_VERSION) {
      // Schema version exists but is outdated - update it after migration completes
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
      console.log(
        `Data schema version updated from ${storedSchemaVersion} to ${CURRENT_SCHEMA_VERSION}`
      );
    }
  }, []);

  return null;
}
