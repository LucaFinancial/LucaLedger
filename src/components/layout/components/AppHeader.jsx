import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import NavItems from './NavItems';
import VersionDisplay from './VersionDisplay';

import { Home as HomeIcon } from '@mui/icons-material';

export default function AppHeader() {
  return (
    <AppBar position='static'>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to='/'>
            <HomeIcon
              sx={{
                fontSize: '2rem',
                color: 'white',
                textDecoration: 'none',
              }}
            />
          </Link>
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
