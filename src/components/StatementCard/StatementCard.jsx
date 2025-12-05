import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Lock,
  LockOpen,
  Visibility,
  Warning,
  Error,
  Sync,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import StatementStatusBadge from '@/components/StatementStatusBadge';
import { selectors as statementSelectors } from '@/store/statements';

function formatCurrency(cents) {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `-$${formatted}` : `$${formatted}`;
}

export default function StatementCard({
  statement,
  onView,
  onLock,
  compact = false,
}) {
  const issues = useSelector(
    statementSelectors.selectStatementIssues(statement.id)
  );

  // Get statement with both stored and calculated values
  const statementDataSelector = useMemo(
    () => statementSelectors.selectStatementWithCalculations(statement.id),
    [statement.id]
  );
  const statementData = useSelector(statementDataSelector);
  const { stored, isOutOfSync } = statementData;

  // Display stored values
  const { startingBalance, endingBalance, totalCharges, totalPayments } =
    stored || {};
  const summaryText = [
    `Start ${formatCurrency(startingBalance || 0)}`,
    `+${formatCurrency(totalCharges || 0)} charges`,
    `-${formatCurrency(totalPayments || 0)} payments`,
  ].join(' · ');

  const periodStartFormatted = format(
    parseISO(statement.periodStart.replace(/\//g, '-')),
    'MMM d, yyyy'
  );
  const periodEndFormatted = format(
    parseISO(statement.periodEnd.replace(/\//g, '-')),
    'MMM d, yyyy'
  );

  // Format statement period as "Month YYYY" (e.g., "November 2025")
  const statementPeriodFormatted = statement.statementPeriod
    ? format(parseISO(`${statement.statementPeriod}-01`), 'MMMM yyyy')
    : null;

  return (
    <Card
      variant='outlined'
      sx={{
        mb: compact ? 1 : 2,
        borderLeft: 4,
        borderLeftColor:
          statement.status === 'current'
            ? 'primary.main'
            : statement.status === 'locked'
            ? 'error.main'
            : 'grey.300',
      }}
    >
      <CardContent sx={{ py: compact ? 1 : 2, '&:last-child': { pb: 1.5 } }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
        >
          <Box flex={1}>
            <Box
              display='flex'
              alignItems='center'
              gap={1}
              mb={0.5}
            >
              <Box>
                <Typography
                  variant={compact ? 'body2' : 'h6'}
                  fontWeight='bold'
                >
                  {statementPeriodFormatted ||
                    `${periodStartFormatted} - ${periodEndFormatted}`}
                </Typography>
                {statementPeriodFormatted && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    {periodStartFormatted} - {periodEndFormatted}
                  </Typography>
                )}
              </Box>
              <StatementStatusBadge
                status={statement.status}
                size={compact ? 'small' : 'medium'}
              />
              {isOutOfSync && statement.status === 'locked' && (
                <Tooltip title='Statement data is out of sync with transactions'>
                  <Chip
                    icon={<Sync />}
                    label='Out of Sync'
                    size='small'
                    color='warning'
                    aria-label='Statement is out of sync with current transaction data'
                  />
                </Tooltip>
              )}
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
                  title={`Overlaps with another statement by ${
                    issues.overlapDays
                  } day${issues.overlapDays !== 1 ? 's' : ''}`}
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
                <Tooltip
                  title={`${issues.gapDays} day gap with adjacent statement`}
                >
                  <Chip
                    icon={<Warning />}
                    label='Gap'
                    size='small'
                    color='warning'
                  />
                </Tooltip>
              )}
            </Box>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mb: compact ? 0.5 : 1 }}
            >
              {statement.transactionIds.length} transaction
              {statement.transactionIds.length !== 1 ? 's' : ''}
            </Typography>

            <Typography
              variant={compact ? 'body1' : 'h6'}
              fontWeight='bold'
            >
              Ending Balance: {formatCurrency(endingBalance)}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 0.5 }}
            >
              {summaryText}
            </Typography>

            {(statement.isStartDateModified || statement.isEndDateModified) && (
              <Typography
                variant='caption'
                color='warning.main'
                sx={{ mt: 0.5, display: 'block' }}
              >
                ⚠️ Manually modified
              </Typography>
            )}
          </Box>

          <Box
            display='flex'
            gap={0.5}
          >
            {onView && (
              <Tooltip title='View Details'>
                <IconButton
                  size='small'
                  onClick={() => onView(statement)}
                >
                  <Visibility fontSize='small' />
                </IconButton>
              </Tooltip>
            )}

            {onLock && statement.status === 'past' && (
              <Tooltip title='Lock Statement'>
                <IconButton
                  size='small'
                  onClick={() => onLock(statement)}
                  color='error'
                >
                  <LockOpen fontSize='small' />
                </IconButton>
              </Tooltip>
            )}

            {statement.status === 'locked' && (
              <Tooltip title='Locked'>
                <IconButton
                  size='small'
                  disabled
                >
                  <Lock fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

StatementCard.propTypes = {
  statement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    periodStart: PropTypes.string.isRequired,
    periodEnd: PropTypes.string.isRequired,
    transactionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    startingBalance: PropTypes.number,
    endingBalance: PropTypes.number,
    totalCharges: PropTypes.number,
    totalPayments: PropTypes.number,
    status: PropTypes.oneOf(['draft', 'current', 'past', 'locked']).isRequired,
    isStartDateModified: PropTypes.bool.isRequired,
    isEndDateModified: PropTypes.bool.isRequired,
    isTotalModified: PropTypes.bool,
    statementPeriod: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onLock: PropTypes.func,
  compact: PropTypes.bool,
};
