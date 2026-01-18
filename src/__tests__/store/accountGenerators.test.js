/**
 * Tests for Account Generators
 * Tests account generation functions
 */

import { describe, it, expect } from 'vitest';
import {
  generateAccount,
  generateNewCheckingAccount,
  generateNewSavingsAccount,
  generateNewCreditCardAccount,
  generateAccountObject,
} from '@/store/accounts/generators';
import { AccountType } from '@/store/accounts/constants';

describe('Account Generators', () => {
  describe('generateAccount', () => {
    it('should generate a checking account by default', () => {
      const account = generateAccount({ name: 'Test Account' });

      expect(account.id).toBeDefined();
      expect(account.type).toBe(AccountType.CHECKING);
      expect(account.name).toBe('Test Account');
    });

    it('should generate a savings account when specified', () => {
      const account = generateAccount({
        name: 'Savings Test',
        type: AccountType.SAVINGS,
      });

      expect(account.type).toBe(AccountType.SAVINGS);
    });

    it('should generate a credit card account with statementClosingDay', () => {
      const account = generateAccount({
        name: 'Credit Card Test',
        type: AccountType.CREDIT_CARD,
        statementClosingDay: 15,
      });

      expect(account.type).toBe(AccountType.CREDIT_CARD);
      expect(account.statementClosingDay).toBe(15);
    });

    it('should generate unique IDs', () => {
      const account1 = generateAccount({ name: 'Account 1' });
      const account2 = generateAccount({ name: 'Account 2' });

      expect(account1.id).not.toBe(account2.id);
    });

    it('should respect provided id', () => {
      const customId = '123e4567-e89b-12d3-a456-426614174000';
      const account = generateAccount({
        id: customId,
        name: 'Custom ID Account',
      });

      expect(account.id).toBe(customId);
    });

    it('should throw for invalid account data', () => {
      expect(() => {
        generateAccount({ type: AccountType.CREDIT_CARD }); // Missing statementClosingDay
      }).toThrow();
    });
  });

  describe('generateNewCheckingAccount', () => {
    it('should throw without a name (requires name)', () => {
      // generateNewCheckingAccount requires a name to be valid
      expect(() => generateNewCheckingAccount()).toThrow('name is required');
    });
  });

  describe('generateNewSavingsAccount', () => {
    it('should throw without a name (requires name)', () => {
      // generateNewSavingsAccount requires a name to be valid
      expect(() => generateNewSavingsAccount()).toThrow('name is required');
    });
  });

  describe('generateNewCreditCardAccount', () => {
    it('should throw without a name (requires name)', () => {
      // generateNewCreditCardAccount requires a name to be valid
      expect(() => generateNewCreditCardAccount()).toThrow('name is required');
    });
  });

  describe('generateAccountObject', () => {
    it('should create account object from parameters', () => {
      const account = generateAccountObject(
        'acc-123',
        'Test Account',
        AccountType.CHECKING,
        undefined
      );

      expect(account.id).toBe('acc-123');
      expect(account.name).toBe('Test Account');
      expect(account.type).toBe(AccountType.CHECKING);
    });

    it('should include statementClosingDay for credit cards', () => {
      const account = generateAccountObject(
        'cc-123',
        'Credit Card',
        AccountType.CREDIT_CARD,
        15
      );

      expect(account.statementClosingDay).toBe(15);
    });
  });
});
