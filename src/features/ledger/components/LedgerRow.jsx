import { TableRow } from '@mui/material';
import PropTypes from 'prop-types';

import { TransactionStateEnum } from '@/store/constants';
import AmountCell from './cells/AmountCell';
import BalanceCell from './cells/BalanceCell';
import CategoryCell from './cells/CategoryCell';
import DateCell from './cells/DateCell';
import DeleteButtonCell from './cells/DeleteButtonCell';
import DescriptionCell from './cells/DescriptionCell';
import EntityCell, { EntityCellType } from './cells/EntityCell';
import StatusCell from './cells/StatusCell';

const setBgColor = (status) => {
  switch (status) {
    case TransactionStateEnum.COMPLETE:
      return 'lightgray';
    case TransactionStateEnum.PENDING:
      return 'yellow';
    case TransactionStateEnum.PLANNED:
      return 'lightgreen';
    case TransactionStateEnum.SCHEDULED:
      return 'lightblue';
    default:
      return 'white';
  }
};

export default function LedgerRow({ transaction, balance }) {
  const bgColor = setBgColor(transaction.status);

  return (
    <TableRow style={{ background: bgColor }}>
      <StatusCell transaction={transaction} />
      <DateCell transaction={transaction} />
      <EntityCell
        transaction={transaction}
        column={EntityCellType.PAYOR}
      />
      <EntityCell
        transaction={transaction}
        column={EntityCellType.PAYEE}
      />
      <CategoryCell transaction={transaction} />
      <DescriptionCell transaction={transaction} />
      <AmountCell transaction={transaction} />
      <BalanceCell amount={balance} />
      <DeleteButtonCell transaction={transaction} />
    </TableRow>
  );
}

LedgerRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  balance: PropTypes.number.isRequired,
};
