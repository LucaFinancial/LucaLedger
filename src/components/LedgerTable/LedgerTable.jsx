import LedgerRow from '@/components/LedgerRow';
import {
  constants as accountConstants,
  selectors as accountSelectors,
} from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import { selectors as statementSelectors } from '@/store/statements';
import { selectors as recurringTransactionSelectors } from '@/store/recurringTransactions';
import { selectors as recurringTransactionEventSelectors } from '@/store/recurringTransactionEvents';
import { selectors as settingsSelectors } from '@/store/settings';
import { Paper, Table, TableBody, TableContainer } from '@mui/material';
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  add,
  subMonths,
  isWithinInterval,
} from 'date-fns';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LedgerHeader from './LedgerHeader';
import SeparatorRow from './SeparatorRow';
import StatementSeparatorRow from './StatementSeparatorRow';
import { dateCompareFn, generateVirtualTransactions } from './utils';

export default function LedgerTable({
  filterValue,
  showUncategorizedOnly,
  collapsedGroups,
  setCollapsedGroups,
  selectedTransactions,
  onSelectionChange,
  selectedYear,
  rollingDateRange,
}) {
  const { accountId } = useParams();
  const account = useSelector(accountSelectors.selectAccountById(accountId));

  const selectAccountTransactions = useMemo(
    () => transactionSelectors.selectTransactionsByAccountId(accountId),
    [accountId],
  );
  const transactions = useSelector(selectAccountTransactions);

  const categories = useSelector(categorySelectors.selectAllCategories);
  const accountStatements = useSelector(
    statementSelectors.selectStatementsByAccountId(accountId),
  );
  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactionsByAccountId(
      accountId,
    ),
  );
  const realizedDatesMap = useSelector(
    recurringTransactionEventSelectors.selectAllRealizedDatesMap,
  );
  const recurringProjection = useSelector(
    settingsSelectors.selectRecurringProjection,
  );

  // Generate virtual transactions from recurring rules
  const virtualTransactions = useMemo(() => {
    const projectionEndDate = add(new Date(), {
      [recurringProjection.unit]: recurringProjection.amount,
    });
    return generateVirtualTransactions(
      recurringTransactions,
      realizedDatesMap,
      projectionEndDate,
    );
  }, [recurringTransactions, realizedDatesMap, recurringProjection]);

  // Combine real and virtual transactions
  const allTransactions = useMemo(
    () => [...transactions, ...virtualTransactions],
    [transactions, virtualTransactions],
  );

  const sortedTransactions = useMemo(
    () => [...allTransactions].sort(dateCompareFn),
    [allTransactions],
  );

  const transactionsWithBalance = useMemo(() => {
    let currentBalance = 0.0;
    // Add initial balance if it exists (though schema doesn't currently support it)
    if (account.initialBalance) {
      currentBalance += account.initialBalance;
    }
    return sortedTransactions.map((transaction) => {
      currentBalance += transaction.amount;
      return { ...transaction, balance: currentBalance };
    }, []);
  }, [sortedTransactions, account.initialBalance]);

  const filteredTransactions = useMemo(() => {
    // Start with all transactions with balance
    let filtered = transactionsWithBalance;

    // Apply year filter
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

    // Apply uncategorized filter
    if (showUncategorizedOnly) {
      filtered = filtered.filter((transaction) => !transaction.categoryId);
    }

    // Apply text filter
    if (filterValue) {
      const lowerFilter = filterValue.toLowerCase();
      filtered = filtered.filter((transaction) => {
        // Check description
        const matchesDescription = transaction.description
          .toLowerCase()
          .includes(lowerFilter);

        // Check category name
        const category = categories.find(
          (cat) => cat.id === transaction.categoryId,
        );
        const matchesCategory = category?.name
          .toLowerCase()
          .includes(lowerFilter);

        // Check parent category name if this is a subcategory
        const parentCategory = category?.parentId
          ? categories.find((cat) => cat.id === category.parentId)
          : null;
        const matchesParentCategory = parentCategory?.name
          .toLowerCase()
          .includes(lowerFilter);

        // Include if matches description, category, parent category, or is already selected
        return (
          matchesDescription ||
          matchesCategory ||
          matchesParentCategory ||
          selectedTransactions.has(transaction.id)
        );
      });
    }

    return filtered;
  }, [
    filterValue,
    showUncategorizedOnly,
    transactionsWithBalance,
    selectedTransactions,
    selectedYear,
    categories,
    rollingDateRange,
  ]);

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prevCollapsedGroups) =>
      prevCollapsedGroups.includes(groupId)
        ? prevCollapsedGroups.filter((id) => id !== groupId)
        : [...prevCollapsedGroups, groupId],
    );
  };

  const handleExpandYear = (yearId) => {
    setCollapsedGroups((prevCollapsedGroups) => {
      const monthsInYear = filteredTransactions
        .filter((t) => getYearIdentifier(t.date) === yearId)
        .map((t) => getYearMonthKey(t.date));
      const uniqueMonths = [...new Set(monthsInYear)];
      return prevCollapsedGroups.filter(
        (id) => !uniqueMonths.includes(id) && id !== yearId,
      );
    });
  };

  const handleCollapseYear = (yearId) => {
    setCollapsedGroups((prevCollapsedGroups) => {
      const monthsInYear = filteredTransactions
        .filter((t) => getYearIdentifier(t.date) === yearId)
        .map((t) => getYearMonthKey(t.date));
      const uniqueMonths = [...new Set(monthsInYear)];
      return [...prevCollapsedGroups, yearId, ...uniqueMonths];
    });
  };

  const getYearIdentifier = useCallback((date) => {
    if (!date) return '';
    try {
      const parsed = parseISO(date.replace(/\//g, '-'));
      if (isNaN(parsed.getTime())) return '';
      return format(parsed, 'yyyy');
    } catch {
      return '';
    }
  }, []);

  const getMonthIdentifier = useCallback((date) => {
    if (!date) return '';
    try {
      const parsed = parseISO(date.replace(/\//g, '-'));
      if (isNaN(parsed.getTime())) return '';
      return format(parsed, 'MMMM');
    } catch {
      return '';
    }
  }, []);

  const getYearMonthKey = useCallback(
    (date) => {
      return `${getYearIdentifier(date)}-${getMonthIdentifier(date)}`;
    },
    [getYearIdentifier, getMonthIdentifier],
  );

  const getSelectedCountForGroup = useCallback(
    (groupId, isYear) => {
      return filteredTransactions.filter((transaction) => {
        const transactionGroupId = isYear
          ? getYearIdentifier(transaction.date)
          : getYearMonthKey(transaction.date);
        return (
          transactionGroupId === groupId &&
          selectedTransactions.has(transaction.id)
        );
      }).length;
    },
    [
      filteredTransactions,
      selectedTransactions,
      getYearIdentifier,
      getYearMonthKey,
    ],
  );

  // Build grouped data structure with transactions and statement dividers
  const groupedData = useMemo(() => {
    const groups = {};
    const statementClosingDay = account.statementClosingDay || 1;
    const isCreditCard =
      account.type === accountConstants.AccountType.CREDIT_CARD;

    // First, group all transactions by year and month
    filteredTransactions.forEach((transaction) => {
      const year = getYearIdentifier(transaction.date);
      const month = getMonthIdentifier(transaction.date);
      const yearMonthKey = getYearMonthKey(transaction.date);

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][yearMonthKey]) {
        groups[year][yearMonthKey] = {
          month,
          firstTransactionDate: transaction.date,
          items: [],
        };
      }

      groups[year][yearMonthKey].items.push({
        type: 'transaction',
        data: transaction,
      });
    });

    // For credit cards, insert statement dividers using actual statement data
    if (isCreditCard && accountStatements.length > 0) {
      // Sort statements by end date
      const sortedStatements = [...accountStatements].sort((a, b) =>
        a.endDate.localeCompare(b.endDate),
      );

      sortedStatements.forEach((statement) => {
        try {
          const closingDate = parseISO(statement.endDate.replace(/\//g, '-'));
          const periodStartDate = parseISO(
            statement.startDate.replace(/\//g, '-'),
          );
          const periodEndDate = parseISO(statement.endDate.replace(/\//g, '-'));

          if (
            isNaN(closingDate.getTime()) ||
            isNaN(periodStartDate.getTime()) ||
            isNaN(periodEndDate.getTime())
          ) {
            return;
          }

          // Skip statement dividers that don't belong to the selected year
          if (selectedYear !== 'all') {
            const statementYear = format(closingDate, 'yyyy');
            if (statementYear !== selectedYear) {
              return;
            }
          }

          // Get transactions in this statement period
          const statementTransactions = transactionsWithBalance.filter((t) => {
            if (!t.date) return false;
            try {
              const tDate = parseISO(t.date.replace(/\//g, '-'));
              if (isNaN(tDate.getTime())) return false;
              return (
                (isAfter(tDate, periodStartDate) ||
                  isSameDay(tDate, periodStartDate)) &&
                (isBefore(tDate, periodEndDate) ||
                  isSameDay(tDate, periodEndDate)) &&
                !t.description.toLowerCase().includes('payment')
              );
            } catch {
              return false;
            }
          });

          // Determine which month group this statement belongs to
          const year = format(closingDate, 'yyyy');
          const month = format(closingDate, 'MMMM');
          const yearMonthKey = `${year}-${month}`;

          // Ensure the group exists
          if (!groups[year]) {
            groups[year] = {};
          }
          if (!groups[year][yearMonthKey]) {
            groups[year][yearMonthKey] = {
              month,
              firstTransactionDate: statement.endDate,
              items: [],
            };
          }

          // Find correct insertion point for statement divider
          const items = groups[year][yearMonthKey].items;
          let insertIndex = items.length;

          for (let i = 0; i < items.length; i++) {
            if (items[i].type === 'transaction') {
              try {
                const itemDate = parseISO(
                  items[i].data.date.replace(/\//g, '-'),
                );
                if (
                  !isNaN(itemDate.getTime()) &&
                  isAfter(itemDate, periodEndDate)
                ) {
                  insertIndex = i;
                  break;
                }
              } catch {
                // Skip invalid dates
              }
            }
          }

          // Insert statement divider using actual statement dates
          items.splice(insertIndex, 0, {
            type: 'statement-divider',
            date: format(closingDate, 'yyyy-MM-dd'),
            statementClosingDay,
            startDate: format(periodStartDate, 'yyyy-MM-dd'),
            endDate: format(periodEndDate, 'yyyy-MM-dd'),
            transactions: statementTransactions,
          });
        } catch (error) {
          console.error('Error processing statement:', statement, error);
        }
      });
    } else if (isCreditCard) {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      Object.keys(groups).forEach((year) => {
        Object.keys(groups[year]).forEach((yearMonthKey) => {
          const monthData = groups[year][yearMonthKey];
          const [yearStr, monthStr] = yearMonthKey.split('-');

          // Get month number (0-11) from month name
          const monthIndex = monthNames.indexOf(monthStr);
          if (monthIndex === -1) return;

          // Create statement closing date for this month
          // Clamp statement day to valid range for the month
          const daysInMonth = new Date(
            parseInt(yearStr),
            monthIndex + 1,
            0,
          ).getDate();
          const validStatementDay = Math.min(statementClosingDay, daysInMonth);
          const statementDate = new Date(
            parseInt(yearStr),
            monthIndex,
            validStatementDay,
          );

          // Calculate period covered by this statement
          // Statement closes on statementDate (e.g., Dec 10)
          // It covers transactions from previous closing day through day before this closing
          const periodEnd = statementDate;
          const periodStart = subMonths(statementDate, 1);

          // Get all transactions in this statement period
          const statementTransactions = transactionsWithBalance.filter((t) => {
            if (!t.date) return false;
            try {
              const tDate = parseISO(t.date.replace(/\//g, '-'));
              if (isNaN(tDate.getTime())) return false;
              return (
                (isAfter(tDate, periodStart) ||
                  isSameDay(tDate, periodStart)) &&
                (isBefore(tDate, periodEnd) || isSameDay(tDate, periodEnd)) &&
                !t.description.toLowerCase().includes('payment')
              );
            } catch {
              return false;
            }
          });

          // Find correct insertion point for statement divider
          const items = monthData.items;
          let insertIndex = items.length;

          for (let i = 0; i < items.length; i++) {
            if (items[i].type === 'transaction') {
              try {
                const itemDate = parseISO(
                  items[i].data.date.replace(/\//g, '-'),
                );
                if (
                  !isNaN(itemDate.getTime()) &&
                  isAfter(itemDate, periodEnd)
                ) {
                  insertIndex = i;
                  break;
                }
              } catch {
                // Skip invalid dates
              }
            }
          }

          // Insert statement divider
          items.splice(insertIndex, 0, {
            type: 'statement-divider',
            date: format(statementDate, 'yyyy-MM-dd'),
            statementClosingDay,
            startDate: format(periodStart, 'yyyy-MM-dd'),
            endDate: format(periodEnd, 'yyyy-MM-dd'),
            transactions: statementTransactions,
          });
        });
      });
    }

    return groups;
  }, [
    filteredTransactions,
    transactionsWithBalance,
    account.statementClosingDay,
    account.type,
    accountStatements,
    getYearIdentifier,
    getMonthIdentifier,
    getYearMonthKey,
    selectedYear,
  ]);

  return (
    <TableContainer
      component={Paper}
      style={{ overflow: 'auto', height: '100%' }}
    >
      <Table stickyHeader>
        <LedgerHeader />
        <TableBody>
          {Object.keys(groupedData).map((year) => {
            const yearMonths = groupedData[year];
            const yearId = year;
            const isYearCollapsed = collapsedGroups.includes(yearId);

            return (
              <Fragment key={year}>
                <SeparatorRow
                  transaction={{ date: `${year}-01-01` }}
                  isYear
                  isCollapsed={isYearCollapsed}
                  onToggleCollapse={() => toggleGroupCollapse(yearId)}
                  onExpandYear={() => handleExpandYear(yearId)}
                  onCollapseYear={() => handleCollapseYear(yearId)}
                  selectedCount={getSelectedCountForGroup(yearId, true)}
                />

                {!isYearCollapsed &&
                  Object.keys(yearMonths).map((yearMonthKey) => {
                    const monthData = yearMonths[yearMonthKey];
                    const isMonthCollapsed =
                      collapsedGroups.includes(yearMonthKey);

                    return (
                      <Fragment key={yearMonthKey}>
                        <SeparatorRow
                          transaction={{ date: monthData.firstTransactionDate }}
                          previousTransaction={null}
                          isCollapsed={isMonthCollapsed}
                          onToggleCollapse={() =>
                            toggleGroupCollapse(yearMonthKey)
                          }
                          selectedCount={getSelectedCountForGroup(
                            yearMonthKey,
                            false,
                          )}
                          monthKey={yearMonthKey}
                        />

                        {!isMonthCollapsed &&
                          monthData.items.map((item) => {
                            if (item.type === 'transaction') {
                              const transaction = item.data;
                              const isVirtual = transaction.isVirtual === true;
                              return (
                                <LedgerRow
                                  key={transaction.id}
                                  row={transaction}
                                  balance={transaction.balance}
                                  isSelected={selectedTransactions.has(
                                    transaction.id,
                                  )}
                                  onSelectionChange={onSelectionChange}
                                  isVirtual={isVirtual}
                                  recurringTransaction={
                                    isVirtual
                                      ? transaction.recurringTransaction
                                      : null
                                  }
                                  occurrenceDate={
                                    isVirtual ? transaction.date : null
                                  }
                                />
                              );
                            } else if (item.type === 'statement-divider') {
                              return (
                                <StatementSeparatorRow
                                  key={`statement-${item.date}`}
                                  statementDate={item.date}
                                  startDate={item.startDate}
                                  endDate={item.endDate}
                                  transactions={item.transactions}
                                  accountId={account.id}
                                />
                              );
                            }
                            return null;
                          })}
                      </Fragment>
                    );
                  })}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LedgerTable.propTypes = {
  filterValue: PropTypes.string,
  showUncategorizedOnly: PropTypes.bool,
  collapsedGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCollapsedGroups: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.instanceOf(Set),
  onSelectionChange: PropTypes.func,
  selectedYear: PropTypes.string.isRequired,
  rollingDateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
  }),
};
