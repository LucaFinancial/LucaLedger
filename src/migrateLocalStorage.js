/**
 * CRITICAL: This runs synchronously BEFORE React/Redux initialization
 * Migrates localStorage data through schema versions
 * Schema 2.0.0 → 2.0.1: Convert amounts from dollars to cents
 * Schema 2.0.1 → 2.0.2: Remove trailing spaces from transaction status
 */

import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';
import { dollarsToCents } from '@/utils';

// Helper function to trim transaction status
const trimStatus = (status) => {
  if (typeof status === 'string') {
    return status.trim();
  }
  return status;
};

// Check if migration is needed
const schemaVersion = localStorage.getItem('dataSchemaVersion');

console.log(
  'Stored and current schema versions:',
  schemaVersion,
  CURRENT_SCHEMA_VERSION
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
        let statusTrimCount = 0;

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

          // Migration 2.0.1 → 2.0.2: Remove trailing spaces from status
          if (
            (!schemaVersion ||
              schemaVersion === '2.0.0' ||
              schemaVersion === '2.0.1') &&
            typeof updated.status === 'string' &&
            updated.status !== updated.status.trim()
          ) {
            updated.status = trimStatus(updated.status);
            statusTrimCount++;
          }

          return updated;
        });

        if (amountConversionCount > 0) {
          console.log(
            `[Migration] Converted ${amountConversionCount} transaction amounts to cents`
          );
        }

        if (statusTrimCount > 0) {
          console.log(
            `[Migration] Trimmed trailing spaces from ${statusTrimCount} transaction statuses`
          );
        }

        // Save back to localStorage
        localStorage.setItem('reduxState', JSON.stringify(state));
        console.log('[Migration] Saved migrated data back to localStorage');

        // Update schema version
        localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
        console.log(
          `[Migration] Updated schema version to ${CURRENT_SCHEMA_VERSION}`
        );
      }
    } catch (error) {
      console.error('[Migration] Failed to migrate localStorage:', error);
    }
  }
}
