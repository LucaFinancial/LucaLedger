import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

import { version as currentVersion } from '../../../package.json';

const STORAGE_KEY = 'announcementBannerDismissed_v2';

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  useEffect(() => {
    const storedVersion = localStorage.getItem('appVersion');

    // Reset dismissed state if version has changed
    if (storedVersion !== currentVersion) {
      localStorage.removeItem(STORAGE_KEY);
      setDismissed(false);
    } else {
      const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      setDismissed(isDismissed);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      severity='info'
      icon={<InfoIcon />}
      sx={{
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
      action={
        <IconButton
          aria-label='close'
          color='inherit'
          size='small'
          onClick={handleDismiss}
        >
          <CloseIcon fontSize='inherit' />
        </IconButton>
      }
    >
      <Box>
        <Typography
          variant='caption'
          sx={{
            mb: 2,
            display: 'block',
            fontStyle: 'italic',
            color: 'text.secondary',
          }}
        >
          💡 Tip: Click the version number (top-right) to hide/show this
          notification
        </Typography>
        <Typography
          variant='h6'
          component='div'
          sx={{ mb: 1, fontWeight: 'bold' }}
        >
          🎉 Exciting News: Version 2.0.0 Coming December 13, 2025!
        </Typography>
        {countdown && (
          <Typography
            variant='body2'
            sx={{
              mb: 1,
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            ⏰ {countdown}
          </Typography>
        )}
        <Typography
          variant='body2'
          sx={{ mb: 2 }}
        >
          Luca Ledger Version 2 will be released on{' '}
          <strong>December 13, 2025</strong>. Version 1 will continue to be
          available at{' '}
          <a
            href='https://v1.lucaledger.app'
            target='_blank'
            rel='noopener noreferrer'
            style={{ fontWeight: 'bold' }}
          >
            v1.lucaledger.app
          </a>{' '}
          for the foreseeable future.
        </Typography>
        <Typography
          variant='body2'
          sx={{
            mb: 2,
            p: 1.5,
            backgroundColor: 'warning.light',
            borderRadius: 1,
            fontWeight: 'bold',
          }}
        >
          ⚠️ Action Required: If you are not ready to upgrade to v2, please move
          your data to the new v1 URL before{' '}
          <span style={{ textDecoration: 'underline' }}>December 13, 2025</span>
          .
        </Typography>

        <Button
          size='small'
          onClick={handleToggleExpand}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 1, mb: expanded ? 2 : 0 }}
        >
          {expanded ? 'Show Less' : 'Learn More'}
        </Button>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              What You Need to Know
            </Typography>
            <Typography
              variant='body2'
              component='div'
              sx={{ mb: 2 }}
            >
              <ul style={{ marginTop: 0, paddingLeft: '20px' }}>
                <li>
                  <strong>Version 1 remains available:</strong> You can continue
                  using v1 at{' '}
                  <a
                    href='https://v1.lucaledger.app'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    https://v1.lucaledger.app
                  </a>
                </li>
                <li>
                  <strong>Preview Version 2:</strong> Test the new version at{' '}
                  <a
                    href='https://beta.lucaledger.app'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    https://beta.lucaledger.app
                  </a>
                </li>
                <li>
                  <strong>Data migration:</strong> Your data is stored locally
                  in your browser. To use v1 <em>after</em> the v2 release,
                  you&apos;ll need to export your data from the current URL and
                  import it at the new v1 URL before December 13, 2025.
                </li>
              </ul>
            </Typography>

            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              Need Help?
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2 }}
            >
              For questions or support, please visit our{' '}
              <a
                href='https://github.com/LucaFinancial/LucaLedger/issues'
                target='_blank'
                rel='noopener noreferrer'
              >
                GitHub Issues
              </a>{' '}
              page or contact us through GitHub.
            </Typography>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}
            >
              Thank you for using Luca Ledger! We&apos;re excited to bring you
              the improvements in Version 2.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
}
