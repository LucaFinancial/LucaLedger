import { Typography } from '@mui/material';

import { version } from '../../../package.json';

export default function VersionDisplay() {
  return (
    <Typography
      variant='subtitle1'
      style={{
        color: 'white',
        position: 'absolute',
        bottom: '0',
        right: '15px',
      }}
    >
      v{version}
    </Typography>
  );
}
