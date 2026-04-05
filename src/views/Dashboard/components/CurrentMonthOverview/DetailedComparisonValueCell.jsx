import { TableCell, Typography } from '@mui/material';
import TooltipValue from './TooltipValue';

function getCellSx(emphasis) {
  if (emphasis !== 'total') {
    return undefined;
  }

  return {
    height: '3.25rem',
    boxSizing: 'border-box',
  };
}

function getValueSx({ emphasis, valueColor, icon }) {
  return {
    color: valueColor,
    fontWeight: emphasis ? 700 : 600,
    fontSize: emphasis === 'total' ? '1rem' : undefined,
    whiteSpace: 'nowrap',
    display: icon ? 'inline-flex' : undefined,
    alignItems: icon ? 'center' : undefined,
    justifyContent: icon ? 'flex-end' : undefined,
  };
}

export default function DetailedComparisonValueCell({
  emphasis,
  formatCurrency,
  icon = null,
  tooltip,
  value,
  valueColor,
}) {
  return (
    <TableCell align='right' sx={getCellSx(emphasis)}>
      <TooltipValue tooltip={tooltip}>
        <Typography
          variant='body2'
          sx={getValueSx({
            emphasis,
            valueColor,
            icon,
          })}
        >
          {icon}
          {formatCurrency(value)}
        </Typography>
      </TooltipValue>
    </TableCell>
  );
}
