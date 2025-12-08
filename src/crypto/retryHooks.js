/**
 * Hook to wrap database operations with retry logic and error notifications
 */

import { retryOperation } from './retryUtils';

/**
 * Standalone function to execute database operations with retry logic
 * Use this for all database operations (middleware, utility functions, components, etc.)
 * @param {Function} operation - Async function to execute
 * @param {string} operationName - Name for logging
 * @param {Function} onErrorCallback - Optional callback for handling final errors
 * @returns {Promise<any>} Result of the operation
 */
export async function executeDbOperationWithRetry(
  operation,
  operationName = 'database operation',
  onErrorCallback = null
) {
  return retryOperation(operation, operationName, {
    onError: onErrorCallback,
  });
}
