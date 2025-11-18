import LedgerRow from '@/components/LedgerRow';
import {
  constants as accountConstants,
  selectors as accountSelectors,
} from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { Paper, Table, TableBody, TableContainer } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LedgerHeader from './LedgerHeader';
import SeparatorRow from './SeparatorRow';
import StatementSeparatorRow from './StatementSeparatorRow';
import { computeStatementMonth, dateCompareFn } from './utils';

export default function LedgerTable({
  filterValue,
  showUncategorizedOnly,
  collapsedGroups,
  setCollapsedGroups,
  selectedTransactions,
  onSelectionChange,
  selectedYear,
}) {
  const { accountId } = useParams();
  const account = useSelector(accountSelectors.selectAccountById(accountId));
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(accountId)
  );

  const sortedTransactions = useMemo(
    () => [...transactions].sort(dateCompareFn),
    [transactions]
  );

  const transactionsWithBalance = useMemo(() => {
    let currentBalance = 0.0;
    return sortedTransactions.map((transaction) => {
      currentBalance += transaction.amount;
      return { ...transaction, balance: currentBalance };
    }, []);
  }, [sortedTransactions]);

  const filteredTransactions = useMemo(() => {
    // Start with all transactions with balance
    let filtered = transactionsWithBalance;

    // Apply year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(
        (t) => dayjs(t.date).format('YYYY') === selectedYear
      );
    }

    // Apply uncategorized filter
    if (showUncategorizedOnly) {
      filtered = filtered.filter((transaction) => !transaction.categoryId);
    }

    // Apply text filter
    if (filterValue) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          selectedTransactions.has(transaction.id)
      );
    }

    return filtered;
  }, [
    filterValue,
    showUncategorizedOnly,
    transactionsWithBalance,
    selectedTransactions,
    selectedYear,
  ]);

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prevCollapsedGroups) =>
      prevCollapsedGroups.includes(groupId)
        ? prevCollapsedGroups.filter((id) => id !== groupId)
        : [...prevCollapsedGroups, groupId]
    );
  };

  const handleExpandYear = (yearId) => {
    setCollapsedGroups((prevCollapsedGroups) => {
      const monthsInYear = filteredTransactions
        .filter((t) => getYearIdentifier(t.date) === yearId)
        .map((t) => getYearMonthKey(t.date));
      const uniqueMonths = [...new Set(monthsInYear)];
      return prevCollapsedGroups.filter(
        (id) => !uniqueMonths.includes(id) && id !== yearId
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
    return dayjs(date).format('YYYY');
  }, []);

  const getMonthIdentifier = useCallback((date) => {
    return dayjs(date).format('MMMM');
  }, []);

  const getYearMonthKey = useCallback(
    (date) => {
      return `${getYearIdentifier(date)}-${getMonthIdentifier(date)}`;
    },
    [getYearIdentifier, getMonthIdentifier]
  );

  const getPreviousTransaction = (index) => {
    if (index === 0) {
      return null;
    }
    return filteredTransactions[index - 1];
  };

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
    ]
  );

  return (
    <TableContainer
      component={Paper}
      style={{ overflow: 'auto', height: '100%' }}
    >
      <Table stickyHeader>
        <LedgerHeader />
        <TableBody>
          {filteredTransactions.map((transaction, index) => {
            const yearId = getYearIdentifier(transaction.date);
            const monthId = getMonthIdentifier(transaction.date);
            const yearMonthKey = getYearMonthKey(transaction.date);
            const previousTransaction = getPreviousTransaction(index);
            const isNewYear =
              !previousTransaction ||
              getYearIdentifier(previousTransaction.date) !== yearId;
            const isNewMonth =
              !previousTransaction ||
              getMonthIdentifier(previousTransaction.date) !== monthId;

            // Check if statement period changes between previous and current transaction
            const statementDay = account.statementDay || 1;
            const currentStatementMonth =
              account.type === accountConstants.AccountType.CREDIT_CARD
                ? computeStatementMonth(transaction, statementDay)
                : null;
            const previousStatementMonth =
              account.type === accountConstants.AccountType.CREDIT_CARD &&
              previousTransaction
                ? computeStatementMonth(previousTransaction, statementDay)
                : null;
            const isStatementMonthDifferent =
              currentStatementMonth &&
              previousStatementMonth &&
              currentStatementMonth !== previousStatementMonth;

            // Determine which month the statement divider belongs to
            const previousYearId = previousTransaction
              ? getYearIdentifier(previousTransaction.date)
              : null;
            const previousYearMonthKey = previousTransaction
              ? getYearMonthKey(previousTransaction.date)
              : null;

            return (
              <Fragment key={transaction.id}>
                {isNewYear && (
                  <SeparatorRow
                    transaction={transaction}
                    isYear
                    isCollapsed={collapsedGroups.includes(yearId)}
                    onToggleCollapse={() => toggleGroupCollapse(yearId)}
                    onExpandYear={() => handleExpandYear(yearId)}
                    onCollapseYear={() => handleCollapseYear(yearId)}
                    selectedCount={getSelectedCountForGroup(yearId, true)}
                  />
                )}
                {/* Render statement divider BEFORE month separator if it belongs to previous month */}
                {isStatementMonthDifferent &&
                  isNewMonth &&
                  !collapsedGroups.includes(previousYearId) &&
                  !collapsedGroups.includes(previousYearMonthKey) && (
                    <StatementSeparatorRow
                      statementDay={statementDay}
                      transaction={transaction}
                      previousTransaction={previousTransaction}
                      transactions={transactionsWithBalance}
                    />
                  )}
                {isNewMonth && !collapsedGroups.includes(yearId) && (
                  <SeparatorRow
                    transaction={transaction}
                    previousTransaction={previousTransaction}
                    isCollapsed={collapsedGroups.includes(yearMonthKey)}
                    onToggleCollapse={() => toggleGroupCollapse(yearMonthKey)}
                    selectedCount={getSelectedCountForGroup(
                      yearMonthKey,
                      false
                    )}
                  />
                )}
                {!collapsedGroups.includes(yearId) &&
                  !collapsedGroups.includes(yearMonthKey) && (
                    <>
                      {/* Render statement divider within the same month if no month boundary crossing */}
                      {isStatementMonthDifferent &&
                        !isNewMonth &&
                        account.type ===
                          accountConstants.AccountType.CREDIT_CARD && (
                          <StatementSeparatorRow
                            statementDay={statementDay}
                            transaction={transaction}
                            previousTransaction={previousTransaction}
                            transactions={transactionsWithBalance}
                          />
                        )}
                      <LedgerRow
                        key={transaction.id}
                        row={transaction}
                        balance={transaction.balance}
                        isSelected={selectedTransactions.has(transaction.id)}
                        onSelectionChange={onSelectionChange}
                      />
                    </>
                  )}
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
};
