/**
 * Tests for Account Validation Schemas
 * Tests account validation including Checking, Savings, and Credit Card accounts
 */

import { describe, it, expect } from 'vitest';
import { validateAccount, validateAccountSync } from '@/validation/validator';
import { AccountType } from '@/store/accounts/constants';
import {
  validCheckingAccount,
  validSavingsAccount,
  validCreditCardAccount,
  creditCardStatementDay1,
  creditCardStatementDay31,
  accountMissingId,
  accountMissingName,
  accountMissingType,
  accountEmptyName,
  accountEmptyId,
  creditCardMissingStatementDay,
  creditCardInvalidStatementDay,
  creditCardStatementDayZero,
  creditCardStatementDayNegative,
  accountWithExtraProperties,
} from '../fixtures';

describe('Account Validation', () => {
  describe('validateAccount', () => {
    describe('Checking Accounts', () => {
      it('should validate a valid checking account', () => {
        const result = validateAccount(
          validCheckingAccount,
          AccountType.CHECKING
        );
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject checking account missing id', () => {
        const result = validateAccount(accountMissingId, AccountType.CHECKING);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id is required');
      });

      it('should reject checking account missing name', () => {
        const result = validateAccount(
          accountMissingName,
          AccountType.CHECKING
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('name is required');
      });

      it('should reject checking account missing type', () => {
        const result = validateAccount(
          accountMissingType,
          AccountType.CHECKING
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('type is required');
      });

      it('should reject checking account with empty name', () => {
        const result = validateAccount(accountEmptyName, AccountType.CHECKING);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('name must not be empty');
      });

      it('should reject checking account with empty id', () => {
        const result = validateAccount(accountEmptyId, AccountType.CHECKING);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id must not be empty');
      });

      it('should remove extra properties from checking account', () => {
        const accountCopy = { ...accountWithExtraProperties };
        const result = validateAccount(accountCopy, AccountType.CHECKING);
        expect(result.valid).toBe(true);
        // Extra properties should be removed by schema validation
        expect(accountCopy.extraField).toBeUndefined();
        expect(accountCopy.anotherExtra).toBeUndefined();
      });
    });

    describe('Savings Accounts', () => {
      it('should validate a valid savings account', () => {
        const result = validateAccount(
          validSavingsAccount,
          AccountType.SAVINGS
        );
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject savings account missing id', () => {
        const result = validateAccount(
          { name: 'Test', type: AccountType.SAVINGS },
          AccountType.SAVINGS
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('id is required');
      });
    });

    describe('Credit Card Accounts', () => {
      it('should validate a valid credit card account', () => {
        const result = validateAccount(
          validCreditCardAccount,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate credit card with statement day 1', () => {
        const result = validateAccount(
          creditCardStatementDay1,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(true);
      });

      it('should validate credit card with statement day 31', () => {
        const result = validateAccount(
          creditCardStatementDay31,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(true);
      });

      it('should reject credit card missing statementDay', () => {
        const result = validateAccount(
          creditCardMissingStatementDay,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('statementDay is required');
      });

      it('should reject credit card with statementDay > 31', () => {
        const result = validateAccount(
          creditCardInvalidStatementDay,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('statementDay must be at most 31');
      });

      it('should reject credit card with statementDay = 0', () => {
        const result = validateAccount(
          creditCardStatementDayZero,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('statementDay must be at least 1');
      });

      it('should reject credit card with negative statementDay', () => {
        const result = validateAccount(
          creditCardStatementDayNegative,
          AccountType.CREDIT_CARD
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('statementDay must be at least 1');
      });
    });

    describe('Unknown Account Type', () => {
      it('should reject unknown account type', () => {
        const result = validateAccount(
          { id: 'test', name: 'Test', type: 'Unknown' },
          'Unknown'
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Unknown account type: Unknown');
      });
    });
  });

  describe('validateAccountSync', () => {
    it('should return account when valid', () => {
      const result = validateAccountSync(
        validCheckingAccount,
        AccountType.CHECKING
      );
      expect(result).toEqual(validCheckingAccount);
    });

    it('should throw error when invalid', () => {
      expect(() => {
        validateAccountSync(accountMissingId, AccountType.CHECKING);
      }).toThrow('id is required');
    });

    it('should include all errors in thrown error', () => {
      try {
        validateAccountSync(accountMissingId, AccountType.CHECKING);
      } catch (error) {
        expect(error.errors).toBeDefined();
        expect(error.errors).toContain('id is required');
      }
    });
  });
});
