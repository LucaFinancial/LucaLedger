import { Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import LedgerRow from '@/components/LedgerRow';
import SeparatorRow from './SeparatorRow';
import StatementSeparatorRow from './StatementSeparatorRow';
import { computeStatementMonth } from './utils';

export default function MonthGroup({
  transactions,
  isCollapsed,
  onToggleCollapse,
  statementDay,
  accountType,
  allTransactions,
}) {
  if (transactions.length === 0) {
    return null;
  }

  const firstTransaction = transactions[0];
  // Find if there's a statement divider that belongs to this month
  // A statement divider belongs to a month if the statement date falls within that month
  const shouldRenderStatementDivider = () => {
    if (!statementDay || accountType !== 'Credit Card') {
      return false;
    }

    // Check if there's a statement change within or entering this month
    const monthTransactions = transactions;
    if (monthTransactions.length === 0) {
      return false;
    }

    // Get the statement month for the first transaction of this calendar month
    const firstTxStatementMonth = computeStatementMonth(
      monthTransactions[0],
      statementDay
    );

    // Find the previous transaction (from the global list, not just this month)
    const firstTxIndex = allTransactions.findIndex(
      (t) => t.id === monthTransactions[0].id
    );
    const previousTransaction =
      firstTxIndex > 0 ? allTransactions[firstTxIndex - 1] : null;

    if (!previousTransaction) {
      return false;
    }

    const prevStatementMonth = computeStatementMonth(
      previousTransaction,
      statementDay
    );

    // Check if statement month changed
    if (firstTxStatementMonth !== prevStatementMonth) {
      // The statement divider belongs to the month where the statement date falls
      // prevStatementMonth format is "MMMM YYYY", e.g., "January 2024"
      // Extract the month and year from prevStatementMonth
      const statementDate = dayjs(
        `${statementDay} ${prevStatementMonth}`,
        'D MMMM YYYY'
      );

      // Check if this statement date falls in the current calendar month
      const currentMonthDate = dayjs(firstTransaction.date);
      return (
        statementDate.format('YYYY-MMMM') ===
        currentMonthDate.format('YYYY-MMMM')
      );
    }

    return false;
  };

  const shouldShowDivider = shouldRenderStatementDivider();
  const statementDividerData = shouldShowDivider
    ? (() => {
        const firstTxIndex = allTransactions.findIndex(
          (t) => t.id === transactions[0].id
        );
        return {
          transaction: allTransactions[firstTxIndex],
          previousTransaction:
            firstTxIndex > 0 ? allTransactions[firstTxIndex - 1] : null,
        };
      })()
    : null;

  return (
    <Fragment>
      <SeparatorRow
        transaction={firstTransaction}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      {!isCollapsed && (
        <>
          {shouldShowDivider && statementDividerData && (
            <StatementSeparatorRow
              statementDay={statementDay}
              transaction={statementDividerData.transaction}
              previousTransaction={statementDividerData.previousTransaction}
              transactions={allTransactions}
            />
          )}
          {transactions.map((transaction) => {
            // Check if there's a statement divider within the month
            const txIndex = allTransactions.findIndex(
              (t) => t.id === transaction.id
            );
            const previousTransaction =
              txIndex > 0 ? allTransactions[txIndex - 1] : null;

            const shouldRenderInlineStatementDivider = () => {
              if (!statementDay || accountType !== 'Credit Card') {
                return false;
              }
              if (!previousTransaction) {
                return false;
              }

              const currentStatementMonth = computeStatementMonth(
                transaction,
                statementDay
              );
              const previousStatementMonth = computeStatementMonth(
                previousTransaction,
                statementDay
              );

              // Only render if statement month changes AND we stay in the same calendar month
              const sameCalendarMonth =
                dayjs(transaction.date).format('YYYY-MMMM') ===
                dayjs(previousTransaction.date).format('YYYY-MMMM');

              return (
                currentStatementMonth !== previousStatementMonth &&
                sameCalendarMonth
              );
            };

            return (
              <Fragment key={transaction.id}>
                {shouldRenderInlineStatementDivider() && (
                  <StatementSeparatorRow
                    statementDay={statementDay}
                    transaction={transaction}
                    previousTransaction={previousTransaction}
                    transactions={allTransactions}
                  />
                )}
                <LedgerRow
                  row={transaction}
                  balance={transaction.balance}
                />
              </Fragment>
            );
          })}
        </>
      )}
    </Fragment>
  );
}

MonthGroup.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      balance: PropTypes.number.isRequired,
    })
  ).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  statementDay: PropTypes.number,
  accountType: PropTypes.string.isRequired,
  allTransactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      balance: PropTypes.number.isRequired,
    })
  ).isRequired,
};
