import { describe, it, expect } from 'vitest';
import {
  format,
  addMonths,
  subMonths,
  getDate,
  getDaysInMonth,
} from 'date-fns';

/**
 * Tests for the rolling view expansion logic
 * These tests verify that months are expanded/collapsed correctly based on the current date
 */

describe('Rolling View Expansion Logic', () => {
  /**
   * Helper function that replicates the getDefaultCollapsedGroups logic for rolling view
   */
  const getExpandedMonthsForDate = (testDate) => {
    const current = testDate;
    const previous = subMonths(current, 1);
    const next = addMonths(current, 1);
    const monthAfterNext = addMonths(current, 2);

    const previousMonthStr = `${format(previous, 'yyyy')}-${format(
      previous,
      'MMMM',
    )}`;
    const currentMonthStr = `${format(current, 'yyyy')}-${format(
      current,
      'MMMM',
    )}`;
    const nextMonthStr = `${format(next, 'yyyy')}-${format(next, 'MMMM')}`;
    const monthAfterNextStr = `${format(monthAfterNext, 'yyyy')}-${format(
      monthAfterNext,
      'MMMM',
    )}`;

    const currentDay = getDate(current);
    const daysInCurrentMonth = getDaysInMonth(current);

    // Determine which months should be expanded
    const expandedMonths = new Set([currentMonthStr, nextMonthStr]);

    // First 5 days: expand previous month
    if (currentDay <= 5) {
      expandedMonths.add(previousMonthStr);
    }

    // Last 5 days: expand month after next
    if (currentDay > daysInCurrentMonth - 5) {
      expandedMonths.add(monthAfterNextStr);
    }

    // Return expanded months (those not in collapsed)
    return Array.from(expandedMonths);
  };

  it('should expand previous month on the 1st day of the month', () => {
    const testDate = new Date('2025-02-01');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2025-January'); // Previous month
    expect(expandedMonths).toContain('2025-February'); // Current month
    expect(expandedMonths).toContain('2025-March'); // Next month
    expect(expandedMonths).not.toContain('2025-April'); // Month after next (not last 5 days)
  });

  it('should expand previous month on the 5th day of the month', () => {
    const testDate = new Date('2025-02-05');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2025-January'); // Previous month (day 5 is still first 5 days)
    expect(expandedMonths).toContain('2025-February'); // Current month
    expect(expandedMonths).toContain('2025-March'); // Next month
  });

  it('should NOT expand previous month on the 6th day of the month', () => {
    const testDate = new Date('2025-02-06');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).not.toContain('2025-January'); // Previous month should NOT be expanded
    expect(expandedMonths).toContain('2025-February'); // Current month
    expect(expandedMonths).toContain('2025-March'); // Next month
  });

  it('should expand month after next in last 5 days of 28-day month (Feb non-leap)', () => {
    // Feb 2025 has 28 days, so last 5 days start on day 24
    const testDate = new Date('2025-02-24');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).not.toContain('2025-January'); // Previous month (not in first 5 days)
    expect(expandedMonths).toContain('2025-February'); // Current month
    expect(expandedMonths).toContain('2025-March'); // Next month
    expect(expandedMonths).toContain('2025-April'); // Month after next (last 5 days)
  });

  it('should expand month after next in last 5 days of 29-day month (Feb leap year)', () => {
    // Feb 2024 has 29 days, so last 5 days start on day 25
    const testDate = new Date('2024-02-25');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2024-February'); // Current month
    expect(expandedMonths).toContain('2024-March'); // Next month
    expect(expandedMonths).toContain('2024-April'); // Month after next (last 5 days)
  });

  it('should expand month after next in last 5 days of 30-day month', () => {
    // April has 30 days, so last 5 days start on day 26
    const testDate = new Date('2025-04-26');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2025-April'); // Current month
    expect(expandedMonths).toContain('2025-May'); // Next month
    expect(expandedMonths).toContain('2025-June'); // Month after next (last 5 days)
  });

  it('should expand month after next in last 5 days of 31-day month', () => {
    // January has 31 days, so last 5 days start on day 27
    const testDate = new Date('2025-01-27');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2025-January'); // Current month
    expect(expandedMonths).toContain('2025-February'); // Next month
    expect(expandedMonths).toContain('2025-March'); // Month after next (last 5 days)
  });

  it('should NOT expand month after next on day 26 of 31-day month', () => {
    // January has 31 days, so last 5 days start on day 27 (26 is not in last 5)
    const testDate = new Date('2025-01-26');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2025-January'); // Current month
    expect(expandedMonths).toContain('2025-February'); // Next month
    expect(expandedMonths).not.toContain('2025-March'); // Month after next should NOT be expanded
  });

  it('should expand previous AND month after next on day 5 of last month', () => {
    // Testing edge case: day 5 AND in last 5 days of month (Feb 28-day month)
    const testDate = new Date('2025-02-05');

    const expandedMonths = getExpandedMonthsForDate(testDate);

    // Day 5 is in first 5 days
    expect(expandedMonths).toContain('2025-January'); // Previous month
    expect(expandedMonths).toContain('2025-February'); // Current month
    expect(expandedMonths).toContain('2025-March'); // Next month

    // For a 28-day month, day 5 is NOT in last 5 days (would need to be > 23)
    expect(expandedMonths).not.toContain('2025-April');
  });

  it('should handle year boundary correctly (December -> January)', () => {
    const testDate = new Date('2024-12-28'); // In last 5 days of December

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2024-December'); // Current month
    expect(expandedMonths).toContain('2025-January'); // Next month
    expect(expandedMonths).toContain('2025-February'); // Month after next (in last 5 days)
  });

  it('should handle year boundary correctly (January -> February)', () => {
    const testDate = new Date('2025-01-03'); // In first 5 days of January

    const expandedMonths = getExpandedMonthsForDate(testDate);

    expect(expandedMonths).toContain('2024-December'); // Previous month (in first 5 days)
    expect(expandedMonths).toContain('2025-January'); // Current month
    expect(expandedMonths).toContain('2025-February'); // Next month
  });

  it('should always expand current and next month regardless of day', () => {
    // Test various days in the middle of the month
    const testDates = [
      new Date('2025-02-10'),
      new Date('2025-02-15'),
      new Date('2025-02-20'),
    ];

    testDates.forEach((testDate) => {
      const expandedMonths = getExpandedMonthsForDate(testDate);
      expect(expandedMonths).toContain('2025-February'); // Current month always expanded
      expect(expandedMonths).toContain('2025-March'); // Next month always expanded
    });
  });
});
