import { TableCell } from '@mui/material';

import TransactionStateSelect from '@/components/TransactionStateSelect';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function StatusCell({ transaction, isSelected, isVirtual }) {
  return (
    <TableCell sx={LEDGER_COLUMN_STYLES.status}>
      <TransactionStateSelect
        transaction={transaction}
        isSelected={isSelected}
        isVirtual={isVirtual}
      />
    </TableCell>
  );
}

