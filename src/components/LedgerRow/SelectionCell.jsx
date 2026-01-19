import { Checkbox, TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function SelectionCell({
  transaction,
  isSelected,
  onSelectionChange,
  isVirtual,
}) {
  // Don't show checkbox for virtual transactions
  if (isVirtual) {
    return <TableCell sx={LEDGER_COLUMN_STYLES.selection} />;
  }

  return (
    <TableCell sx={LEDGER_COLUMN_STYLES.selection}>
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelectionChange(transaction.id, e.target.checked)}
        size='small'
        sx={{
          padding: '0px',
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
