import { TableRow } from '@mui/material';
import PropTypes from 'prop-types';

import { constants } from '@/store/transactions';
import AmountCell from './AmountCell';
import BalanceCell from './BalanceCell';
import CategoryCell from './CategoryCell';
import DateCell from './DateCell';
import DescriptionCell from './DescriptionCell';
import SelectionCell from './SelectionCell';
import StatusCell from './StatusCell';
import ActionCell from './ActionCell';
import QuickActionCell from './QuickActionCell';
import { LEDGER_ROW_STYLE } from '@/components/LedgerTable/ledgerColumnConfig';

const VIRTUAL_STATE = 'recurring';

const getStatusBackground = (status, isSelected, isVirtual) => {
  if (isSelected) {
    return '#f57c00'; // chart orange
  }

  if (isVirtual) {
    return '#e1bee7'; // light purple for virtual/recurring
  }

  switch (status) {
    case constants.TransactionStateEnum.COMPLETED:
      return '#e0e0e0'; // lightgray
    case constants.TransactionStateEnum.PENDING:
      return '#fff9c4'; // light yellow
    case constants.TransactionStateEnum.SCHEDULED:
      return '#b3e5fc'; // light blue
    case constants.TransactionStateEnum.PLANNED:
      return '#c8e6c9'; // light green
    default:
      return 'white';
  }
};

export default function LedgerRow({
  row,
  balance,
  isSelected,
  onSelectionChange,
  isVirtual = false,
  recurringTransaction = null,
  occurrenceDate = null,
}) {
  const bgColor = getStatusBackground(
    row.transactionState,
    isSelected,
    isVirtual,
  );

  const rowStyle = {
    ...LEDGER_ROW_STYLE,
    backgroundColor: bgColor,
    color: isSelected ? 'white' : 'inherit',
    opacity: isVirtual ? 0.85 : 1,
    fontStyle: isVirtual ? 'italic' : 'normal',
  };

  return (
    <TableRow sx={rowStyle}>
      <SelectionCell
        transaction={row}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
        isVirtual={isVirtual}
      />
      <QuickActionCell
        transaction={row}
        isVirtual={isVirtual}
        recurringTransaction={recurringTransaction}
        occurrenceDate={occurrenceDate}
      />
      <StatusCell
        transaction={{
          ...row,
          transactionState: isVirtual ? VIRTUAL_STATE : row.transactionState,
        }}
        isSelected={isSelected}
        isVirtual={isVirtual}
      />
      <DateCell transaction={row} />
      <CategoryCell transaction={row} isSelected={isSelected} />
      <DescriptionCell transaction={row} />
      <AmountCell transaction={row} />
      <BalanceCell amount={balance} />
      <ActionCell transaction={row} isVirtual={isVirtual} />
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
