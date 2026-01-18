import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function BalanceCell({ amount }) {
  const amountInDollars = centsToDollars(amount);

  const cellStyle = {
    ...LEDGER_COLUMN_STYLES.balance,
    color: amount < 0 ? '#CC4040' : 'inherit',
  };

  return (
    <TableCell sx={cellStyle}>
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
