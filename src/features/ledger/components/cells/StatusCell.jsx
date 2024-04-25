import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';

import TransactionStatusSelect from '@/components/input/TransactionStatePicker';

export default function StatusCell({ transaction }) {
  return (
    <TableCell
      style={{
        width: '175px',
        padding: '0px 0px 0px 10px',
      }}
    >
      <TransactionStatusSelect transaction={transaction} />
    </TableCell>
  );
}

StatusCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
