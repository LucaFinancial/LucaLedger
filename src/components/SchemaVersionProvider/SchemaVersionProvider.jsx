import { useEffect } from 'react';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function SchemaVersionProvider() {
  useEffect(() => {
    const checkAndSetSchemaVersion = async () => {
      const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

      // Only update if we have valid data loaded and schema version has changed
      if (
        storedSchemaVersion &&
        storedSchemaVersion !== CURRENT_SCHEMA_VERSION
      ) {
        localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
        console.log(
          `Data schema version updated from ${storedSchemaVersion} to ${CURRENT_SCHEMA_VERSION}`
        );
      } else if (!storedSchemaVersion) {
        // Check for unencrypted data in localStorage
        const reduxState = localStorage.getItem('reduxState');
        let hasData = false;

        if (reduxState) {
          try {
            const parsedState = JSON.parse(reduxState);
            // If we have valid data structures, assume it's current schema
            if (parsedState.accounts || parsedState.transactions) {
              hasData = true;
            }
          } catch (error) {
            console.error(
              'Error checking Redux state for schema version:',
              error
            );
          }
        }

        // Set schema version ONLY for unencrypted data
        // For encrypted data, let the migration process in EncryptionProvider handle it
        if (hasData) {
          localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
          console.log(
            `Initial data schema version set to ${CURRENT_SCHEMA_VERSION}`
          );
        }
      }
    };

    checkAndSetSchemaVersion();
  }, []);

  return null;
}
