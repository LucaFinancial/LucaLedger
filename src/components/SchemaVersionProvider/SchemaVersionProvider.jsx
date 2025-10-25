import { useEffect } from 'react';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function SchemaVersionProvider() {
  useEffect(() => {
    const checkAndSetSchemaVersion = async () => {
      const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');

      // Only set initial schema version for new unencrypted data
      // Migration processes handle updating from old versions
      if (!storedSchemaVersion) {
        // Check for unencrypted data in localStorage
        const reduxState = localStorage.getItem('reduxState');
        let hasData = false;

        if (reduxState) {
          try {
            const parsedState = JSON.parse(reduxState);
            // Check if we have actual data (not just empty structures)
            const hasAccounts =
              parsedState.accounts?.data?.length > 0 ||
              (Array.isArray(parsedState.accounts) &&
                parsedState.accounts.length > 0);
            const hasTransactions =
              Array.isArray(parsedState.transactions) &&
              parsedState.transactions.length > 0;

            if (hasAccounts || hasTransactions) {
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
