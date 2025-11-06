import { useEffect, useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

import SaveAllButton from './SaveAllButton';

export default function Dashboard() {
  const [countdown, setCountdown] = useState('');

  // Calculate countdown to December 13, 2025
  useEffect(() => {
    const calculateCountdown = () => {
      const releaseDate = new Date('2025-12-13T00:00:00');
      const now = new Date();
      const diff = releaseDate - now;

      if (diff <= 0) {
        setCountdown('Released!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (days > 0) {
        setCountdown(`${days} day${days !== 1 ? 's' : ''} remaining`);
      } else {
        setCountdown(`${hours} hour${hours !== 1 ? 's' : ''} remaining`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <Container
      maxWidth='md'
      sx={{ mt: 8 }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, textAlign: 'center' }}
      >
        <Typography
          variant='h3'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          🎉 Version 2.0 Coming Soon!
        </Typography>

        {countdown && (
          <Typography
            variant='h5'
            sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}
          >
            ⏰ {countdown}
          </Typography>
        )}

        <Typography
          variant='h6'
          sx={{ mb: 4 }}
        >
          Luca Ledger Version 2 launches on <strong>December 13, 2025</strong>
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'warning.light',
            border: '2px solid',
            borderColor: 'warning.main',
          }}
        >
          <Typography
            variant='h6'
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            ⚠️ Save Your Data Now
          </Typography>
          <Typography
            variant='body1'
            sx={{ mb: 3 }}
          >
            Save your account data before December 13, 2025. Your saved data can
            be imported into both Version 1 and Version 2.
          </Typography>
          <SaveAllButton />
        </Paper>

        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography
            variant='h6'
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            What&apos;s Happening?
          </Typography>
          <Typography
            variant='body1'
            component='div'
          >
            <ul style={{ paddingLeft: '20px' }}>
              <li>
                <strong>Version 1</strong> will move to{' '}
                <a
                  href='https://v1.lucaledger.app'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  v1.lucaledger.app
                </a>
              </li>
              <li>
                <strong>Version 2</strong> will be made available here on
                December 13, 2025
              </li>
              <li>
                <strong>Preview Version 2</strong> now at{' '}
                <a
                  href='https://beta.lucaledger.app'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  beta.lucaledger.app
                </a>
              </li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
