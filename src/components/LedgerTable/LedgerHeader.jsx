import { TableCell, TableHead, TableRow } from '@mui/material';

export default function LedgerHeader() {
  return (
    <TableHead>
      <TableRow sx={{ border: '2px solid black' }}>
        <TableCell>Status</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Description</TableCell>
        {/* <TableCell>Category</TableCell> */}
        <TableCell>Amount</TableCell>
        <TableCell>Balance</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
