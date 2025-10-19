import { Checkbox, TableCell, TableRow } from '@mui/material';
import PropTypes from 'prop-types';

import { constants } from '@/store/transactions';
import AmountCell from './AmountCell';
import BalanceCell from './BalanceCell';
import DateCell from './DateCell';
import DeleteButtonCell from './DeleteButtonCell';
import DescriptionCell from './DescriptionCell';
import StatusCell from './StatusCell';

const setBgColor = (status) => {
  switch (status) {
    case constants.TransactionStatusEnum.COMPLETE:
      return 'lightgray';
    case constants.TransactionStatusEnum.PENDING:
      return 'yellow';
    case constants.TransactionStatusEnum.PLANNED:
      return 'lightgreen';
    case constants.TransactionStatusEnum.SCHEDULED:
      return 'lightblue';
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
  const bgColor = isSelected ? '#b3d9ff' : setBgColor(row.status);

  return (
    <TableRow
      sx={{ background: bgColor, '& .MuiTableCell-root': { padding: '4px' } }}
    >
      <TableCell sx={{ width: '48px', paddingLeft: '16px' }}>
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelectionChange(row.id, e.target.checked)}
          size='small'
        />
      </TableCell>
      <StatusCell transaction={row} />
      <DateCell transaction={row} />
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
