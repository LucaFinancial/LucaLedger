import { TableCell, TableRow, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';

import { centsToDollars } from '@/utils';

export default function StatementSeparatorRow({
  statementDate,
  periodStart,
  periodEnd,
  transactions,
}) {
  // Calculate charges by status
  const allCharges = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCharges = transactions
    .filter((t) => t.status?.trim() === 'pending')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const scheduledCharges = transactions
    .filter((t) => t.status?.trim() === 'scheduled')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const formatAmount = (amountInCents) => {
    const amountInDollars = centsToDollars(amountInCents);
    return Math.abs(amountInDollars).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date range
  const startDate = format(parseISO(periodStart.replace(/\//g, '-')), 'MMM d');
  const endDate = format(
    parseISO(periodEnd.replace(/\//g, '-')),
    'MMM d, yyyy'
  );
  const dateRange = `${startDate} - ${endDate}`;

  return (
    <TableRow>
      <TableCell
        colSpan={8}
        style={{ backgroundColor: '#f5f5f5', padding: '8px 16px' }}
      >
        <Typography
          component='div'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          <span>
            Statement {statementDate} ({dateRange})
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {pendingCharges > 0 && (
              <span style={{ color: '#cc8800' }}>
                Pending: ${formatAmount(pendingCharges)}
              </span>
            )}
            {scheduledCharges > 0 && (
              <span style={{ color: '#0066cc' }}>
                Scheduled: ${formatAmount(scheduledCharges)}
              </span>
            )}
            <span style={{ color: 'black' }}>${formatAmount(allCharges)}</span>
          </div>
        </Typography>
      </TableCell>
    </TableRow>
  );
}

StatementSeparatorRow.propTypes = {
  statementDate: PropTypes.string.isRequired,
  periodStart: PropTypes.string.isRequired,
  periodEnd: PropTypes.string.isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string,
    })
  ).isRequired,
};
