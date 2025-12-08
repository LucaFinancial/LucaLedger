/**
 * Tests for Retry Utilities
 * Tests exponential backoff, error classification, and retry logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ErrorType,
  RETRY_CONFIG,
  classifyError,
  getUserFriendlyErrorMessage,
  calculateBackoffDelay,
  sleep,
  RetryStats,
  retryOperation,
} from '@/crypto/retryUtils';

describe('Retry Utils', () => {
  describe('classifyError', () => {
    it('should classify quota exceeded errors as non-retryable', () => {
      const error1 = new Error('QuotaExceededError');
      error1.name = 'QuotaExceededError';
      expect(classifyError(error1)).toBe(ErrorType.NON_RETRYABLE);

      const error2 = new Error('Storage is full');
      expect(classifyError(error2)).toBe(ErrorType.NON_RETRYABLE);

      const error3 = new Error('Not enough disk space');
      expect(classifyError(error3)).toBe(ErrorType.NON_RETRYABLE);
    });

    it('should classify database closed errors as non-retryable', () => {
      const error1 = new Error('Database is closed');
      error1.name = 'InvalidStateError';
      expect(classifyError(error1)).toBe(ErrorType.NON_RETRYABLE);

      const error2 = new Error('No database connection');
      expect(classifyError(error2)).toBe(ErrorType.NON_RETRYABLE);
    });

    it('should classify abort and timeout errors as transient', () => {
      const error1 = new Error('Transaction was aborted');
      error1.name = 'AbortError';
      expect(classifyError(error1)).toBe(ErrorType.TRANSIENT);

      const error2 = new Error('Operation timeout');
      error2.name = 'TimeoutError';
      expect(classifyError(error2)).toBe(ErrorType.TRANSIENT);

      const error3 = new Error('Request blocked');
      expect(classifyError(error3)).toBe(ErrorType.TRANSIENT);
    });

    it('should classify unknown errors as transient', () => {
      const error = new Error('Some random error');
      expect(classifyError(error)).toBe(ErrorType.TRANSIENT);
    });

    it('should handle null or undefined errors', () => {
      expect(classifyError(null)).toBe(ErrorType.UNKNOWN);
      expect(classifyError(undefined)).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return quota message for quota errors', () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('quota');
      expect(message).toContain('free up space');
    });

    it('should return database connection message for connection errors', () => {
      const error = new Error('Database is closed');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('connection');
      expect(message).toContain('refresh');
    });

    it('should return generic message for other non-retryable errors', () => {
      const error = new Error('Some error');
      error.name = 'InvalidStateError';
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('Unable to save');
    });

    it('should return retry message for transient errors', () => {
      const error = new Error('Transaction aborted');
      error.name = 'AbortError';
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('multiple attempts');
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const delay0 = calculateBackoffDelay(0);
      const delay1 = calculateBackoffDelay(1);
      const delay2 = calculateBackoffDelay(2);

      // First attempt: ~1000ms
      expect(delay0).toBeGreaterThanOrEqual(900);
      expect(delay0).toBeLessThanOrEqual(1100);

      // Second attempt: ~2000ms
      expect(delay1).toBeGreaterThanOrEqual(1800);
      expect(delay1).toBeLessThanOrEqual(2200);

      // Third attempt: ~4000ms
      expect(delay2).toBeGreaterThanOrEqual(3600);
      expect(delay2).toBeLessThanOrEqual(4400);
    });

    it('should cap delay at max delay', () => {
      const delay = calculateBackoffDelay(10); // Very high attempt
      expect(delay).toBeLessThanOrEqual(RETRY_CONFIG.MAX_DELAY_MS);
    });

    it('should include jitter', () => {
      const delays = [];
      for (let i = 0; i < 10; i++) {
        delays.push(calculateBackoffDelay(0));
      }

      // Not all delays should be identical (jitter introduces variation)
      const allSame = delays.every((d) => d === delays[0]);
      expect(allSame).toBe(false);
    });
  });

  describe('sleep', () => {
    it('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      // Allow some tolerance
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThanOrEqual(150);
    });
  });

  describe('RetryStats', () => {
    it('should track attempts and errors', () => {
      const stats = new RetryStats();
      expect(stats.attempts).toBe(0);

      const error1 = new Error('First error');
      stats.addAttempt(error1, 1000);
      expect(stats.attempts).toBe(1);

      const error2 = new Error('Second error');
      stats.addAttempt(error2, 2000);
      expect(stats.attempts).toBe(2);

      const log = stats.toLogObject();
      expect(log.totalAttempts).toBe(2);
      expect(log.totalDelayMs).toBe(3000);
      expect(log.errors).toHaveLength(2);
      expect(log.errors[0].message).toBe('First error');
      expect(log.errors[1].message).toBe('Second error');
    });

    it('should handle errors without messages', () => {
      const stats = new RetryStats();
      stats.addAttempt(null, 500);

      const log = stats.toLogObject();
      expect(log.errors[0].message).toBe('Unknown error');
    });
  });

  describe('retryOperation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await retryOperation(operation, 'test-op');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry transient errors and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, 'test-op');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      const operation = vi.fn().mockRejectedValue(error);

      await expect(retryOperation(operation, 'test-op')).rejects.toThrow(
        'QuotaExceededError'
      );

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw after max attempts for transient errors', async () => {
      const error = new Error('Transaction aborted');
      error.name = 'AbortError';
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        retryOperation(operation, 'test-op', { maxAttempts: 3 })
      ).rejects.toThrow('Transaction aborted');

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      await retryOperation(operation, 'test-op', { onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        1,
        RETRY_CONFIG.MAX_ATTEMPTS,
        expect.any(Number),
        expect.any(Error)
      );
    });

    it('should call onError callback for non-retryable errors', async () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      const operation = vi.fn().mockRejectedValue(error);

      const onError = vi.fn();

      await expect(
        retryOperation(operation, 'test-op', { onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error, ErrorType.NON_RETRYABLE);
    });

    it('should call onError callback after exhausting retries', async () => {
      const error = new Error('Transient error');
      const operation = vi.fn().mockRejectedValue(error);

      const onError = vi.fn();

      await expect(
        retryOperation(operation, 'test-op', { maxAttempts: 2, onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error, ErrorType.TRANSIENT);
    });

    it('should respect custom maxAttempts', { timeout: 15000 }, async () => {
      const error = new Error('Error');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        retryOperation(operation, 'test-op', { maxAttempts: 5 })
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(5);
    });

    it('should not sleep after last attempt', async () => {
      const error = new Error('Error');
      const operation = vi.fn().mockRejectedValue(error);

      const start = Date.now();
      await expect(
        retryOperation(operation, 'test-op', { maxAttempts: 1 })
      ).rejects.toThrow();
      const elapsed = Date.now() - start;

      // Should complete quickly without sleeping
      expect(elapsed).toBeLessThan(500);
    });
  });
});
