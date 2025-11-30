/**
 * Tests for Statement Validation Schemas
 * Tests statement validation including various statuses and edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  validateStatement,
  validateStatementSync,
} from '@/validation/validator';
import {
  validCurrentStatement,
  validPastStatement,
  validLockedStatement,
  validDraftStatement,
  validStatementWithModifiedDates,
  statementMissingId,
  statementMissingAccountId,
  statementMissingClosingDate,
  statementInvalidDateFormat,
  statementInvalidStatus,
  statementInvalidPeriodFormat,
  statementMissingTransactionIds,
} from '../fixtures';

describe('Statement Validation', () => {
  describe('validateStatement', () => {
    describe('Valid Statements', () => {
      it('should validate a current statement', () => {
        const result = validateStatement(validCurrentStatement);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a past statement', () => {
        const result = validateStatement(validPastStatement);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a locked statement', () => {
        const result = validateStatement(validLockedStatement);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a draft statement', () => {
        const result = validateStatement(validDraftStatement);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate a statement with modified dates', () => {
        const result = validateStatement(validStatementWithModifiedDates);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Invalid Statements', () => {
      it('should reject statement missing id', () => {
        const result = validateStatement(statementMissingId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id is required');
      });

      it('should reject statement missing accountId', () => {
        const result = validateStatement(statementMissingAccountId);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('accountId is required');
      });

      it('should reject statement missing closingDate', () => {
        const result = validateStatement(statementMissingClosingDate);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('closingDate is required');
      });

      it('should reject statement with invalid date format', () => {
        const result = validateStatement(statementInvalidDateFormat);
        expect(result.valid).toBe(false);
        // Date pattern validation should fail
      });

      it('should reject statement with invalid status', () => {
        const result = validateStatement(statementInvalidStatus);
        expect(result.valid).toBe(false);
        expect(
          result.errors.some((e) => e.includes('status must be one of'))
        ).toBe(true);
      });

      it('should reject statement with invalid period format', () => {
        const result = validateStatement(statementInvalidPeriodFormat);
        expect(result.valid).toBe(false);
        // Period pattern validation should fail
      });

      it('should reject statement missing transactionIds', () => {
        const result = validateStatement(statementMissingTransactionIds);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('transactionIds is required');
      });
    });

    describe('Balance Fields', () => {
      it('should validate statement with zero balances', () => {
        const statement = {
          ...validCurrentStatement,
          startingBalance: 0,
          endingBalance: 0,
          totalCharges: 0,
          totalPayments: 0,
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });

      it('should validate statement with large balances', () => {
        const statement = {
          ...validCurrentStatement,
          startingBalance: 10000000, // $100,000.00
          endingBalance: 15000000, // $150,000.00
          totalCharges: 7500000,
          totalPayments: 2500000,
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });

      it('should validate statement with negative ending balance', () => {
        const statement = {
          ...validCurrentStatement,
          startingBalance: 5000,
          endingBalance: -10000, // Can be negative (credit)
          totalCharges: 0,
          totalPayments: 15000,
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });
    });

    describe('Timestamps', () => {
      it('should validate statement with ISO timestamps', () => {
        const statement = {
          ...validCurrentStatement,
          createdAt: '2024-06-15T10:30:00.000Z',
          updatedAt: '2024-06-20T14:45:00.000Z',
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });

      it('should validate locked statement with lockedAt timestamp', () => {
        const statement = {
          ...validLockedStatement,
          lockedAt: '2024-05-01T00:00:00.000Z',
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });
    });

    describe('Transaction IDs', () => {
      it('should validate statement with empty transaction IDs array', () => {
        const statement = {
          ...validCurrentStatement,
          transactionIds: [],
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });

      it('should validate statement with multiple transaction IDs', () => {
        const statement = {
          ...validCurrentStatement,
          transactionIds: ['tx-001', 'tx-002', 'tx-003', 'tx-004', 'tx-005'],
        };
        const result = validateStatement(statement);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateStatementSync', () => {
    it('should return statement when valid', () => {
      const result = validateStatementSync(validCurrentStatement);
      expect(result.id).toBe(validCurrentStatement.id);
    });

    it('should throw error when invalid', () => {
      expect(() => {
        validateStatementSync(statementMissingId);
      }).toThrow('id is required');
    });

    it('should include all errors in thrown error', () => {
      try {
        validateStatementSync(statementMissingId);
      } catch (error) {
        expect(error.errors).toBeDefined();
        expect(error.errors).toContain('id is required');
      }
    });
  });
});
