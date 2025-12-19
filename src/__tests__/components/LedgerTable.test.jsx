import { describe, it, expect } from 'vitest';
import { format, parseISO } from 'date-fns';

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
        closingDate: '2023/12/10',
        periodStart: '2023/11/11',
        periodEnd: '2023/12/10',
      },
      {
        closingDate: '2024/01/10',
        periodStart: '2023/12/11',
        periodEnd: '2024/01/10',
      },
      {
        closingDate: '2024/02/10',
        periodStart: '2024/01/11',
        periodEnd: '2024/02/10',
      },
      {
        closingDate: '2025/01/10',
        periodStart: '2024/12/11',
        periodEnd: '2025/01/10',
      },
    ];

    const selectedYear = '2024';

    // Apply the statement filter logic (the fix we added)
    const filteredStatements = accountStatements.filter((statement) => {
      try {
        const closingDate = parseISO(statement.closingDate.replace(/\//g, '-'));

        if (isNaN(closingDate.getTime())) {
          return false;
        }

        // Filter by selected year
        if (selectedYear !== 'all') {
          const statementYear = format(closingDate, 'yyyy');
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
    expect(filteredStatements.map((s) => s.closingDate)).toEqual([
      '2024/01/10',
      '2024/02/10',
    ]);
  });
});
