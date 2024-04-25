import { TableCell, TableHead, TableRow } from '@mui/material';

export default function TableHeader() {
  return (
    <TableHead>
      <TableRow sx={{ border: '2px solid black' }}>
        <TableCell>Status</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Payor</TableCell>
        <TableCell>Payee</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Balance</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
