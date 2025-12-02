/**
 * Tests for Statement Generators
 * Tests statement generation functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateStatement } from '@/store/statements/generators';
import { StatementStatusEnum } from '@/store/statements/constants';

describe('Statement Generators', () => {
  describe('generateStatement', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate a statement with required fields', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement).not.toBeNull();
      expect(statement.id).toBeDefined();
      expect(statement.accountId).toBe('acc-credit-001');
      expect(statement.closingDate).toBe('2024/06/15');
      expect(statement.periodStart).toBe('2024/05/16');
      expect(statement.periodEnd).toBe('2024/06/15');
    });

    it('should calculate statementPeriod from closingDate', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.statementPeriod).toBe('2024-06');
    });

    it('should generate unique IDs', () => {
      const stmt1 = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      const stmt2 = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(stmt1.id).not.toBe(stmt2.id);
    });

    it('should set default status to DRAFT', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.status).toBe(StatementStatusEnum.DRAFT);
    });

    it('should accept custom status', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        status: StatementStatusEnum.CURRENT,
      });

      expect(statement.status).toBe(StatementStatusEnum.CURRENT);
    });

    it('should set default numeric fields to 0', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.startingBalance).toBe(0);
      expect(statement.endingBalance).toBe(0);
      expect(statement.totalCharges).toBe(0);
      expect(statement.totalPayments).toBe(0);
    });

    it('should accept custom balance fields', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        startingBalance: 10000,
        endingBalance: 15000,
        totalCharges: 7000,
        totalPayments: 2000,
      });

      expect(statement.startingBalance).toBe(10000);
      expect(statement.endingBalance).toBe(15000);
      expect(statement.totalCharges).toBe(7000);
      expect(statement.totalPayments).toBe(2000);
    });

    it('should set default transactionIds to empty array', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.transactionIds).toEqual([]);
    });

    it('should accept custom transactionIds', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        transactionIds: ['tx-001', 'tx-002', 'tx-003'],
      });

      expect(statement.transactionIds).toEqual(['tx-001', 'tx-002', 'tx-003']);
    });

    it('should set default modification flags to false', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.isStartDateModified).toBe(false);
      expect(statement.isEndDateModified).toBe(false);
      expect(statement.isTotalModified).toBe(false);
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.createdAt).toBeDefined();
      expect(statement.updatedAt).toBeDefined();
      // They should be ISO timestamps
      expect(() => new Date(statement.createdAt)).not.toThrow();
    });

    it('should set lockedAt to null by default', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement.lockedAt).toBeNull();
    });

    it('should handle legacy total field', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        total: 25000, // Legacy field
      });

      expect(statement.endingBalance).toBe(25000);
    });

    it('should prioritize endingBalance over total', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        endingBalance: 30000,
        total: 25000, // Should be ignored
      });

      expect(statement.endingBalance).toBe(30000);
    });

    it('should return null for invalid statement data', () => {
      // Invalid status
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        status: 'invalid_status',
      });

      expect(statement).toBeNull();
    });

    it('should return null for invalid date format', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024-06-15', // Wrong format
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
      });

      expect(statement).toBeNull();
    });

    it('should always recalculate statementPeriod from closingDate', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        closingDate: '2024/06/15',
        periodStart: '2024/05/16',
        periodEnd: '2024/06/15',
        statementPeriod: '2024-05', // Trying to override
      });

      // Should use closingDate to calculate, not provided value
      expect(statement.statementPeriod).toBe('2024-06');
    });
  });
});
