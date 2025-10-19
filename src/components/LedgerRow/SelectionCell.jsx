import { Checkbox, TableCell } from '@mui/material';
import PropTypes from 'prop-types';

export default function SelectionCell({
  transaction,
  isSelected,
  onSelectionChange,
}) {
  return (
    <TableCell sx={{ width: '48px', paddingLeft: '16px' }}>
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelectionChange(transaction.id, e.target.checked)}
        size='small'
      />
    </TableCell>
  );
}

SelectionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelectionChange: PropTypes.func,
};
