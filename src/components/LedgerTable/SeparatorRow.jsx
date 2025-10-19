import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
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
}) {
  const date = dayjs(transaction.date);
  const format = isYear ? 'YYYY' : 'MMMM YYYY';

  if (
    previousTransaction &&
    (isYear
      ? dayjs(transaction.date).year() ===
        dayjs(previousTransaction.date).year()
      : dayjs(transaction.date).format('MMYYYY') ===
        dayjs(previousTransaction.date).format('MMYYYY'))
  ) {
    return null;
  }

  return (
    <TableRow
      sx={{
        '& td': {
          borderBottom: 'unset',
          bgcolor: isYear ? 'grey.200' : 'grey.100',
          py: isYear ? 0.5 : 1,
          px: 2,
        },
      }}
    >
      <TableCell
        colSpan={7}
        sx={{
          backgroundColor: isYear ? '#f5f5f5' : '#fafafa',
          fontWeight: isYear ? 'bold' : 'normal',
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
          {date.format(format)}
          {selectedCount > 0 && (
            <span style={{ marginLeft: '8px', color: '#1976d2' }}>
              ({selectedCount} selected)
            </span>
          )}
          {isYear && onExpandYear && onCollapseYear && (
            <YearControls
              yearId={date.format('YYYY')}
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
};

SeparatorRow.defaultProps = {
  isYear: false,
  selectedCount: 0,
};
