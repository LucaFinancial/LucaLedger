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

  // Find all statement dividers that should appear in this month
  // A statement divider for statement period X should appear in the month
  // where the statement date falls, regardless of when transactions occur
  const findStatementDividersForMonth = () => {
    if (!statementDay || accountType !== 'Credit Card') {
      return [];
    }

    const dividers = [];
    const currentMonthFormat = dayjs(firstTransaction.date).format('YYYY-MMMM');

    // Go through all transactions and find statement changes
    allTransactions.forEach((transaction, index) => {
      if (index === 0) return;

      const previousTransaction = allTransactions[index - 1];
      const currentStatementMonth = computeStatementMonth(
        transaction,
        statementDay
      );
      const previousStatementMonth = computeStatementMonth(
        previousTransaction,
        statementDay
      );

      if (currentStatementMonth !== previousStatementMonth) {
        // A statement change occurred
        // The divider represents the closing of previousStatementMonth
        // Check if the statement date for previousStatementMonth falls in this calendar month
        const statementDate = dayjs(
          `${statementDay} ${previousStatementMonth}`,
          'D MMMM YYYY'
        );

        if (statementDate.format('YYYY-MMMM') === currentMonthFormat) {
          dividers.push({
            transaction,
            previousTransaction,
            insertBefore: transaction.id,
          });
        }
      }
    });

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
