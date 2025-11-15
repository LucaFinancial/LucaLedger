import { TableCell, TableHead, TableRow } from '@mui/material';

export default function LedgerHeader() {
  return (
    <TableHead>
      <TableRow sx={{ border: '2px solid black' }}>
        <TableCell sx={{ width: '48px' }}></TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Balance</TableCell>
        <TableCell>Split</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
