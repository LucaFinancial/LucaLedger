import { Box, Typography } from '@mui/material';
import TooltipValue from './TooltipValue';

export default function MetricCell({
  label,
  value,
  valueColor,
  formatCurrency,
  textAlign,
  tooltip,
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <TooltipValue tooltip={tooltip}>
        <Typography
          variant='h6'
          sx={{ color: valueColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          {formatCurrency(value)}
        </Typography>
      </TooltipValue>
    </Box>
  );
}
