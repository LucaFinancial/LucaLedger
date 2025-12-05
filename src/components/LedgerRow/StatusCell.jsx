import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';

import TransactionStatusSelect from '@/components/TransactionStatusSelect';

export default function StatusCell({ transaction, isSelected, isVirtual }) {
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
        isVirtual={isVirtual}
      />
    </TableCell>
  );
}

StatusCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  isVirtual: PropTypes.bool,
};
