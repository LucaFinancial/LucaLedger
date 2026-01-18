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
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      expect(statement).not.toBeNull();
      expect(statement.id).toBeDefined();
      expect(statement.accountId).toBe('acc-credit-001');
      expect(statement.startDate).toBe('2024-05-16');
      expect(statement.endDate).toBe('2024-06-15');
    });

    it('should generate unique IDs', () => {
      const stmt1 = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      const stmt2 = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      expect(stmt1.id).not.toBe(stmt2.id);
    });

    it('should set default status to DRAFT', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      expect(statement.status).toBe(StatementStatusEnum.DRAFT);
    });

    it('should accept custom status', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
        status: StatementStatusEnum.CURRENT,
      });

      expect(statement.status).toBe(StatementStatusEnum.CURRENT);
    });

    it('should set default numeric fields to 0', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      expect(statement.startingBalance).toBe(0);
      expect(statement.endingBalance).toBe(0);
      expect(statement.totalCharges).toBe(0);
      expect(statement.totalPayments).toBe(0);
    });

    it('should accept custom balance fields', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
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

    it('should set createdAt and updatedAt timestamps', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
      });

      expect(statement.createdAt).toBeDefined();
      expect(statement.updatedAt).toBeDefined();
      // They should be ISO timestamps
      expect(() => new Date(statement.createdAt)).not.toThrow();
    });

    it('should handle legacy total field', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
        total: 25000, // Legacy field
      });

      expect(statement.endingBalance).toBe(25000);
    });

    it('should prioritize endingBalance over total', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
        endingBalance: 30000,
        total: 25000, // Should be ignored
      });

      expect(statement.endingBalance).toBe(30000);
    });

    it('should return null for invalid statement data', () => {
      // Invalid status
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024-06-15',
        status: 'invalid_status',
      });

      expect(statement).toBeNull();
    });

    it('should return null for invalid date format', () => {
      const statement = generateStatement({
        accountId: 'acc-credit-001',
        startDate: '2024-05-16',
        endDate: '2024/06/15', // Wrong format
      });

      expect(statement).toBeNull();
    });
  });
});
