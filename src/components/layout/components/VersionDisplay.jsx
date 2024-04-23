import { Typography } from '@mui/material';

import useVersion from '@/hooks/useVersion';

export default function VersionDisplay() {
  const version = useVersion();

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
