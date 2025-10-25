import { useEffect } from 'react';
import { hasEncryptedData } from '@/crypto/database';

// This should be imported from the LucaSchema module when available
// For now, we'll use a constant that matches the expected v2 schema version
// Version 2.0.1: Monetary amounts stored as integer cents instead of float dollars
const CURRENT_SCHEMA_VERSION = '2.0.1';

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

        // Also check for encrypted data in IndexedDB
        if (!hasData) {
          try {
            const hasEncrypted = await hasEncryptedData();
            if (hasEncrypted) {
              hasData = true;
            }
          } catch (error) {
            console.error(
              'Error checking encrypted data for schema version:',
              error
            );
          }
        }

        // Set schema version if we found any data
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
