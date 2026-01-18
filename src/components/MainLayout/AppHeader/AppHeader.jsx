import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import NavItem from './NavItem';
import { useAuth } from '@/auth';

import {
  Home as HomeIcon,
  HelpOutline as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

export default function AppHeader() {
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
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
          <NavItem linkTo='/dashboard' navText='Dashboard' />
          <NavItem linkTo='/accounts' navText='Accounts' />
          <NavItem linkTo='/categories' navText='Categories' />
        </Box>
        <Typography variant='h4' sx={{ flexGrow: 1, textAlign: 'center' }}>
          Luca Ledger
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentUser && (
            <Typography variant='body2' sx={{ color: 'white', mr: 1 }}>
              {currentUser.username}
            </Typography>
          )}
          <Tooltip title='Help'>
            <IconButton
              component={Link}
              to='/help'
              aria-label='Help'
              sx={{ color: 'white' }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Settings'>
            <IconButton
              component={Link}
              to='/settings'
              aria-label='Settings'
              sx={{ color: 'white' }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Logout'>
            <IconButton
              onClick={handleLogout}
              aria-label='Logout'
              sx={{ color: 'white' }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
