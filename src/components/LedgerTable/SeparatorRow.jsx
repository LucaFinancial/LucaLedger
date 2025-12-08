import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { format, getYear, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import YearControls from './YearControls';

export default function SeparatorRow({
  transaction,
  previousTransaction,
  isYear,
  isCollapsed,
  onToggleCollapse,
  onExpandYear,
  onCollapseYear,
  selectedCount,
  monthKey,
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

  return (
    <TableRow
      data-month-key={monthKey}
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
  monthKey: PropTypes.string,
};

SeparatorRow.defaultProps = {
  isYear: false,
};
