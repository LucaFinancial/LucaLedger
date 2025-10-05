import { selectors } from '@/store/accounts';
import { Paper, Table, TableBody, TableContainer } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LedgerHeader from './LedgerHeader';
import SeparatorRow from './SeparatorRow';
import MonthGroup from './MonthGroup';
import { dateCompareFn } from './utils';

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

  // Group transactions by year and month
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((transaction) => {
      const yearId = getYearIdentifier(transaction.date);
      const yearMonthKey = getYearMonthKey(transaction.date);

      if (!groups[yearId]) {
        groups[yearId] = {};
      }
      if (!groups[yearId][yearMonthKey]) {
        groups[yearId][yearMonthKey] = [];
      }
      groups[yearId][yearMonthKey].push(transaction);
    });
    return groups;
  }, [filteredTransactions, getYearIdentifier, getYearMonthKey]);

  return (
    <TableContainer
      component={Paper}
      style={{ overflow: 'auto', height: 'calc(100vh - 330px)' }}
    >
      <Table stickyHeader>
        <LedgerHeader />
        <TableBody>
          {Object.keys(groupedTransactions)
            .sort((a, b) => (dayjs(b).isAfter(dayjs(a)) ? 1 : -1))
            .map((yearId) => {
              const yearMonths = groupedTransactions[yearId];
              const yearMonthKeys = Object.keys(yearMonths).sort((a, b) => {
                const dateA = dayjs(yearMonths[a][0].date);
                const dateB = dayjs(yearMonths[b][0].date);
                return dateB.isAfter(dateA) ? 1 : -1;
              });

              const firstMonthKey = yearMonthKeys[0];
              const firstTransaction = yearMonths[firstMonthKey][0];

              return (
                <Fragment key={yearId}>
                  <SeparatorRow
                    transaction={firstTransaction}
                    isYear
                    isCollapsed={collapsedGroups.includes(yearId)}
                    onToggleCollapse={() => toggleGroupCollapse(yearId)}
                    onExpandYear={() => handleExpandYear(yearId)}
                    onCollapseYear={() => handleCollapseYear(yearId)}
                  />
                  {!collapsedGroups.includes(yearId) &&
                    yearMonthKeys.map((monthKey) => (
                      <MonthGroup
                        key={monthKey}
                        transactions={yearMonths[monthKey]}
                        isCollapsed={collapsedGroups.includes(monthKey)}
                        onToggleCollapse={() => toggleGroupCollapse(monthKey)}
                        statementDay={account.statementDay || 1}
                        accountType={account.type}
                        allTransactions={filteredTransactions}
                      />
                    ))}
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
