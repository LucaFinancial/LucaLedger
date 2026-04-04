import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import NavItem from './NavItem';
import { useAuth } from '@/auth';

import {
  HelpOutline as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

export default function AppHeader() {
  const { logout, currentUser } = useAuth();
  const location = useLocation();

  const iconButtonSx = (isActive) => ({
    color: 'white',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
    boxShadow: isActive
      ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.28)'
      : 'none',
    '&:hover': {
      backgroundColor: isActive
        ? 'rgba(255, 255, 255, 0.24)'
        : 'rgba(255, 255, 255, 0.08)',
    },
  });

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            component={Link}
            to='/dashboard'
            variant='h4'
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Luca Ledger
          </Typography>
          <NavItem linkTo='/dashboard' navText='Dashboard' />
          <NavItem linkTo='/accounts' navText='Accounts' end={false} />
          <NavItem linkTo='/categories' navText='Categories' />
        </Box>
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
              sx={iconButtonSx(location.pathname.startsWith('/help'))}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Settings'>
            <IconButton
              component={Link}
              to='/settings'
              aria-label='Settings'
              sx={iconButtonSx(location.pathname.startsWith('/settings'))}
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
