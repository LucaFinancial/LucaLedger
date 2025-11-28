import {
  TableCell,
  TableRow,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { Visibility, Lock } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { centsToDollars } from '@/utils';
import StatementStatusBadge from '@/components/StatementStatusBadge';
import StatementDetailsModal from '@/components/StatementDetailsModal';
import {
  selectors as statementSelectors,
  actions as statementActions,
} from '@/store/statements';

export default function StatementSeparatorRow({
  statementDate,
  periodStart,
  periodEnd,
  transactions,
  accountId,
}) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  // Convert date format from YYYY-MM-DD to YYYY/MM/DD for matching with Redux
  const closingDateWithSlashes = statementDate.replace(/-/g, '/');

  // Find the actual statement from Redux
  const statement = useSelector(
    statementSelectors.selectStatementByAccountIdAndClosingDate(
      accountId,
      closingDateWithSlashes
    )
  );

  // Debug logging
  console.log('StatementSeparatorRow:', {
    accountId,
    statementDate,
    closingDateWithSlashes,
    statement,
  });

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

  const handleView = () => {
    setModalOpen(true);
  };

  const handleLock = () => {
    if (statement) {
      dispatch(statementActions.lockStatement(statement.id));
    }
  };

  const handleSave = (statementId, updates) => {
    dispatch(statementActions.updateStatementProperty(statementId, updates));
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell
          colSpan={8}
          style={{ backgroundColor: '#f5f5f5', padding: '8px 16px' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                component='span'
                sx={{ fontWeight: 'bold' }}
              >
                Statement {statementDate} ({dateRange})
              </Typography>
              {statement && <StatementStatusBadge status={statement.status} />}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {pendingCharges > 0 && (
                <Typography
                  component='span'
                  sx={{ color: '#cc8800' }}
                >
                  Pending: ${formatAmount(pendingCharges)}
                </Typography>
              )}
              {scheduledCharges > 0 && (
                <Typography
                  component='span'
                  sx={{ color: '#0066cc' }}
                >
                  Scheduled: ${formatAmount(scheduledCharges)}
                </Typography>
              )}
              <Typography
                component='span'
                sx={{ color: 'black', fontWeight: 'bold' }}
              >
                ${formatAmount(allCharges)}
              </Typography>

              {statement && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size='small'
                    onClick={handleView}
                    title='View Statement Details'
                  >
                    <Visibility fontSize='small' />
                  </IconButton>
                  {statement.status !== 'locked' &&
                    statement.status !== 'draft' && (
                      <IconButton
                        size='small'
                        onClick={handleLock}
                        title='Lock Statement'
                        color='error'
                      >
                        <Lock fontSize='small' />
                      </IconButton>
                    )}
                </Box>
              )}
            </Box>
          </Box>
        </TableCell>
      </TableRow>

      {statement && (
        <StatementDetailsModal
          open={modalOpen}
          onClose={handleModalClose}
          statement={statement}
          onSave={handleSave}
          onLock={handleLock}
          readOnly={statement.status === 'locked'}
        />
      )}
    </>
  );
}

StatementSeparatorRow.propTypes = {
  statementDate: PropTypes.string.isRequired,
  periodStart: PropTypes.string.isRequired,
  periodEnd: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
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
