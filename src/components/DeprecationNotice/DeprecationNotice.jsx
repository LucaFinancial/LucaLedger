import { Alert, Box, Button, Collapse, Typography } from '@mui/material';
import {
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors } from '@/store/accountsLegacy';

export default function DeprecationNotice() {
  const [expanded, setExpanded] = useState(false);
  const accounts = useSelector(selectors.selectAccounts);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleSaveData = () => {
    actions.saveAllAccounts(accounts);
  };

  return (
    <Alert
      severity='warning'
      icon={<WarningIcon />}
      sx={{
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <Box>
        <Typography
          variant='h6'
          component='div'
          sx={{ mb: 1, fontWeight: 'bold' }}
        >
          Version 1 is No Longer Maintained
        </Typography>
        <Typography
          variant='body2'
          sx={{ mb: 2 }}
        >
          Luca Ledger Version 1 has been deprecated and is no longer receiving
          updates or support. Please migrate to{' '}
          <a
            href='https://lucaledger.app'
            target='_blank'
            rel='noopener noreferrer'
            style={{ fontWeight: 'bold' }}
          >
            Version 2
          </a>{' '}
          to access the latest features and improvements.
        </Typography>

        <Button
          size='small'
          onClick={handleToggleExpand}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 1, mb: expanded ? 2 : 0 }}
        >
          {expanded ? 'Show Less' : 'Migration Instructions'}
        </Button>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              How to Migrate Your Data
            </Typography>
            <Typography
              variant='body2'
              component='div'
              sx={{ mb: 2 }}
            >
              <ol style={{ marginTop: 0, paddingLeft: '20px' }}>
                <li>
                  <strong>Export your data:</strong> Click the button below to
                  download your ledger data as a file.
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Button
                      variant='contained'
                      color='primary'
                      size='small'
                      startIcon={<DownloadIcon />}
                      onClick={handleSaveData}
                    >
                      Save All Accounts
                    </Button>
                  </Box>
                </li>
                <li>
                  <strong>Visit Version 2:</strong> Go to{' '}
                  <a
                    href='https://lucaledger.app'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    https://lucaledger.app
                  </a>
                </li>
                <li>
                  <strong>Import your data:</strong> In Version 2, use the
                  import function to load your saved file.
                </li>
                <li>
                  <strong>Verify:</strong> Check that all your accounts and
                  transactions have been migrated correctly.
                </li>
              </ol>
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
              If you encounter any issues during migration or have questions,
              please visit our{' '}
              <a
                href='https://github.com/LucaFinancial/LucaLedger/issues'
                target='_blank'
                rel='noopener noreferrer'
              >
                GitHub Issues
              </a>{' '}
              page or contact us through GitHub for support.
            </Typography>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}
            >
              Thank you for using Luca Ledger Version 1. We look forward to
              seeing you on Version 2!
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
}
