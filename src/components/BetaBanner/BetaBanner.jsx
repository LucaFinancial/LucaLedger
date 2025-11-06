import { Alert, Box, Typography } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import packageJson from '../../../package.json';

const RELEASE_DATE = new Date('2025-12-13T00:00:00');

export default function BetaBanner() {
  const [timeUntilRelease, setTimeUntilRelease] = useState('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const diff = RELEASE_DATE - now;

      if (diff <= 0) {
        setTimeUntilRelease('Released!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setTimeUntilRelease(`${days} day${days !== 1 ? 's' : ''}`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <Alert
      severity='warning'
      icon={<WarningIcon />}
      sx={{
        mb: 2,
        borderRadius: 1,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
        }}
      >
        <Typography
          variant='body2'
          sx={{ fontWeight: 500 }}
        >
          <strong>Beta Version {packageJson.version}</strong> - This version is
          currently in beta. Please save your data frequently until the official
          release.
        </Typography>
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: 'warning.dark',
          }}
        >
          Release: Dec 13, 2025 ({timeUntilRelease})
        </Typography>
      </Box>
    </Alert>
  );
}
