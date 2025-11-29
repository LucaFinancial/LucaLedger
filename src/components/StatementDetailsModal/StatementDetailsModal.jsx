import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as transactionSelectors } from '@/store/transactions';
import {
  selectors as statementSelectors,
  actions as statementActions,
} from '@/store/statements';
import StatementStatusBadge from '@/components/StatementStatusBadge';

function formatCurrency(cents) {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(dateStr) {
  return format(parseISO(dateStr.replace(/\//g, '-')), 'MMM d, yyyy');
}

export default function StatementDetailsModal({
  open,
  onClose,
  statement,
  onSave,
  onLock,
  onUnlock,
  onDelete,
  readOnly = false,
}) {
  const dispatch = useDispatch();
  const [periodStart, setPeriodStart] = useState(statement?.periodStart || '');
  const [periodEnd, setPeriodEnd] = useState(statement?.periodEnd || '');
  const [total, setTotal] = useState(
    statement ? (statement.total / 100).toFixed(2) : '0.00'
  );
  const [hasChanges, setHasChanges] = useState(false);

  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const issues = useSelector(
    statementSelectors.selectStatementIssues(statement?.id)
  );

  if (!statement) return null;

  const isLocked = statement.status === 'locked';
  const canEdit = !isLocked && !readOnly;

  // Get transactions for this statement
  const statementTransactions = allTransactions.filter((t) =>
    statement.transactionIds.includes(t.id)
  );

  const handleSave = () => {
    if (!canEdit) return;

    // Calculate statementPeriod from periodStart (YYYY-MM format)
    const periodStartDate = parseISO(periodStart.replace(/\//g, '-'));
    const statementPeriod = format(periodStartDate, 'yyyy-MM');

    const updates = {
      periodStart,
      periodEnd,
      statementPeriod,
      total: Math.round(parseFloat(total) * 100),
      isStartDateModified: periodStart !== statement.periodStart,
      isEndDateModified: periodEnd !== statement.periodEnd,
      isTotalModified: Math.round(parseFloat(total) * 100) !== statement.total,
    };

    onSave(statement.id, updates);
    setHasChanges(false);
    onClose();
  };

  const handleFieldChange = (setter) => (value) => {
    setter(value);
    setHasChanges(true);
  };

  const handleLock = () => {
    if (onLock) {
      onLock(statement.id);
    }
  };

  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock(statement.id);
    }
  };

  const handleFixIssue = () => {
    if (!issues) return;

    if (issues.hasDuplicate || issues.hasOverlap || issues.hasGap) {
      const adjacentId =
        issues.duplicateStatement?.id ||
        issues.overlapStatement?.id ||
        issues.gapStatement?.id;
      if (adjacentId) {
        dispatch(statementActions.fixStatementIssue(statement.id, adjacentId));
      }
    }
  };

  const handleRemoveDuplicate = () => {
    if (issues?.duplicateStatements && onDelete) {
      // Delete all duplicate statements
      issues.duplicateStatements.forEach((duplicate) => {
        onDelete(duplicate.id);
      });
      onClose();
    }
  };

  const handleRemoveCurrent = () => {
    if (onDelete) {
      onDelete(statement.id);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>
        <Box
          display='flex'
          alignItems='center'
          gap={2}
        >
          <Typography
            variant='h6'
            component='span'
          >
            Statement Details
          </Typography>
          <StatementStatusBadge status={statement.status} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLocked && (
          <Alert
            severity='info'
            sx={{ mb: 2 }}
            action={
              onUnlock && (
                <Button
                  color='inherit'
                  size='small'
                  onClick={handleUnlock}
                >
                  Unlock
                </Button>
              )
            }
          >
            This statement is locked and cannot be edited.
          </Alert>
        )}

        {issues?.hasDuplicate && (
          <Alert
            severity='error'
            sx={{ mb: 2 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color='inherit'
                  size='small'
                  onClick={handleRemoveDuplicate}
                >
                  Remove Duplicate
                  {issues.duplicateStatements?.length > 1 ? 's' : ''}
                </Button>
                <Button
                  color='inherit'
                  size='small'
                  onClick={handleRemoveCurrent}
                >
                  Remove Current
                </Button>
              </Box>
            }
          >
            <AlertTitle>Duplicate Statement Period</AlertTitle>
            This statement has the same period ({statement.statementPeriod}) as{' '}
            {issues.duplicateStatements?.length || 1} other statement
            {(issues.duplicateStatements?.length || 1) !== 1 ? 's' : ''}. This
            should not happen and duplicates must be removed.
          </Alert>
        )}

        {issues?.hasOverlap && !issues.hasDuplicate && (
          <Alert
            severity='warning'
            sx={{ mb: 2 }}
            action={
              <Button
                color='inherit'
                size='small'
                onClick={handleFixIssue}
              >
                Fix Overlap
              </Button>
            }
          >
            <AlertTitle>Date Overlap Detected</AlertTitle>
            This statement overlaps with another statement by{' '}
            {issues.overlapDays} day{issues.overlapDays !== 1 ? 's' : ''}. Click
            &quot;Fix Overlap&quot; to adjust the adjacent statement.
          </Alert>
        )}

        {issues?.hasGap && !issues.hasDuplicate && !issues.hasOverlap && (
          <Alert
            severity='warning'
            sx={{ mb: 2 }}
            action={
              <Button
                color='inherit'
                size='small'
                onClick={handleFixIssue}
              >
                Fix Gap
              </Button>
            }
          >
            <AlertTitle>Date Gap Detected</AlertTitle>
            There is a {issues.gapDays} day gap between this statement and an
            adjacent statement. Click &quot;Fix Gap&quot; to adjust dates.
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle2'
            gutterBottom
          >
            Statement Period
          </Typography>
          <Box
            display='flex'
            gap={2}
            alignItems='center'
          >
            <TextField
              label='Start Date'
              value={periodStart}
              onChange={(e) =>
                handleFieldChange(setPeriodStart)(e.target.value)
              }
              disabled={!canEdit}
              size='small'
              fullWidth
              helperText='Format: YYYY/MM/DD'
            />
            <Typography>to</Typography>
            <TextField
              label='End Date'
              value={periodEnd}
              onChange={(e) => handleFieldChange(setPeriodEnd)(e.target.value)}
              disabled={!canEdit}
              size='small'
              fullWidth
              helperText='Format: YYYY/MM/DD'
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle2'
            gutterBottom
          >
            Statement Total
          </Typography>
          <TextField
            label='Total Amount'
            value={total}
            onChange={(e) => handleFieldChange(setTotal)(e.target.value)}
            disabled={!canEdit}
            size='small'
            type='number'
            inputProps={{ step: '0.01' }}
            helperText='Enter amount in dollars (e.g., 123.45)'
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant='subtitle2'
            gutterBottom
          >
            Transactions ({statementTransactions.length})
          </Typography>
          {statementTransactions.length === 0 ? (
            <Typography
              variant='body2'
              color='text.secondary'
            >
              No transactions in this period
            </Typography>
          ) : (
            <List
              dense
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {statementTransactions.map((tx, index) => (
                <Box key={tx.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={tx.description || 'No description'}
                      secondary={formatDate(tx.date)}
                    />
                    <Typography
                      variant='body2'
                      color={tx.amount < 0 ? 'error' : 'success'}
                      fontWeight='bold'
                    >
                      {formatCurrency(tx.amount)}
                    </Typography>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Box>

        {(statement.isStartDateModified ||
          statement.isEndDateModified ||
          statement.isTotalModified) && (
          <Alert
            severity='warning'
            sx={{ mt: 2 }}
          >
            This statement has been manually modified.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {canEdit && statement.status !== 'draft' && onLock && (
          <Button
            onClick={handleLock}
            color='error'
            variant='outlined'
          >
            Lock Statement
          </Button>
        )}
        <Box flex={1} />
        <Button onClick={onClose}>{canEdit ? 'Cancel' : 'Close'}</Button>
        {canEdit && (
          <Button
            onClick={handleSave}
            variant='contained'
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

StatementDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  statement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    periodStart: PropTypes.string.isRequired,
    periodEnd: PropTypes.string.isRequired,
    statementPeriod: PropTypes.string,
    transactionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    total: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['draft', 'current', 'past', 'locked']).isRequired,
    isStartDateModified: PropTypes.bool.isRequired,
    isEndDateModified: PropTypes.bool.isRequired,
    isTotalModified: PropTypes.bool.isRequired,
  }),
  onSave: PropTypes.func,
  onLock: PropTypes.func,
  onUnlock: PropTypes.func,
  onDelete: PropTypes.func,
  readOnly: PropTypes.bool,
};
