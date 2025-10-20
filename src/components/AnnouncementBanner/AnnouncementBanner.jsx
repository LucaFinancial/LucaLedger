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
          🎉 Exciting News: Version 2.0.0 Coming Soon!
        </Typography>
        <Typography
          variant='body2'
          sx={{ mb: 2 }}
        >
          Luca Ledger Version 2 will bring exciting new features and
          improvements. Version 1 will continue to be available at{' '}
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
          your data to the new v1 URL before the v2 release.
        </Typography>

        <Button
          size='small'
          onClick={handleToggleExpand}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 1, mb: expanded ? 2 : 0 }}
        >
          {expanded ? 'Show Less' : "See What's Coming in v2"}
        </Button>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              Version 2 Features
            </Typography>
            <Typography
              variant='body2'
              component='div'
              sx={{ mb: 2 }}
            >
              <ul style={{ marginTop: 0, paddingLeft: '20px' }}>
                <li>Replace Landing Page</li>
                <li>New Feature: Bulk Edit for Transactions</li>
                <li>User Settings Page</li>
                <li>Account Settings</li>
                <li>Enhance Security: Encrypt Data</li>
                <li>Fix File Loading</li>
                <li>
                  Add Clear Button and Adjust Width of Filter Text Box in Ledger
                  View
                </li>
                <li>
                  Data Refactor (Unified Store, Cutover to new data format,
                  Cleanup &amp; removal of deprecated format)
                </li>
                <li>Remove footer from ledger view</li>
                <li>Convert Amounts to Integer Minor Units</li>
                <li>
                  Change saved file extension to <code>.json</code>
                </li>
                <li>Remove the release message from v2</li>
              </ul>
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
}
