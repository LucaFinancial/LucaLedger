/**
 * CRITICAL: This runs synchronously BEFORE React/Redux initialization
 * Migrates localStorage data through schema versions
 * Schema 2.0.0 → 2.0.1: Convert amounts from dollars to cents
 */

import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import { dollarsToCents } from '@/utils';

// Check if migration is needed
const schemaVersion = localStorage.getItem('dataSchemaVersion');

console.log(
  'Stored and current schema versions:',
  schemaVersion,
  CURRENT_SCHEMA_VERSION,
);

if (!schemaVersion || schemaVersion !== CURRENT_SCHEMA_VERSION) {
  console.log('[Migration] Starting localStorage migration...');
  const reduxStateRaw = localStorage.getItem('reduxState');

  if (reduxStateRaw) {
    try {
      const state = JSON.parse(reduxStateRaw);

      // Check if we have transactions to migrate
      if (state.transactions && Array.isArray(state.transactions)) {
        let amountConversionCount = 0;

        // Migrate each transaction
        state.transactions = state.transactions.map((transaction) => {
          let updated = { ...transaction };

          // Migration 2.0.0 → 2.0.1: Convert amounts from dollars to cents
          if (
            (!schemaVersion || schemaVersion === '2.0.0') &&
            typeof updated.amount === 'number'
          ) {
            updated.amount = dollarsToCents(updated.amount);
            amountConversionCount++;
          }

          return updated;
        });

        if (amountConversionCount > 0) {
          console.log(
            `[Migration] Converted ${amountConversionCount} transaction amounts to cents`,
          );
        }

        // Save back to localStorage
        localStorage.setItem('reduxState', JSON.stringify(state));
        console.log('[Migration] Saved migrated data back to localStorage');

        // Update schema version
        localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
        console.log(
          `[Migration] Updated schema version to ${CURRENT_SCHEMA_VERSION}`,
        );
      }
    } catch (error) {
      console.error('[Migration] Failed to migrate localStorage:', error);
    }
  }
}
