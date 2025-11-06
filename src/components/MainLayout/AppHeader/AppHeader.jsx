import { AppBar, Toolbar, Typography } from '@mui/material';

export default function AppHeader() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography
          variant='h4'
          sx={{ flexGrow: 1, textAlign: 'center' }}
        >
          Luca Ledger
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
