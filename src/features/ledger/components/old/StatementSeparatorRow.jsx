import { TableCell, TableRow, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { computeStatementMonth } from './utils';

export default function StatementSeparatorRow({
  statementDay,
  transaction,
  previousTransaction,
}) {
  if (!previousTransaction) {
    return null;
  }

  const currentStatementMonth = computeStatementMonth(
    transaction,
    statementDay
  );
  const previousStatementMonth = computeStatementMonth(
    previousTransaction,
    statementDay
  );
  const isStatementMonthDifferent =
    currentStatementMonth !== previousStatementMonth;

  const statementDate = dayjs(
    `${statementDay} ${previousStatementMonth}`,
    'D MMMM YYYY'
  ).format('MMMM DD YYYY');

  return (
    isStatementMonthDifferent && (
      <TableRow>
        <TableCell colSpan={6}>
          <Typography>Statement {statementDate}</Typography>
        </TableCell>
      </TableRow>
    )
  );
}

StatementSeparatorRow.propTypes = {
  statementDay: PropTypes.number.isRequired,
  transaction: PropTypes.shape({
    date: PropTypes.string.isRequired,
  }).isRequired,
  previousTransaction: PropTypes.shape({
    date: PropTypes.string.isRequired,
  }),
};
