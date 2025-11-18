import { TableRow } from '@mui/material';
import PropTypes from 'prop-types';

import { constants } from '@/store/transactions';
import AmountCell from './AmountCell';
import BalanceCell from './BalanceCell';
import CategoryCell from './CategoryCell';
import DateCell from './DateCell';
import DeleteButtonCell from './DeleteButtonCell';
import DescriptionCell from './DescriptionCell';
import SelectionCell from './SelectionCell';
import StatusCell from './StatusCell';

const getStatusBackground = (status, isSelected) => {
  if (isSelected) {
    return '#f57c00'; // chart orange
  }

  switch (status) {
    case constants.TransactionStatusEnum.COMPLETE:
      return '#e0e0e0'; // lightgray
    case constants.TransactionStatusEnum.PENDING:
      return '#fff9c4'; // light yellow
    case constants.TransactionStatusEnum.PLANNED:
      return '#c8e6c9'; // light green
    case constants.TransactionStatusEnum.SCHEDULED:
      return '#b3e5fc'; // light blue
    default:
      return 'white';
  }
};

export default function LedgerRow({
  row,
  balance,
  isSelected,
  onSelectionChange,
}) {
  const bgColor = getStatusBackground(row.status, isSelected);

  return (
    <TableRow
      sx={{
        backgroundColor: bgColor,
        color: isSelected ? 'white' : 'inherit',
        '&:hover': {
          filter: 'brightness(0.95)',
        },
        '& .MuiTableCell-root': {
          padding: '2px 4px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: isSelected ? 'white' : 'inherit',
        },
      }}
    >
      <SelectionCell
        transaction={row}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
      />
      <StatusCell
        transaction={row}
        isSelected={isSelected}
      />
      <DateCell transaction={row} />
      <CategoryCell
        transaction={row}
        isSelected={isSelected}
      />
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
