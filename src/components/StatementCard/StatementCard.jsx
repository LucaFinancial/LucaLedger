import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Lock, LockOpen, Visibility } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import StatementStatusBadge from '@/components/StatementStatusBadge';

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
  const periodStartFormatted = format(
    parseISO(statement.periodStart.replace(/\//g, '-')),
    'MMM d, yyyy'
  );
  const periodEndFormatted = format(
    parseISO(statement.periodEnd.replace(/\//g, '-')),
    'MMM d, yyyy'
  );

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
              <Typography
                variant={compact ? 'body2' : 'h6'}
                fontWeight='bold'
              >
                {periodStartFormatted} - {periodEndFormatted}
              </Typography>
              <StatementStatusBadge
                status={statement.status}
                size={compact ? 'small' : 'medium'}
              />
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
              color={statement.total < 0 ? 'error.main' : 'success.main'}
              fontWeight='bold'
            >
              Total: {formatCurrency(statement.total)}
            </Typography>

            {(statement.isStartDateModified ||
              statement.isEndDateModified ||
              statement.isTotalModified) && (
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
    total: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['draft', 'current', 'past', 'locked']).isRequired,
    isStartDateModified: PropTypes.bool.isRequired,
    isEndDateModified: PropTypes.bool.isRequired,
    isTotalModified: PropTypes.bool.isRequired,
  }).isRequired,
  onView: PropTypes.func,
  onLock: PropTypes.func,
  compact: PropTypes.bool,
};
