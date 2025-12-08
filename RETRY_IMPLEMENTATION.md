# IndexedDB Retry Logic Implementation

## Overview
This implementation adds best-effort retry logic for failed IndexedDB writes to reduce data loss from transient errors in Luca Ledger v2.1.1-rc.1.

## Features Implemented

### 1. Retry Utility (`src/crypto/retryUtils.js`)
- **Exponential Backoff**: Implements capped exponential backoff with jitter
  - Base delay: 1000ms (±10% jitter)
  - Backoff multiplier: 2x per attempt
  - Max delay: 5000ms
  - Default max attempts: 3
- **Error Classification**: Categorizes errors into three types:
  - `NON_RETRYABLE`: Quota exceeded, database closed (fail immediately)
  - `TRANSIENT`: Timeout, abort, blocked (retry)
  - `UNKNOWN`: Unclassified errors (retry as safety measure)
- **Logging**: Comprehensive logging of retry attempts, delays, and outcomes
- **Statistics**: Tracks total attempts, delays, and error details for debugging

### 2. Database Layer Integration (`src/crypto/database.js`)
All write operations are wrapped with `retryOperation()`:
- `storeEncryptedRecord()` / `storeUserEncryptedRecord()`
- `batchStoreEncryptedRecords()` / `batchStoreUserEncryptedRecords()`
- `deleteEncryptedRecord()` / `deleteUserEncryptedRecord()`
- `createUser()` / `deleteUser()`
- `clearUserData()`
- `migrateLegacyDataToUser()`
- `storeMetadata()`

### 3. User Notification System
- **Context Provider** (`src/contexts/StorageErrorContext.jsx`): React context for error notifications
- **UI Component**: Material-UI Snackbar with user-friendly messages
- **Auto-dismiss**: 10-second timeout with manual close option
- **Integrated** into App.jsx root

### 4. Error Messages
Non-retryable errors show clear, actionable messages:
- **Quota Exceeded**: "Storage quota exceeded. Please free up space by deleting old data or clearing browser storage."
- **Database Closed**: "Database connection lost. Please refresh the page to reconnect."
- **Generic Non-retryable**: "Unable to save data. Please try again or contact support."
- **Transient Failures**: "Failed to save data after multiple attempts. Please try again."
- **Unknown Errors**: "An unexpected error occurred while saving data. Please try again."

## Idempotency Guarantee
- Leverages Dexie's `put()` and `bulkPut()` which are idempotent by record ID
- Multiple retries with the same ID update the existing record rather than creating duplicates
- Integration tests verify no duplicate records are created

## Testing

### Unit Tests (26 tests)
- Error classification for all error types
- Exponential backoff calculation with jitter
- User-friendly error messages
- Retry logic with success/failure scenarios
- onRetry and onError callback handling

### Integration Tests (10 tests)
- Successful write on first attempt
- Retry on transient error and eventual success
- Immediate failure on non-retryable quota error
- Batch operations with retry
- Delete operations with retry
- Clear user data with retry
- Idempotency verification

**Total**: 345 tests passing (all existing + new tests)

## Performance Impact

### Write Latency
- **Success on first attempt**: No additional latency (just function call overhead <1ms)
- **Single retry**: ~1 second additional latency
- **Two retries**: ~3 seconds additional latency
- **Three retries**: ~7 seconds additional latency

### UI Responsiveness
- All retries happen asynchronously using `setTimeout()`
- UI remains responsive during retry delays
- No main thread blocking

### Logging Overhead
- Minimal: Console log statements only on retry/failure
- No performance impact on success path

## Security Considerations

### CodeQL Analysis
- ✅ No security vulnerabilities detected
- All changes reviewed and approved

### Data Integrity
- Encryption operations remain unchanged (AES-256-GCM)
- Retry logic operates at storage layer, not encryption layer
- No additional data exposure risk

### Error Handling
- Non-retryable errors fail immediately to prevent infinite loops
- Sensitive error details logged to console only (not displayed to users)
- User-facing messages are sanitized and generic

## Configuration

### Retry Settings (`src/crypto/retryUtils.js`)
```javascript
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 5000,
};
```

These can be adjusted if needed, though current values balance reliability with user experience.

## Usage Examples

### Automatic (Existing Code)
All existing database write operations automatically get retry logic without code changes:

```javascript
// This already has retry logic
await storeUserEncryptedRecord('accounts', id, data, dek, userId);
```

### Custom Error Handling
For custom operations, use `retryOperation()` directly:

```javascript
import { retryOperation } from '@/crypto/retryUtils';

await retryOperation(
  async () => {
    // Your database operation
  },
  'operation-name',
  {
    onError: (error, errorType) => {
      // Handle final error after all retries
    }
  }
);
```

## Monitoring and Debugging

### Console Logs
Retry attempts and failures are logged to the browser console:

```
[IndexedDB Retry] storeUserEncryptedRecord(accounts, acc-123) failed (attempt 1/3), retrying in 1052ms...
[IndexedDB Retry] storeUserEncryptedRecord(accounts, acc-123) succeeded after 2 attempt(s)
```

### Failure Logs
Include detailed statistics:
```javascript
{
  totalAttempts: 3,
  totalDelayMs: 6808,
  errors: [
    { message: 'Transaction aborted', name: 'AbortError', timestamp: '2025-12-08T00:00:00.000Z' },
    // ...
  ]
}
```

## Browser Compatibility
- Tested with fake-indexeddb in Node.js environment
- Compatible with all modern browsers supporting IndexedDB and Web Crypto API
- No browser-specific code added

## Future Enhancements (Not Implemented)
- Configurable retry parameters via UI settings
- Telemetry/metrics for tracking retry rates
- Circuit breaker pattern for repeated failures
- Offline detection to skip retries when offline
- Exponential backoff with max retry time limit

## Files Changed
1. `src/crypto/retryUtils.js` - New retry utility
2. `src/crypto/database.js` - Wrapped all write operations
3. `src/contexts/StorageErrorContext.jsx` - New notification provider
4. `src/contexts/useStorageError.js` - Custom hook
5. `src/crypto/retryHooks.js` - Helper for database operations
6. `src/App.jsx` - Added StorageErrorProvider
7. `src/__tests__/crypto/retryUtils.test.js` - Unit tests
8. `src/__tests__/crypto/databaseRetry.test.js` - Integration tests
9. `package.json` - Version bump to 2.1.1-rc.1

## Rollback Plan
If issues arise:
1. Revert commits from this PR
2. Database operations will function without retry logic (original behavior)
3. No data migration needed as storage format unchanged

## Acceptance Criteria Status
- ✅ Transient write failures are retried with capped backoff (up to 3 attempts)
- ✅ Non-retryable errors display clear messages (quota/storage full)
- ✅ No duplicate records created by the retry mechanism
- ✅ UI stays responsive during retries; no freezes
- ✅ Basic logs confirm retries and final status
