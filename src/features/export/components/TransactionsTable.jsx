import LucaTable from '@/components/common/LucaTable';
import { useTransactions } from '@/hooks';

export default function TransactionsTable() {
  const { transactions } = useTransactions();

  const columns = [
    {
      field: 'date',
      title: 'Date',
      component: ({ row }) => <div>{row.date}</div>,
    },
    {
      field: 'payorId',
      title: 'Payor ID',
      component: ({ row }) => <div>{row.payorId}</div>,
    },
    {
      field: 'payeeId',
      title: 'Payee ID',
      component: ({ row }) => <div>{row.payeeId}</div>,
    },
    {
      field: 'description',
      title: 'Description',
      component: ({ row }) => <div>{row.description}</div>,
    },
    {
      field: 'amount',
      title: 'Amount',
      component: ({ row }) => <div>$ {row.amount}</div>,
    },
    {
      field: 'createdAt',
      title: 'Created At',
      component: ({ row }) => <div>{row.createdAt}</div>,
    },
    {
      field: 'updatedAt',
      title: 'Updated At',
      component: ({ row }) => <div>{row.updatedAt}</div>,
    },
  ];

  return (
    <div>
      <h2>Transactions</h2>
      <LucaTable
        columns={columns}
        data={transactions}
      />
    </div>
  );
}
