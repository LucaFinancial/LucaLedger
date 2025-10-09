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
          variant='h6'
          component='div'
          sx={{ mb: 1, fontWeight: 'bold' }}
        >
          Coming Soon: Version 2.0.0
        </Typography>
        <Typography
          variant='body2'
          sx={{ mb: 1 }}
        >
          Luca Ledger Version 2 is on the horizon with exciting new features and
          enhanced security! Your data will automatically migrate to a new
          storage format, and all locally stored information will be encrypted
          at rest with a user-generated passphrase.
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
              What&apos;s Changing in Version 2
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2 }}
            >
              Version 2 introduces a new format for how transactions are stored.
              This update improves performance, reliability, and prepares Luca
              Ledger for future enhancements.
            </Typography>

            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              Automatic Migration
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2 }}
            >
              <strong>No user action required!</strong> When Version 2 is
              released, your data will automatically migrate to the new format.
              Legacy data will still load but will be converted immediately to
              ensure compatibility.
            </Typography>

            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              New Security Feature: Local Data Encryption
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 1 }}
            >
              All locally stored data will be encrypted at rest using a
              user-generated passphrase (or a securely generated one). This
              ensures that your financial information remains private and secure
              on your device.
            </Typography>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              What to Expect
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2 }}
            >
              After the migration, you&apos;ll continue using Luca Ledger as
              normal, with the added benefit of encryption and improved data
              handling. More information, including the official release date,
              will be provided as we get closer to launch. We anticipate the
              release to be in early 2026.
            </Typography>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}
            >
              Stay tuned for updates! We&apos;re excited to bring you these
              improvements.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
}
