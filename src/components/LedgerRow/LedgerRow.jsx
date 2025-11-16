import { TableRow } from '@mui/material';
import PropTypes from 'prop-types';

import AmountCell from './AmountCell';
import BalanceCell from './BalanceCell';
import CategoryCell from './CategoryCell';
import DateCell from './DateCell';
import DeleteButtonCell from './DeleteButtonCell';
import DescriptionCell from './DescriptionCell';
import SelectionCell from './SelectionCell';
import StatusCell from './StatusCell';

export default function LedgerRow({
  row,
  balance,
  isSelected,
  onSelectionChange,
}) {
  return (
    <TableRow
      sx={{
        backgroundColor: isSelected ? 'action.selected' : 'inherit',
        '&:hover': {
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
        },
        '& .MuiTableCell-root': {
          padding: '8px 12px',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <SelectionCell
        transaction={row}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
      />
      <StatusCell transaction={row} />
      <DateCell transaction={row} />
      <CategoryCell transaction={row} />
      <DescriptionCell transaction={row} />
      <AmountCell transaction={row} />
      <BalanceCell amount={balance} />
      <DeleteButtonCell transaction={row} />
    </TableRow>
  );
}

LedgerRow.propTypes = {
  row: PropTypes.object.isRequired,
  balance: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onSelectionChange: PropTypes.func,
};
