import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';

export default function BalanceDisplay({ label, balance }) {
  const balanceInDollars = centsToDollars(balance);
  const textStyle = {
    color: balanceInDollars < 0 ? 'red' : 'inherit',
  };

  return (
    <Box
      style={{
        width: '100%',
        border: '1px solid lightgray',
        padding: '8px',
        borderRadius: '4px',
      }}
    >
      <Typography
        variant='body1'
        display='block'
        sx={textStyle}
      >
        {label}
      </Typography>
      <Typography
        variant='subtitle1'
        sx={textStyle}
        display='block'
      >
        $
        {balanceInDollars.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
    </Box>
  );
}

BalanceDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
};
