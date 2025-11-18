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
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          {differenceInDollars !== null && differenceInDollars !== 0 && (
            <span
              style={{
                color: differenceColor,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {differenceInDollars >= 0 ? (
                <span style={{ marginRight: 2 }}>▲</span>
              ) : (
                <span style={{ marginRight: 2 }}>▼</span>
              )}
              $
              {Math.abs(differenceInDollars).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </span>
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
  difference: PropTypes.number,
  accountType: PropTypes.string,
};
