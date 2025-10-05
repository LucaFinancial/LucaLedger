import { Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import LedgerRow from '@/components/LedgerRow';
import SeparatorRow from './SeparatorRow';
import StatementSeparatorRow from './StatementSeparatorRow';

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

  // Find all statement dividers that should appear in this month
  // A statement divider for statement period X should appear in the month
  // where the statement date falls, regardless of when transactions occur
  const findStatementDividersForMonth = () => {
    if (!statementDay || accountType !== 'Credit Card') {
      return [];
    }

    const dividers = [];
    const currentMonthFormat = dayjs(firstTransaction.date).format('YYYY-MMMM');
    const currentMonthDate = dayjs(firstTransaction.date);

    // Check if the statement date for this month falls within this month
    const statementDateThisMonth = dayjs(
      `${statementDay} ${currentMonthDate.format('MMMM YYYY')}`,
      'D MMMM YYYY'
    );

    if (statementDateThisMonth.format('YYYY-MMMM') === currentMonthFormat) {
      // Find the first transaction on or after the statement date
      const firstTransactionAfterStatement = allTransactions.find((t) => {
        const tDate = dayjs(t.date);
        return tDate.isSameOrAfter(statementDateThisMonth, 'day');
      });

      if (firstTransactionAfterStatement) {
        // Find the transaction immediately before the statement date
        const indexOfFirstAfter = allTransactions.findIndex(
          (t) => t.id === firstTransactionAfterStatement.id
        );
        const previousTransaction =
          indexOfFirstAfter > 0 ? allTransactions[indexOfFirstAfter - 1] : null;

        // Check if the first transaction after statement is in the current month
        const transactionInCurrentMonth = transactions.some(
          (t) => t.id === firstTransactionAfterStatement.id
        );

        dividers.push({
          transaction: firstTransactionAfterStatement,
          previousTransaction,
          // If transaction is in this month, insert before it
          // Otherwise, insert at the end (after all transactions in this month)
          insertBefore: transactionInCurrentMonth
            ? firstTransactionAfterStatement.id
            : null,
        });
      } else {
        // No transactions after the statement date
        // Place divider at the end with the last transaction as context
        const lastTransaction = allTransactions[allTransactions.length - 1];
        const secondToLastTransaction =
          allTransactions.length > 1
            ? allTransactions[allTransactions.length - 2]
            : null;

        dividers.push({
          transaction: lastTransaction,
          previousTransaction: secondToLastTransaction,
          insertBefore: null, // Place at the end
        });
      }
    }

    return dividers;
  };

  const statementDividers = findStatementDividersForMonth();

  return (
    <Fragment>
      <SeparatorRow
        transaction={firstTransaction}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      {!isCollapsed && (
        <>
          {transactions.map((transaction) => {
            // Find if there's a statement divider to render before this transaction
            const dividerBeforeThis = statementDividers.find(
              (d) => d.insertBefore === transaction.id
            );

            return (
              <Fragment key={transaction.id}>
                {dividerBeforeThis && (
                  <StatementSeparatorRow
                    statementDay={statementDay}
                    transaction={dividerBeforeThis.transaction}
                    previousTransaction={dividerBeforeThis.previousTransaction}
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
          {/* Render dividers that should appear at the end of the month */}
          {statementDividers
            .filter((d) => d.insertBefore === null)
            .map((divider, index) => (
              <StatementSeparatorRow
                key={`end-divider-${index}`}
                statementDay={statementDay}
                transaction={divider.transaction}
                previousTransaction={divider.previousTransaction}
                transactions={allTransactions}
              />
            ))}
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
