import { Typography, Button, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';

import { version } from '../../../package.json';

const STORAGE_KEY = 'announcementBannerDismissed_v2';

export default function VersionDisplay() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleVersionClick = () => {
    // Toggle the announcement banner dismissal state
    const currentState = localStorage.getItem(STORAGE_KEY) === 'true';
    if (currentState) {
      // Currently dismissed, so show it
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Currently shown, so dismiss it
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    // Reload the page to reflect the change immediately
    window.location.reload();
  };

  const tooltipText = isDismissed ? 'show notification' : 'hide notification';

  return (
    <Tooltip
      title={tooltipText}
      arrow
    >
      <Button
        onClick={handleVersionClick}
        sx={{
          color: 'white',
          position: 'absolute',
          bottom: '0',
          right: '15px',
          minWidth: 'auto',
          padding: 0,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
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
      </Button>
    </Tooltip>
  );
}
