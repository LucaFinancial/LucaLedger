import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import {
  IconButton,
  TableCell,
  TableRow,
  Box,
  Typography,
} from '@mui/material';
import { format, getYear, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import YearControls from './YearControls';
import { centsToDollars } from '@/utils';

export default function SeparatorRow({
  transaction,
  previousTransaction,
  isYear,
  isCollapsed,
  onToggleCollapse,
  onExpandYear,
  onCollapseYear,
  selectedCount,
  statementInfo,
}) {
  const date = parseISO(transaction.date.replace(/\//g, '-'));
  const formatStr = isYear ? 'yyyy' : 'MMMM yyyy';

  if (
    previousTransaction &&
    (isYear
      ? getYear(parseISO(transaction.date.replace(/\//g, '-'))) ===
        getYear(parseISO(previousTransaction.date.replace(/\//g, '-')))
      : format(parseISO(transaction.date.replace(/\//g, '-')), 'MMyyyy') ===
        format(
          parseISO(previousTransaction.date.replace(/\//g, '-')),
          'MMyyyy'
        ))
  ) {
    return null;
  }

  const formatAmount = (amountInCents) => {
    const amountInDollars = centsToDollars(amountInCents);
    return Math.abs(amountInDollars).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <TableRow
      sx={{
        '& td': {
          borderBottom: 'unset',
          bgcolor: isYear ? 'grey.50' : 'background.paper',
          py: isYear ? 1 : 0.75,
          px: 2,
          fontWeight: isYear ? 600 : 500,
        },
        '&:hover': {
          '& td': {
            bgcolor: isYear ? 'grey.100' : 'grey.50',
          },
        },
      }}
    >
      <TableCell
        colSpan={8}
        sx={{
          paddingLeft: isYear ? '16px' : '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconButton
              size='small'
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <KeyboardArrowRight fontSize='small' />
              ) : (
                <KeyboardArrowDown fontSize='small' />
              )}
            </IconButton>
            {format(date, formatStr)}
            {selectedCount > 0 && (
              <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                ({selectedCount} selected)
              </span>
            )}
            {isYear && onExpandYear && onCollapseYear && (
              <YearControls
                yearId={format(date, 'yyyy')}
                onExpandYear={onExpandYear}
                onCollapseYear={onCollapseYear}
              />
            )}
          </div>
          {statementInfo && !isYear && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {statementInfo.pendingCharges > 0 && (
                <Typography
                  component='span'
                  sx={{ color: '#cc8800', fontSize: '0.9em' }}
                >
                  Pending: ${formatAmount(statementInfo.pendingCharges)}
                </Typography>
              )}
              {statementInfo.scheduledCharges > 0 && (
                <Typography
                  component='span'
                  sx={{ color: '#0066cc', fontSize: '0.9em' }}
                >
                  Scheduled: ${formatAmount(statementInfo.scheduledCharges)}
                </Typography>
              )}
              <Typography
                component='span'
                sx={{ color: 'black', fontWeight: 'bold', fontSize: '0.9em' }}
              >
                ${formatAmount(statementInfo.total)}
              </Typography>
            </Box>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

SeparatorRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  previousTransaction: PropTypes.object,
  isYear: PropTypes.bool,
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onExpandYear: PropTypes.func,
  onCollapseYear: PropTypes.func,
  selectedCount: PropTypes.number,
  statementInfo: PropTypes.shape({
    pendingCharges: PropTypes.number,
    scheduledCharges: PropTypes.number,
    total: PropTypes.number,
  }),
};

SeparatorRow.defaultProps = {
  isYear: false,
};
