import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';

import { formatCurrencyFromCents } from './spendingHistoryHelpers';
import {
  formatTransactionDate,
  getTransactionDetailTextColor,
  sortTransactionDetailsForDirection,
} from './spendingHistoryHelpers';

export default function TransactionDetailTable({
  transactions,
  transactionSortDirection,
  onTransactionSortToggle,
  accountsById,
}) {
  return (
    <Table
      size='small'
      sx={{
        '& .MuiTableCell-root': {
          px: 1,
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>
            <TableSortLabel
              active
              direction={transactionSortDirection}
              IconComponent={KeyboardArrowUpIcon}
              onClick={onTransactionSortToggle}
            >
              Date
            </TableSortLabel>
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Account</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          <TableCell align='right' sx={{ fontWeight: 700 }}>
            Amount
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortTransactionDetailsForDirection(
          transactions,
          transactionSortDirection,
        ).map((transaction) => {
          const detailTextColor = getTransactionDetailTextColor(transaction);

          return (
            <TableRow
              key={transaction.id}
              sx={{
                color: detailTextColor,
                '& .MuiTableCell-root': {
                  color: detailTextColor,
                },
              }}
            >
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatTransactionDate(transaction.date)}
              </TableCell>
              <TableCell>
                {accountsById.get(transaction.accountId) || '--'}
              </TableCell>
              <TableCell>{transaction.description || '--'}</TableCell>
              <TableCell
                align='right'
                sx={{
                  color: detailTextColor,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCurrencyFromCents(transaction.amount)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function TransactionDetailRow({
  transactions,
  colSpan,
  transactionSortDirection,
  onTransactionSortToggle,
  accountsById,
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          py: 1.5,
          px: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.62)',
        }}
      >
        <TransactionDetailTable
          transactions={transactions}
          transactionSortDirection={transactionSortDirection}
          onTransactionSortToggle={onTransactionSortToggle}
          accountsById={accountsById}
        />
      </TableCell>
    </TableRow>
  );
}
