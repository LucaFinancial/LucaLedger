import { Box, Typography, Link } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

export default function DeprecationBanner() {
  return (
    <Box
      sx={{
        backgroundColor: 'warning.main',
        color: 'warning.contrastText',
        py: 0.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        fontSize: '0.875rem',
      }}
    >
      <WarningIcon sx={{ fontSize: '1rem' }} />
      <Typography
        variant='body2'
        sx={{ fontWeight: 'medium' }}
      >
        Luca Ledger v1 shuts down December 27, 2025. Move to{' '}
        <Link
          href='https://lucaledger.app'
          target='_blank'
          rel='noopener noreferrer'
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            fontWeight: 'bold',
            '&:hover': {
              textDecoration: 'none',
            },
          }}
        >
          Version 2
        </Link>{' '}
        now to retain access.
      </Typography>
    </Box>
  );
}
