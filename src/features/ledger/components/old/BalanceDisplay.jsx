import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function BalanceDisplay({ label, balance }) {
  const textStyle = {
    color: balance < 0 ? 'red' : 'inherit',
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
        {balance.toLocaleString(undefined, {
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
