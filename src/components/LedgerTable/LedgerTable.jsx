import LedgerRow from '@/components/LedgerRow';
import { constants, selectors } from '@/store/accounts';
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
  collapsedGroups,
  setCollapsedGroups,
}) {
  const { accountId } = useParams();
  const account = useSelector(selectors.selectAccountById(accountId));
  const { transactions } = account;

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
    if (!filterValue) {
      return transactionsWithBalance;
    }
    return transactionsWithBalance.filter((transaction) =>
      transaction.description.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [filterValue, transactionsWithBalance]);

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

  return (
    <TableContainer
      component={Paper}
      style={{ overflow: 'auto', height: 'calc(100vh - 330px)' }}
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
              account.type === constants.AccountType.CREDIT_CARD
                ? computeStatementMonth(transaction, statementDay)
                : null;
            const previousStatementMonth =
              account.type === constants.AccountType.CREDIT_CARD &&
              previousTransaction
                ? computeStatementMonth(previousTransaction, statementDay)
                : null;
            const isStatementMonthDifferent =
              currentStatementMonth &&
              previousStatementMonth &&
              currentStatementMonth !== previousStatementMonth;

            // Determine which calendar month the statement divider belongs to
            // Extract the month/year from previousStatementMonth string
            const statementMonthDate = previousStatementMonth
              ? dayjs(previousStatementMonth, 'MMMM YYYY')
              : null;
            const statementMonthKey = statementMonthDate
              ? `${statementMonthDate.format(
                  'YYYY'
                )}-${statementMonthDate.format('MMMM')}`
              : null;
            const statementYearId = statementMonthDate
              ? statementMonthDate.format('YYYY')
              : null;

            // Check if we should render a divider for previousStatementMonth
            const currentCalendarMonth = dayjs(transaction.date).format(
              'MMMM YYYY'
            );
            const previousStatementBelongsToCurrentMonth =
              isStatementMonthDifferent &&
              isNewMonth &&
              previousStatementMonth === currentCalendarMonth;

            // Check if we should render a divider for currentStatementMonth
            // This happens when the current transaction's statement period matches the calendar month
            const currentStatementBelongsToCurrentMonth =
              isStatementMonthDifferent &&
              isNewMonth &&
              currentStatementMonth === currentCalendarMonth;

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
                  />
                )}
                {isNewMonth && !collapsedGroups.includes(yearId) && (
                  <SeparatorRow
                    transaction={transaction}
                    previousTransaction={previousTransaction}
                    isCollapsed={collapsedGroups.includes(yearMonthKey)}
                    onToggleCollapse={() => toggleGroupCollapse(yearMonthKey)}
                  />
                )}
                {/* Render statement divider AFTER month separator if previousStatementMonth belongs to current month */}
                {previousStatementBelongsToCurrentMonth &&
                  !collapsedGroups.includes(statementYearId) &&
                  !collapsedGroups.includes(statementMonthKey) &&
                  account.type === constants.AccountType.CREDIT_CARD && (
                    <StatementSeparatorRow
                      statementDay={statementDay}
                      transaction={transaction}
                      previousTransaction={previousTransaction}
                      transactions={transactionsWithBalance}
                    />
                  )}
                {/* Render statement divider for currentStatementMonth if it matches current calendar month */}
                {currentStatementBelongsToCurrentMonth &&
                  !collapsedGroups.includes(yearId) &&
                  !collapsedGroups.includes(yearMonthKey) &&
                  account.type === constants.AccountType.CREDIT_CARD && (
                    <StatementSeparatorRow
                      statementDay={statementDay}
                      transaction={transaction}
                      previousTransaction={{
                        ...transaction,
                        date: dayjs(transaction.date)
                          .date(statementDay - 1)
                          .format('YYYY-MM-DD'),
                      }}
                      transactions={transactionsWithBalance}
                    />
                  )}
                {!collapsedGroups.includes(yearId) &&
                  !collapsedGroups.includes(yearMonthKey) && (
                    <>
                      {/* Render statement divider within the same month if no month boundary crossing */}
                      {isStatementMonthDifferent &&
                        !isNewMonth &&
                        account.type === constants.AccountType.CREDIT_CARD && (
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
  collapsedGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCollapsedGroups: PropTypes.func.isRequired,
};
