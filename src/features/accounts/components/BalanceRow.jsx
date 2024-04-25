import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function BalanceRow({ account, balanceType, filterArray }) {
  return (
    <Typography
      variant='body1'
      color='text.secondary'
      style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <span>{balanceType}</span>
      <span>
        {'$ '}
        {account.transactions
          .filter((t) => filterArray.includes(t.status))
          .reduce((acc, t) => acc + Number(t.amount), 0)
          .toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </span>
    </Typography>
  );
}

BalanceRow.propTypes = {
  account: PropTypes.object.isRequired,
  balanceType: PropTypes.string.isRequired,
  filterArray: PropTypes.array.isRequired,
};
