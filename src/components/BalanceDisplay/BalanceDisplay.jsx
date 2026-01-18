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

  // Determine icon based on label
  const getIcon = () => {
    if (label.includes('Pending')) return '⏱';
    if (label.includes('Scheduled')) return '📅';
    return '💰';
  };

  return (
    <Box
      sx={{
        width: '100%',
        mb: 0.75,
        p: 1.25,
        backgroundColor: 'rgba(33, 150, 243, 0.04)',
        borderRadius: '8px',
        border: '1px solid rgba(33, 150, 243, 0.12)',
        transition: 'all 0.2s ease-in-out',
        cursor: 'default',
        '&:hover': {
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box component='span' sx={{ fontSize: '0.8rem' }}>
            {getIcon()}
          </Box>
          {label.replace(' Balance', '')}
        </Typography>
        {differenceInDollars !== null && differenceInDollars !== 0 && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.75,
              py: 0.25,
              borderRadius: '8px',
              backgroundColor:
                differenceColor === 'green'
                  ? 'rgba(76, 175, 80, 0.15)'
                  : 'rgba(244, 67, 54, 0.15)',
            }}
          >
            <Typography
              variant='body2'
              sx={{
                color: differenceColor,
                fontSize: '0.65rem',
                fontWeight: 700,
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
          </Box>
        )}
      </Box>
      <Typography
        variant='h4'
        sx={{
          ...textStyle,
          fontWeight: 700,
          fontSize: '1.15rem',
          lineHeight: 1,
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
