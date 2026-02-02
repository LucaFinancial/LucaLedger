import {
  TableCell,
  TableRow,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import {
  Visibility,
  Lock,
  LockOpen,
  Add,
  Warning,
  Error,
  Sync,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { centsToDollars } from '@/utils';
import StatementStatusBadge from '@/components/StatementStatusBadge';
import StatementDetailsModal from '@/components/StatementDetailsModal';
import {
  selectors as statementSelectors,
  actions as statementActions,
} from '@/store/statements';
import { LEDGER_COLUMN_COUNT } from './ledgerColumnConfig';

export default function StatementSeparatorRow({
  statementDate,
  startDate,
  endDate,
  transactions,
  accountId,
}) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  // Convert date format from YYYY-MM-DD to YYYY/MM/DD for matching with Redux
  const statementEndDate = statementDate;

  // Find the actual statement from Redux
  const statement = useSelector(
    statementSelectors.selectStatementByAccountIdAndEndDate(
      accountId,
      statementEndDate,
    ),
  );

  // Get issue information for this statement
  const issues = useSelector(
    statement
      ? statementSelectors.selectStatementIssues(statement.id)
      : () => null,
  );

  // Get statement with both stored and calculated values
  const statementDataSelector = useMemo(() => {
    if (!statement) {
      return () => ({
        stored: null,
        calculated: {
          startingBalance: 0,
          endingBalance: 0,
          totalCharges: 0,
          totalPayments: 0,
          total: 0,
        },
        isOutOfSync: false,
      });
    }
    return statementSelectors.selectStatementWithCalculations(statement.id);
  }, [statement]);

  const statementData = useSelector(statementDataSelector);
  const { stored, isOutOfSync } = statementData;

  // For pending/scheduled display, calculate from passed transactions
  const pendingCharges = transactions
    .filter((t) => t.transactionState?.trim() === 'PENDING')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const scheduledCharges = transactions
    .filter((t) => t.transactionState?.trim() === 'SCHEDULED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Display the stored ending balance
  // For draft periods without a statement: fall back to inline calculation from transactions
  const displayTotal = stored
    ? stored.endingBalance
    : transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Compute status for display - handles both existing statements and missing statements
  const computedStatus = (() => {
    if (statement) {
      // Use computed status from selector if available, otherwise compute it
      return (
        statement.status ||
        (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = parseISO(statement.startDate.replace(/\//g, '-'));
          start.setHours(0, 0, 0, 0);
          const end = parseISO(statement.endDate.replace(/\//g, '-'));
          end.setHours(0, 0, 0, 0);
          if (isBefore(today, start)) return 'draft';
          if (isAfter(today, end)) return 'past';
          return 'current';
        })()
      );
    } else {
      // No statement exists - compute status based on the period dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = parseISO(startDate.replace(/\//g, '-'));
      start.setHours(0, 0, 0, 0);
      const end = parseISO(endDate.replace(/\//g, '-'));
      end.setHours(0, 0, 0, 0);
      if (isBefore(today, start)) return 'draft';
      if (isAfter(today, end)) return 'past';
      return 'current';
    }
  })();

  const formatAmount = (amountInCents) => {
    const amountInDollars = centsToDollars(amountInCents);
    return Math.abs(amountInDollars).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date range - use statement dates if available, otherwise use calculated dates
  const displayPeriodStart = statement?.startDate || startDate;
  const displayPeriodEnd = statement?.endDate || endDate;

  const formattedStartDate = format(
    parseISO(displayPeriodStart.replace(/\//g, '-')),
    'MMM d',
  );
  const formattedEndDate = format(
    parseISO(displayPeriodEnd.replace(/\//g, '-')),
    'MMM d, yyyy',
  );
  const dateRange = `${formattedStartDate} - ${formattedEndDate}`;

  const handleView = () => {
    setModalOpen(true);
  };

  const handleLock = () => {
    if (statement) {
      dispatch(statementActions.lockStatement(statement.id));
    }
  };

  const handleUnlock = () => {
    if (statement) {
      dispatch(statementActions.unlockStatement(statement.id));
    }
  };

  const handleSync = () => {
    if (statement) {
      dispatch(statementActions.syncStatement(statement.id));
    }
  };

  const handleSave = (statementId, updates) => {
    dispatch(statementActions.updateStatementProperty(statementId, updates));
  };

  const handleDelete = (statementId) => {
    dispatch(statementActions.deleteStatement(statementId));
    setModalOpen(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleCreateStatement = () => {
    // Create a new statement for this period
    // Note: status is computed dynamically, not stored
    dispatch(
      statementActions.createNewStatement({
        accountId,
        startDate,
        endDate,
      }),
    );
  };

  return (
    <>
      <TableRow>
        <TableCell
          colSpan={LEDGER_COLUMN_COUNT}
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
              <Typography component='span' sx={{ fontWeight: 'bold' }}>
                Statement {statementDate} ({dateRange})
              </Typography>
              <StatementStatusBadge
                status={computedStatus}
                isLocked={statement?.isLocked}
              />
              {issues?.hasDuplicate && (
                <Tooltip title='Duplicate statement period detected'>
                  <Chip
                    icon={<Error />}
                    label='Duplicate'
                    size='small'
                    color='error'
                  />
                </Tooltip>
              )}
              {issues?.hasOverlap && !issues.hasDuplicate && (
                <Tooltip
                  title={`Overlaps by ${issues.overlapDays} day${
                    issues.overlapDays !== 1 ? 's' : ''
                  }`}
                >
                  <Chip
                    icon={<Warning />}
                    label='Overlap'
                    size='small'
                    color='warning'
                  />
                </Tooltip>
              )}
              {issues?.hasGap && !issues.hasDuplicate && !issues.hasOverlap && (
                <Tooltip title={`${issues.gapDays} day gap`}>
                  <Chip
                    icon={<Warning />}
                    label='Gap'
                    size='small'
                    color='warning'
                  />
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {pendingCharges > 0 && (
                <Typography component='span' sx={{ color: '#cc8800' }}>
                  Pending: ${formatAmount(pendingCharges)}
                </Typography>
              )}
              {scheduledCharges > 0 && (
                <Typography component='span' sx={{ color: '#0066cc' }}>
                  Scheduled: ${formatAmount(scheduledCharges)}
                </Typography>
              )}
              <Typography
                component='span'
                sx={{ color: 'black', fontWeight: 'bold' }}
              >
                ${formatAmount(displayTotal)}
              </Typography>

              {statement ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {isOutOfSync && (
                    <Tooltip title='Statement data is out of sync with transactions. Click to sync.'>
                      <IconButton
                        size='small'
                        onClick={handleSync}
                        color='warning'
                        title='Sync Statement'
                      >
                        <Sync fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size='small'
                    onClick={handleView}
                    title='View Statement Details'
                  >
                    <Visibility fontSize='small' />
                  </IconButton>
                  {computedStatus === 'past' && (
                    <IconButton
                      size='small'
                      onClick={statement.isLocked ? handleUnlock : handleLock}
                      title={
                        statement.isLocked
                          ? 'Unlock Statement'
                          : 'Lock Statement'
                      }
                      color={statement.isLocked ? 'default' : 'error'}
                    >
                      {statement.isLocked ? (
                        <Lock fontSize='small' />
                      ) : (
                        <LockOpen fontSize='small' />
                      )}
                    </IconButton>
                  )}
                </Box>
              ) : (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<Add />}
                  onClick={handleCreateStatement}
                >
                  Create Statement
                </Button>
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
          onUnlock={handleUnlock}
          onDelete={handleDelete}
          readOnly={statement.isLocked}
        />
      )}
    </>
  );
}

StatementSeparatorRow.propTypes = {
  statementDate: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string,
    }),
  ).isRequired,
};
