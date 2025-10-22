import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { formatCentsAsDollars } from '@/utils';

export default function BalanceCell({ amount }) {
  const cellStyle = {
    backgroundColor: amount < 0 ? '#CC4040' : 'inherit',
    width: '100px',
  };

  return (
    <TableCell style={cellStyle}>
      {'$ '}
      {formatCentsAsDollars(amount)}
    </TableCell>
  );
}

BalanceCell.propTypes = {
  amount: PropTypes.number.isRequired,
};
