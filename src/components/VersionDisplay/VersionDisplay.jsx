import { Typography, Box } from '@mui/material';

import { version } from '../../../package.json';

export default function VersionDisplay() {
  return (
    <Box
      sx={{
        color: 'white',
        position: 'absolute',
        bottom: '0',
        right: '15px',
      }}
    >
      <Typography
        variant='subtitle1'
        sx={{
          color: 'inherit',
        }}
      >
        v{version}
      </Typography>
    </Box>
  );
}
