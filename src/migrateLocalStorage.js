/**
 * CRITICAL: This runs synchronously BEFORE React/Redux initialization
 * Converts transaction amounts from float dollars to integer cents
 * Schema 2.0.0 → 2.0.1
 */

import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

// Check if migration is needed
const schemaVersion = localStorage.getItem('dataSchemaVersion');

if (!schemaVersion || schemaVersion === '2.0.0') {
  console.log('[Migration] Starting localStorage conversion...');
  const reduxStateRaw = localStorage.getItem('reduxState');

  if (reduxStateRaw) {
    console.log('[Migration] Starting localStorage conversion...');

    try {
      const state = JSON.parse(reduxStateRaw);

      // Check if we have transactions to convert
      if (state.transactions && Array.isArray(state.transactions)) {
        let convertedCount = 0;

        // Convert each transaction amount
        state.transactions = state.transactions.map((transaction) => {
          if (typeof transaction.amount === 'number') {
            // Convert dollars to cents
            const amountInCents = Math.round(transaction.amount * 100);
            convertedCount++;

            // Remove balance field if exists (cleanup)
            // eslint-disable-next-line no-unused-vars
            const { balance, ...cleanTransaction } = transaction;

            return {
              ...cleanTransaction,
              amount: amountInCents,
            };
          }
          return transaction;
        });

        console.log(
          `[Migration] Converted ${convertedCount} transaction amounts to cents`
        );

        // Save back to localStorage
        localStorage.setItem('reduxState', JSON.stringify(state));
        console.log('[Migration] Saved converted data back to localStorage');

        // Update schema version
        localStorage.setItem('dataSchemaVersion', CURRENT_SCHEMA_VERSION);
        console.log(
          `[Migration] Updated schema version to ${CURRENT_SCHEMA_VERSION}`
        );
      }
    } catch (error) {
      console.error('[Migration] Failed to convert localStorage:', error);
    }
  }
}
