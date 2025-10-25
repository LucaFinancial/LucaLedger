import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';

export default function BalanceCell({ amount }) {
  const amountInDollars = centsToDollars(amount);

  const cellStyle = {
    backgroundColor: amountInDollars < 0 ? '#CC4040' : 'inherit',
    width: '100px',
  };

  return (
    <TableCell style={cellStyle}>
      {'$ '}
      {amountInDollars.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </TableCell>
  );
}

BalanceCell.propTypes = {
  amount: PropTypes.number.isRequired,
};
