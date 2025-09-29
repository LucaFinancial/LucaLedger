import { Typography } from '@mui/material';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <Typography
        variant='body1'
        sx={{ textAlign: 'center' }}
      >
        &copy; {currentYear} JWAspin - Luca Ledger - All rights reserved
      </Typography>
    </footer>
  );
}
