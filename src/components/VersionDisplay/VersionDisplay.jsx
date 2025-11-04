import { Typography, Box } from '@mui/material';

import { version } from '../../../package.json';

export default function VersionDisplay() {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '0',
        right: '15px',
        minWidth: 'auto',
        padding: 0,
      }}
    >
      <Typography
        variant='subtitle1'
        sx={{
          color: 'white',
        }}
      >
        v{version}
      </Typography>
    </Box>
  );
}
