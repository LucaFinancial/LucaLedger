/**
 * Tests for Utility Functions
 * Tests number formatting and currency conversion utilities
 */

import { describe, it, expect } from 'vitest';
import {
  doublePrecisionFormatString,
  parseFloatDoublePrecision,
  centsToDollars,
  dollarsToCents,
} from '@/utils';

describe('Utility Functions', () => {
  describe('doublePrecisionFormatString', () => {
    it('should format integer as currency string', () => {
      const result = doublePrecisionFormatString(100);
      expect(result).toBe('100.00');
    });

    it('should format decimal with 2 places', () => {
      const result = doublePrecisionFormatString(99.99);
      expect(result).toBe('99.99');
    });

    it('should round to 2 decimal places', () => {
      const result = doublePrecisionFormatString(99.999);
      expect(result).toBe('100.00');
    });

    it('should format zero', () => {
      const result = doublePrecisionFormatString(0);
      expect(result).toBe('0.00');
    });

    it('should format negative numbers', () => {
      const result = doublePrecisionFormatString(-50.5);
      expect(result).toBe('-50.50');
    });

    it('should format large numbers with proper grouping', () => {
      const result = doublePrecisionFormatString(1000000.5);
      // Result depends on locale, but should have 2 decimal places
      expect(result).toMatch(/1[,.]?000[,.]?000\.50/);
    });
  });

  describe('parseFloatDoublePrecision', () => {
    it('should parse string to float with 2 decimal places', () => {
      const result = parseFloatDoublePrecision('99.999');
      expect(result).toBe(100);
    });

    it('should parse integer string', () => {
      const result = parseFloatDoublePrecision('100');
      expect(result).toBe(100);
    });

    it('should handle float input', () => {
      // parseFloatDoublePrecision truncates to 2 decimal places using toFixed
      const result = parseFloatDoublePrecision(50.555);
      // Due to floating point representation, 50.555 becomes slightly less
      // toFixed(2) rounds using banker's rounding which gives 50.55
      expect(result).toBe(50.55);
    });

    it('should handle zero', () => {
      const result = parseFloatDoublePrecision(0);
      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      const result = parseFloatDoublePrecision(-25.789);
      expect(result).toBe(-25.79);
    });
  });

  describe('centsToDollars', () => {
    it('should convert 100 cents to 1 dollar', () => {
      expect(centsToDollars(100)).toBe(1);
    });

    it('should convert 5000 cents to 50 dollars', () => {
      expect(centsToDollars(5000)).toBe(50);
    });

    it('should convert 99 cents to 0.99 dollars', () => {
      expect(centsToDollars(99)).toBe(0.99);
    });

    it('should handle zero', () => {
      expect(centsToDollars(0)).toBe(0);
    });

    it('should handle negative cents', () => {
      expect(centsToDollars(-500)).toBe(-5);
    });

    it('should handle large amounts', () => {
      expect(centsToDollars(10000000)).toBe(100000);
    });

    it('should handle single cent', () => {
      expect(centsToDollars(1)).toBe(0.01);
    });
  });

  describe('dollarsToCents', () => {
    it('should convert 1 dollar to 100 cents', () => {
      expect(dollarsToCents(1)).toBe(100);
    });

    it('should convert 50 dollars to 5000 cents', () => {
      expect(dollarsToCents(50)).toBe(5000);
    });

    it('should convert 0.99 dollars to 99 cents', () => {
      expect(dollarsToCents(0.99)).toBe(99);
    });

    it('should handle zero', () => {
      expect(dollarsToCents(0)).toBe(0);
    });

    it('should handle negative dollars', () => {
      expect(dollarsToCents(-5)).toBe(-500);
    });

    it('should handle large amounts', () => {
      expect(dollarsToCents(100000)).toBe(10000000);
    });

    it('should handle single cent', () => {
      expect(dollarsToCents(0.01)).toBe(1);
    });

    // Edge cases for floating-point precision
    it('should handle 0.1 without precision errors', () => {
      expect(dollarsToCents(0.1)).toBe(10);
    });

    it('should handle 0.2 without precision errors', () => {
      expect(dollarsToCents(0.2)).toBe(20);
    });

    it('should handle 19.99 without precision errors', () => {
      expect(dollarsToCents(19.99)).toBe(1999);
    });

    it('should handle 9.99 without precision errors', () => {
      expect(dollarsToCents(9.99)).toBe(999);
    });

    it('should handle 1.005 (potential rounding issue)', () => {
      // Due to floating point, 1.005 * 100 = 100.499999...
      // The implementation rounds this down to 100
      expect(dollarsToCents(1.005)).toBe(100);
    });
  });

  describe('Round-trip conversions', () => {
    it('should preserve value in cents -> dollars -> cents', () => {
      const originalCents = 12345;
      const dollars = centsToDollars(originalCents);
      const backToCents = dollarsToCents(dollars);
      expect(backToCents).toBe(originalCents);
    });

    it('should preserve value in dollars -> cents -> dollars', () => {
      const originalDollars = 123.45;
      const cents = dollarsToCents(originalDollars);
      const backToDollars = centsToDollars(cents);
      expect(backToDollars).toBe(originalDollars);
    });
  });
});
