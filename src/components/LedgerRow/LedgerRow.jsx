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
import ActionCell from './ActionCell';

const VIRTUAL_STATUS = 'recurring';

const getStatusBackground = (status, isSelected, isVirtual) => {
  if (isSelected) {
    return '#f57c00'; // chart orange
  }

  if (isVirtual) {
    return '#e1bee7'; // light purple for virtual/recurring
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
  isVirtual,
  recurringTransaction,
  occurrenceDate,
}) {
  const bgColor = getStatusBackground(row.status, isSelected, isVirtual);

  return (
    <TableRow
      sx={{
        backgroundColor: bgColor,
        color: isSelected ? 'white' : 'inherit',
        opacity: isVirtual ? 0.85 : 1,
        '&:hover': {
          filter: 'brightness(0.95)',
        },
        '& .MuiTableCell-root': {
          padding: '2px 4px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: isSelected ? 'white' : 'inherit',
          fontStyle: isVirtual ? 'italic' : 'normal',
        },
      }}
    >
      <SelectionCell
        transaction={row}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
        isVirtual={isVirtual}
      />
      <StatusCell
        transaction={{
          ...row,
          status: isVirtual ? VIRTUAL_STATUS : row.status,
        }}
        isSelected={isSelected}
        isVirtual={isVirtual}
      />
      <DateCell transaction={row} />
      <CategoryCell
        transaction={row}
        isSelected={isSelected}
      />
      <DescriptionCell transaction={row} />
      <AmountCell transaction={row} />
      <BalanceCell amount={balance} />
      <ActionCell
        transaction={row}
        isVirtual={isVirtual}
        recurringTransaction={recurringTransaction}
        occurrenceDate={occurrenceDate}
      />
      {!isVirtual && <DeleteButtonCell transaction={row} />}
      {isVirtual && (
        <td style={{ width: '48px' }} /> // Empty cell for virtual transactions
      )}
    </TableRow>
  );
}

LedgerRow.propTypes = {
  row: PropTypes.object.isRequired,
  balance: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  isVirtual: PropTypes.bool,
  recurringTransaction: PropTypes.object,
  occurrenceDate: PropTypes.string,
};

LedgerRow.defaultProps = {
  isVirtual: false,
  recurringTransaction: null,
  occurrenceDate: null,
};
