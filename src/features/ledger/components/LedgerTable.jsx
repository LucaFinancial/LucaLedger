import { Paper, Table, TableBody, TableContainer } from '@mui/material';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LedgerRow from './LedgerRow';
import { selectors } from '@/store/transactions';
import TableHeader from './TableHeader';
import { dateCompareFn } from '../utils';
import { TransactionStateEnum } from '@/store/enums';

export default function LedgerTable() {
  const { accountId } = useParams();
  const transactions = useSelector(
    selectors.selectTransactionsByAccountId(accountId)
  );

  const sortedTransactions = useMemo(
    () =>
      [...transactions]
        .filter((tx) => tx.transactionState !== TransactionStateEnum.DELETED)
        .sort(dateCompareFn),
    [transactions]
  );

  let balance = 0.0;

  return (
    <TableContainer
      component={Paper}
      style={{ height: 'calc(100vh - 250px)' }}
    >
      <Table stickyHeader>
        <TableHeader />
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <LedgerRow
              key={transaction.id}
              transaction={transaction}
              balance={(balance += transaction.amount)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
