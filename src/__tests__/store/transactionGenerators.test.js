/**
 * Tests for Transaction Generators
 * Tests transaction generation functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTransaction } from '@/store/transactions/generators';
import { TransactionStatusEnum } from '@/store/transactions/constants';

describe('Transaction Generators', () => {
  describe('generateTransaction', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate a transaction with default values', () => {
      const transaction = generateTransaction({ accountId: 'acc-001' });

      expect(transaction).not.toBeNull();
      expect(transaction.id).toBeDefined();
      expect(transaction.accountId).toBe('acc-001');
      expect(transaction.status).toBe(TransactionStatusEnum.PLANNED);
      expect(transaction.amount).toBe(0);
      expect(transaction.description).toBe('Enter transaction description');
    });

    it('should use current date by default', () => {
      const transaction = generateTransaction({ accountId: 'acc-001' });

      expect(transaction.date).toBe('2024/06/15');
    });

    it('should generate unique IDs', () => {
      const tx1 = generateTransaction({ accountId: 'acc-001' });
      const tx2 = generateTransaction({ accountId: 'acc-001' });

      expect(tx1.id).not.toBe(tx2.id);
    });

    it('should accept custom status', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        status: TransactionStatusEnum.COMPLETE,
      });

      expect(transaction.status).toBe(TransactionStatusEnum.COMPLETE);
    });

    it('should accept custom amount', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        amount: 5000,
      });

      expect(transaction.amount).toBe(5000);
    });

    it('should accept negative amounts (income)', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        amount: -10000,
      });

      expect(transaction.amount).toBe(-10000);
    });

    it('should accept custom description', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        description: 'Custom Description',
      });

      expect(transaction.description).toBe('Custom Description');
    });

    it('should accept custom date', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        date: '2024/12/25',
      });

      expect(transaction.date).toBe('2024/12/25');
    });

    it('should accept categoryId', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        categoryId: 'cat-001',
      });

      expect(transaction.categoryId).toBe('cat-001');
    });

    it('should return null for invalid transaction data', () => {
      // Invalid status
      const transaction = generateTransaction({
        accountId: 'acc-001',
        status: 'invalid_status',
      });

      expect(transaction).toBeNull();
    });

    it('should return null for invalid date format', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        date: '2024-12-25', // Wrong format
      });

      expect(transaction).toBeNull();
    });

    it('should return null for empty description', () => {
      const transaction = generateTransaction({
        accountId: 'acc-001',
        description: '',
      });

      expect(transaction).toBeNull();
    });
  });
});
