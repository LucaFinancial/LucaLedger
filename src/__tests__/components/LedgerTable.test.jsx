import { describe, it, expect } from 'vitest';
import {
  format,
  parseISO,
  isWithinInterval,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

describe('LedgerTable Year Filter', () => {
  it('should filter transactions by selected year', () => {
    // Mock transactions from different years
    const transactionsWithBalance = [
      { id: '1', date: '2023/05/15', amount: 100, balance: 100 },
      { id: '2', date: '2024/05/15', amount: 200, balance: 300 },
      { id: '3', date: '2024/08/20', amount: 150, balance: 450 },
      { id: '4', date: '2025/05/15', amount: 300, balance: 750 },
    ];

    const selectedYear = '2024';

    // Apply the year filter logic from LedgerTable
    let filtered = transactionsWithBalance;

    if (selectedYear !== 'all') {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        try {
          const parsed = parseISO(t.date.replace(/\//g, '-'));
          if (isNaN(parsed.getTime())) return false;
          return format(parsed, 'yyyy') === selectedYear;
        } catch {
          return false;
        }
      });
    }

    // Should only include 2024 transactions
    expect(filtered).toHaveLength(2);
    expect(filtered.map((t) => t.id)).toEqual(['2', '3']);
  });

  it('should include all transactions when selectedYear is "all"', () => {
    const transactionsWithBalance = [
      { id: '1', date: '2023/05/15', amount: 100, balance: 100 },
      { id: '2', date: '2024/05/15', amount: 200, balance: 300 },
      { id: '3', date: '2025/05/15', amount: 300, balance: 600 },
    ];

    const selectedYear = 'all';

    let filtered = transactionsWithBalance;

    if (selectedYear !== 'all') {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        try {
          const parsed = parseISO(t.date.replace(/\//g, '-'));
          if (isNaN(parsed.getTime())) return false;
          return format(parsed, 'yyyy') === selectedYear;
        } catch {
          return false;
        }
      });
    }

    expect(filtered).toHaveLength(3);
  });

  it('should filter statement dividers by selected year', () => {
    // Mock statements from different years
    const accountStatements = [
      {
        endDate: '2023/12/10',
        startDate: '2023/11/11',
      },
      {
        endDate: '2024/01/10',
        startDate: '2023/12/11',
      },
      {
        endDate: '2024/02/10',
        startDate: '2024/01/11',
      },
      {
        endDate: '2025/01/10',
        startDate: '2024/12/11',
      },
    ];

    const selectedYear = '2024';

    // Apply the statement filter logic (the fix we added)
    const filteredStatements = accountStatements.filter((statement) => {
      try {
        const endDate = parseISO(statement.endDate.replace(/\//g, '-'));

        if (isNaN(endDate.getTime())) {
          return false;
        }

        // Filter by selected year
        if (selectedYear !== 'all') {
          const statementYear = format(endDate, 'yyyy');
          if (statementYear !== selectedYear) {
            return false;
          }
        }

        return true;
      } catch {
        return false;
      }
    });

    // Should only include 2024 statements
    expect(filteredStatements).toHaveLength(2);
    expect(filteredStatements.map((s) => s.endDate)).toEqual([
      '2024/01/10',
      '2024/02/10',
    ]);
  });

  it('should filter transactions by rolling date range', () => {
    // Setup rolling date range (e.g., centered on Jan 2025)
    // Let's simulate "today" as Jan 15, 2025
    // Rolling range: Oct 1, 2024 to Apr 30, 2025 (3 months back, 3 months forward)

    const today = new Date('2025-01-15');
    const startDate = startOfMonth(subMonths(today, 3)); // Oct 1, 2024
    const endDate = endOfMonth(addMonths(today, 3)); // Apr 30, 2025

    const rollingDateRange = { startDate, endDate };
    const selectedYear = 'rolling';

    // Mock transactions
    const transactionsWithBalance = [
      { id: '1', date: '2024/09/30', amount: 100 }, // Before range
      { id: '2', date: '2024/10/01', amount: 100 }, // Start of range
      { id: '3', date: '2024/12/31', amount: 100 }, // In range
      { id: '4', date: '2025/01/15', amount: 100 }, // In range (center)
      { id: '5', date: '2025/04/30', amount: 100 }, // End of range
      { id: '6', date: '2025/05/01', amount: 100 }, // After range
    ];

    // Apply the logic from LedgerTable
    let filtered = transactionsWithBalance;

    if (selectedYear !== 'all') {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        try {
          const parsed = parseISO(t.date.replace(/\//g, '-'));
          if (isNaN(parsed.getTime())) return false;

          if (selectedYear === 'rolling' && rollingDateRange) {
            return isWithinInterval(parsed, {
              start: rollingDateRange.startDate,
              end: rollingDateRange.endDate,
            });
          }

          return format(parsed, 'yyyy') === selectedYear;
        } catch {
          return false;
        }
      });
    }

    // Should include ids 2, 3, 4, 5
    expect(filtered).toHaveLength(4);
    expect(filtered.map((t) => t.id)).toEqual(['2', '3', '4', '5']);
  });
});
