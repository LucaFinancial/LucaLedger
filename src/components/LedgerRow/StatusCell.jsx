import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';

import TransactionStatusSelect from '@/components/TransactionStatusSelect';

export default function StatusCell({ transaction }) {
  return (
    <TableCell
      style={{
        width: '130px',
        paddingLeft: '10px',
      }}
    >
      <TransactionStatusSelect transaction={transaction} />
    </TableCell>
  );
}

StatusCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
