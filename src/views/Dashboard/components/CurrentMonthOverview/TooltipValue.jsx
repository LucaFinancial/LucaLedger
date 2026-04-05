import { Box, Tooltip, Typography } from '@mui/material';

export default function TooltipValue({ tooltip, children }) {
  if (!tooltip) {
    return children;
  }

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ maxWidth: 320 }}>
          <Typography variant='body2'>{tooltip}</Typography>
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
}
