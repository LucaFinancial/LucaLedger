import { Checkbox, TableCell } from '@mui/material';
import PropTypes from 'prop-types';

export default function SelectionCell({
  transaction,
  isSelected,
  onSelectionChange,
  isVirtual,
}) {
  // Don't show checkbox for virtual transactions
  if (isVirtual) {
    return <TableCell sx={{ width: '48px', paddingLeft: '16px' }} />;
  }

  return (
    <TableCell sx={{ width: '48px', paddingLeft: '16px' }}>
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelectionChange(transaction.id, e.target.checked)}
        size='small'
        sx={{
          color: isSelected ? 'white' : 'inherit',
          '&.Mui-checked': {
            color: isSelected ? 'white' : 'primary.main',
          },
        }}
      />
    </TableCell>
  );
}

SelectionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  isVirtual: PropTypes.bool,
};
