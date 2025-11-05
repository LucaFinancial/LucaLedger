import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import NavItem from './NavItem';

import { Home as HomeIcon } from '@mui/icons-material';

export default function AppHeader() {
  return (
    <AppBar position='static'>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to='/'>
            <HomeIcon
              sx={{
                fontSize: '3rem',
                color: 'white',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            />
          </Link>
          <NavItem
            linkTo='/accounts'
            navText='Accounts'
          />
        </Box>
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
