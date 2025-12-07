/**
 * Retry utilities for IndexedDB operations
 * Provides exponential backoff retry logic with error classification
 */

/**
 * Error classifications for retry logic
 */
export const ErrorType = {
  TRANSIENT: 'transient', // Retryable errors (temporary issues)
  NON_RETRYABLE: 'non_retryable', // Permanent errors (quota, permissions)
  UNKNOWN: 'unknown', // Unknown errors (treat as transient)
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1000, // ~1 second
  MAX_DELAY_MS: 5000, // Cap at 5 seconds
};

/**
 * Classify an error to determine if it should be retried
 * @param {Error} error - The error to classify
 * @returns {string} ErrorType constant
 */
export function classifyError(error) {
  if (!error) return ErrorType.UNKNOWN;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';

  // Non-retryable errors - storage quota exceeded
  if (
    errorName === 'quotaexceedederror' ||
    errorMessage.includes('quota') ||
    errorMessage.includes('storage is full') ||
    errorMessage.includes('disk space')
  ) {
    return ErrorType.NON_RETRYABLE;
  }

  // Non-retryable errors - database access issues
  if (
    errorName === 'invalidstateerror' ||
    errorName === 'notfounderror' ||
    errorMessage.includes('database is closed') ||
    errorMessage.includes('no database connection')
  ) {
    return ErrorType.NON_RETRYABLE;
  }

  // Transient errors - network or temporary issues
  if (
    errorName === 'aborterror' ||
    errorName === 'timeouterror' ||
    errorMessage.includes('transaction was aborted') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('blocked')
  ) {
    return ErrorType.TRANSIENT;
  }

  // Unknown errors - treat as transient and retry
  return ErrorType.TRANSIENT;
}

/**
 * Get a user-friendly error message for display
 * @param {Error} error - The error to format
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error) {
  const errorType = classifyError(error);

  if (errorType === ErrorType.NON_RETRYABLE) {
    const errorMessage = error.message?.toLowerCase() || '';

    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('storage is full') ||
      errorMessage.includes('disk space')
    ) {
      return 'Storage quota exceeded. Please free up space by deleting old data or clearing browser storage.';
    }

    if (
      errorMessage.includes('database is closed') ||
      errorMessage.includes('no database connection')
    ) {
      return 'Database connection lost. Please refresh the page to reconnect.';
    }

    return 'Unable to save data. Please try again or contact support.';
  }

  return 'Failed to save data after multiple attempts. Please try again.';
}

/**
 * Calculate delay for exponential backoff with jitter
 * @param {number} attemptNumber - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
export function calculateBackoffDelay(attemptNumber) {
  // Exponential backoff: baseDelay * 2^attemptNumber
  const exponentialDelay =
    RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attemptNumber);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);

  // Cap at max delay
  const delay = Math.min(
    exponentialDelay + jitter,
    RETRY_CONFIG.MAX_DELAY_MS
  );

  return Math.round(delay);
}

/**
 * Sleep for specified milliseconds (non-blocking)
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry statistics for logging
 */
export class RetryStats {
  constructor() {
    this.attempts = 0;
    this.errors = [];
    this.totalDelay = 0;
  }

  addAttempt(error, delay) {
    this.attempts++;
    this.errors.push({
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      timestamp: new Date().toISOString(),
    });
    this.totalDelay += delay || 0;
  }

  toLogObject() {
    return {
      totalAttempts: this.attempts,
      totalDelayMs: this.totalDelay,
      errors: this.errors,
    };
  }
}

/**
 * Execute an async operation with retry logic
 * @param {Function} operation - Async function to execute
 * @param {string} operationName - Name for logging
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum retry attempts
 * @param {Function} options.onRetry - Callback for retry events
 * @param {Function} options.onError - Callback for final error
 * @returns {Promise<any>} Result of the operation
 * @throws {Error} If all retry attempts fail
 */
export async function retryOperation(
  operation,
  operationName = 'operation',
  options = {}
) {
  const {
    maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS,
    onRetry = null,
    onError = null,
  } = options;

  const stats = new RetryStats();
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Execute the operation
      const result = await operation();

      // Log success if there were retries
      if (attempt > 0) {
        console.info(
          `[IndexedDB Retry] ${operationName} succeeded after ${attempt + 1} attempt(s)`,
          stats.toLogObject()
        );
      }

      return result;
    } catch (error) {
      lastError = error;
      const errorType = classifyError(error);

      // Don't retry non-retryable errors
      if (errorType === ErrorType.NON_RETRYABLE) {
        console.error(
          `[IndexedDB Retry] ${operationName} failed with non-retryable error:`,
          error
        );
        if (onError) {
          onError(error, errorType);
        }
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt);
      stats.addAttempt(error, delay);

      // Log retry attempt
      console.warn(
        `[IndexedDB Retry] ${operationName} failed (attempt ${attempt + 1}/${maxAttempts}), retrying in ${delay}ms...`,
        { error: error.message, errorType }
      );

      // Callback for retry event
      if (onRetry) {
        onRetry(attempt + 1, maxAttempts, delay, error);
      }

      // If this was the last attempt, don't sleep
      if (attempt < maxAttempts - 1) {
        await sleep(delay);
      }
    }
  }

  // All attempts failed
  console.error(
    `[IndexedDB Retry] ${operationName} failed after ${maxAttempts} attempts`,
    stats.toLogObject()
  );

  if (onError) {
    onError(lastError, ErrorType.TRANSIENT);
  }

  throw lastError;
}
