/**
 * Tests for Transaction Validation Schemas
 * Tests transaction validation including various statuses and edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  validateTransaction,
  validateTransactionSync,
} from '@/validation/validator';
import {
  validCompletedTransaction,
  validPendingTransaction,
  validScheduledTransaction,
  validPlannedTransaction,
  validNegativeAmountTransaction,
  validZeroAmountTransaction,
  validTransactionNullCategory,
  transactionMissingId,
  transactionMissingAccountId,
  transactionMissingStatus,
  transactionInvalidStatus,
  transactionMissingDate,
  transactionInvalidDateFormat,
  transactionInvalidDateFormat2,
  transactionMissingAmount,
  transactionStringAmount,
  transactionMissingDescription,
  transactionEmptyDescription,
  transactionWithExtraProperties,
} from '../fixtures';

describe('Transaction Validation', () => {
  describe('validateTransaction', () => {
    describe('Valid Transactions', () => {
      it('should validate a completed transaction', () => {
        const result = validateTransaction(validCompletedTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a pending transaction', () => {
        const result = validateTransaction(validPendingTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a scheduled transaction', () => {
        const result = validateTransaction(validScheduledTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a planned transaction', () => {
        const result = validateTransaction(validPlannedTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a transaction with negative amount (income)', () => {
        const result = validateTransaction(validNegativeAmountTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a transaction with zero amount', () => {
        const result = validateTransaction(validZeroAmountTransaction);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a transaction with null categoryId', () => {
        const result = validateTransaction(validTransactionNullCategory);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Invalid Transactions', () => {
      it('should reject transaction missing id', () => {
        const result = validateTransaction(transactionMissingId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id is required');
      });

      it('should reject transaction missing accountId', () => {
        const result = validateTransaction(transactionMissingAccountId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('accountId is required');
      });

      it('should reject transaction missing status', () => {
        const result = validateTransaction(transactionMissingStatus);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('status is required');
      });

      it('should reject transaction with invalid status', () => {
        const result = validateTransaction(transactionInvalidStatus);
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.includes('status must be one of'))
        ).toBe(true);
      });

      it('should reject transaction missing date', () => {
        const result = validateTransaction(transactionMissingDate);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('date is required');
      });

      it('should reject transaction with invalid date format (hyphens)', () => {
        const result = validateTransaction(transactionInvalidDateFormat);
        expect(result.valid).toBe(false);
        // Date pattern validation should fail
      });

      it('should reject transaction with invalid date format (wrong order)', () => {
        const result = validateTransaction(transactionInvalidDateFormat2);
        expect(result.valid).toBe(false);
        // Date pattern validation should fail
      });

      it('should reject transaction missing amount', () => {
        const result = validateTransaction(transactionMissingAmount);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('amount is required');
      });

      it('should reject transaction with string amount', () => {
        const result = validateTransaction(transactionStringAmount);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('amount must be a number');
      });

      it('should reject transaction missing description', () => {
        const result = validateTransaction(transactionMissingDescription);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('description is required');
      });

      it('should reject transaction with empty description', () => {
        const result = validateTransaction(transactionEmptyDescription);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('description must not be empty');
      });

      it('should remove extra properties from transaction', () => {
        const txCopy = { ...transactionWithExtraProperties };
        const result = validateTransaction(txCopy);
        expect(result.valid).toBe(true);
        expect(txCopy.extraField).toBeUndefined();
        expect(txCopy.anotherExtra).toBeUndefined();
      });
    });

    describe('Date Format Validation', () => {
      it('should accept valid date format YYYY-MM-DD', () => {
        const tx = { ...validCompletedTransaction, date: '2024-12-31' };
        const result = validateTransaction(tx);
        expect(result.valid).toBe(true);
      });

      it('should accept date with leading zeros in month', () => {
        const tx = { ...validCompletedTransaction, date: '2024-01-15' };
        const result = validateTransaction(tx);
        expect(result.valid).toBe(true);
      });

      it('should accept date with leading zeros in day', () => {
        const tx = { ...validCompletedTransaction, date: '2024-12-01' };
        const result = validateTransaction(tx);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateTransactionSync', () => {
    it('should return transaction when valid', () => {
      const result = validateTransactionSync(validCompletedTransaction);
      expect(result.id).toBe(validCompletedTransaction.id);
    });

    it('should throw error when invalid', () => {
      expect(() => {
        validateTransactionSync(transactionMissingId);
      }).toThrow('id is required');
    });

    it('should include all errors in thrown error', () => {
      try {
        validateTransactionSync(transactionMissingId);
      } catch (error) {
        expect(error.errors).toBeDefined();
        expect(error.errors).toContain('id is required');
      }
    });
  });
});
