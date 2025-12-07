import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';

/**
 * SplitSummary displays the total and remaining amounts for splits
 */
export default function SplitSummary({
  totalAmount,
  splitsTotal,
  remaining,
  sumError,
}) {
  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: remaining === 0 ? '#e8f5e9' : '#fff3e0',
        borderRadius: 1,
      }}
    >
      <Typography variant='body2'>
        <strong>Remaining:</strong> ${centsToDollars(remaining).toFixed(2)}
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
      >
        Total of splits: ${centsToDollars(splitsTotal).toFixed(2)} / $
        {centsToDollars(totalAmount).toFixed(2)}
      </Typography>
      {sumError && (
        <Typography
          variant='caption'
          color='error'
          sx={{ display: 'block', mt: 1 }}
        >
          {sumError}
        </Typography>
      )}
    </Box>
  );
}

SplitSummary.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  splitsTotal: PropTypes.number.isRequired,
  remaining: PropTypes.number.isRequired,
  sumError: PropTypes.string,
};
