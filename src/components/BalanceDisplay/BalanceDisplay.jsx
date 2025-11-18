import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';

export default function BalanceDisplay({
  label,
  balance,
  difference,
  accountType,
}) {
  const balanceInDollars = centsToDollars(balance);
  const textStyle = {
    color: balanceInDollars < 0 ? 'red' : 'inherit',
  };

  const differenceInDollars = difference ? centsToDollars(difference) : null;
  const isCreditCard = accountType === 'Credit Card';

  let differenceColor;
  if (differenceInDollars !== null && differenceInDollars !== 0) {
    const isPositive = differenceInDollars >= 0;
    differenceColor = isCreditCard
      ? isPositive
        ? 'red'
        : 'green'
      : isPositive
      ? 'green'
      : 'red';
  }

  return (
    <Box
      sx={{
        width: '100%',
        mb: 2.5,
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant='h5'
        sx={{
          ...textStyle,
          fontWeight: 700,
          fontSize: '1.5rem',
          mb:
            differenceInDollars !== null && differenceInDollars !== 0 ? 0.5 : 0,
        }}
      >
        $
        {balanceInDollars.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
      {differenceInDollars !== null && differenceInDollars !== 0 && (
        <Typography
          variant='body2'
          sx={{
            color: differenceColor,
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {differenceInDollars >= 0 ? '▲' : '▼'}$
          {Math.abs(differenceInDollars).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
      )}
    </Box>
  );
}

BalanceDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  difference: PropTypes.number,
  accountType: PropTypes.string,
};
