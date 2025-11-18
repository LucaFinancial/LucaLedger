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
        pb: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
        {differenceInDollars !== null && differenceInDollars !== 0 && (
          <Typography
            variant='caption'
            sx={{
              color: differenceColor,
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
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
      <Typography
        variant='h6'
        sx={{
          ...textStyle,
          fontWeight: 600,
          fontSize: '1.25rem',
        }}
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
  difference: PropTypes.number,
  accountType: PropTypes.string,
};
