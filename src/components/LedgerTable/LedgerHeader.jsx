import { TableCell, TableHead, TableRow } from '@mui/material';

export default function LedgerHeader() {
  return (
    <TableHead>
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: 'background.paper',
            borderBottom: '2px solid',
            borderColor: 'divider',
            padding: '12px',
          },
        }}
      >
        <TableCell sx={{ width: '48px' }}></TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Balance</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
