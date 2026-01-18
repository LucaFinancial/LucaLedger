import { TableCell, TableHead, TableRow } from '@mui/material';
import {
  LEDGER_COLUMN_STYLES,
  LEDGER_HEADER_ROW_STYLE,
} from './ledgerColumnConfig';

export default function LedgerHeader() {
  return (
    <TableHead>
      <TableRow sx={LEDGER_HEADER_ROW_STYLE}>
        <TableCell sx={LEDGER_COLUMN_STYLES.selection}></TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.quickAction}></TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.status}>Status</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.date}>Date</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.category}>Category</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.description}>Description</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.amount}>Amount</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.balance}>Balance</TableCell>
        <TableCell sx={LEDGER_COLUMN_STYLES.actionMenu}></TableCell>
      </TableRow>
    </TableHead>
  );
}
