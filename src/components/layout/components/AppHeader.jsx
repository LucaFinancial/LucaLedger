import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import NavItems from './NavItems';
import VersionDisplay from './VersionDisplay';

export default function AppHeader() {
  return (
    <AppBar position='static'>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NavItems />
        </Box>
        <Typography
          variant='h5'
          sx={{ flexGrow: 1, textAlign: 'center' }}
        >
          Luca Ledger
        </Typography>
        <VersionDisplay />
      </Toolbar>
    </AppBar>
  );
}
