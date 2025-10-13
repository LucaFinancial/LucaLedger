import { useEffect } from 'react';

// This should be imported from the LucaSchema module when available
// For now, we'll use a constant that matches the expected v2 schema version
const CURRENT_SCHEMA_VERSION = '2.0.0';

export default function SchemaVersionProvider() {
  useEffect(() => {
    const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

    // Only update if we have valid data loaded and schema version has changed
    if (storedSchemaVersion && storedSchemaVersion !== CURRENT_SCHEMA_VERSION) {
      localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
      console.log(
        `Data schema version updated from ${storedSchemaVersion} to ${CURRENT_SCHEMA_VERSION}`
      );
    } else if (!storedSchemaVersion) {
      // If no stored schema version but we have a functioning app,
      // set the current schema version
      const reduxState = localStorage.getItem('reduxState');
      if (reduxState) {
        try {
          const parsedState = JSON.parse(reduxState);
          // If we have valid data structures, assume it's current schema
          if (parsedState.accounts || parsedState.transactions) {
            localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
            console.log(
              `Initial data schema version set to ${CURRENT_SCHEMA_VERSION}`
            );
          }
        } catch (error) {
          console.error(
            'Error checking Redux state for schema version:',
            error
          );
        }
      }
    }
  }, []);

  return null;
}
