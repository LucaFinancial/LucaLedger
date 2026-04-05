import { Box, Typography } from '@mui/material';
import TooltipValue from './TooltipValue';

export default function MetricCell({
  label,
  value,
  valueColor,
  formatCurrency,
  textAlign,
  tooltip,
  icon = null,
  useAbsoluteValue = false,
}) {
  const displayValue = useAbsoluteValue ? Math.abs(value) : value;
  const formattedValue = formatCurrency(displayValue);

  return (
    <Box sx={{ minWidth: 0, textAlign }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <TooltipValue tooltip={tooltip}>
        <Typography
          variant='h6'
          sx={{
            color: valueColor,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {icon ? (
            <Box
              component='span'
              sx={{
                position: 'relative',
                display: 'inline-block',
                pl: '2rem',
              }}
            >
              <Box
                component='span'
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  lineHeight: 0,
                }}
              >
                {icon}
              </Box>
              {formattedValue}
            </Box>
          ) : (
            formattedValue
          )}
        </Typography>
      </TooltipValue>
    </Box>
  );
}
