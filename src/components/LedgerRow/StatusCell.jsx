import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';

import TransactionStatusSelect from '@/components/TransactionStatusSelect';

export default function StatusCell({ transaction, isSelected }) {
  return (
    <TableCell
      style={{
        width: '130px',
        paddingLeft: '10px',
      }}
    >
      <TransactionStatusSelect
        transaction={transaction}
        isSelected={isSelected}
      />
    </TableCell>
  );
}

StatusCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
};
