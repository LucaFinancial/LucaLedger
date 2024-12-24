import {
  AppBar,
  Box,
  Container,
  Link,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography
            variant='h6'
            component={RouterLink}
            to='/'
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            Luca Ledger
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              component={RouterLink}
              to='/'
              color='inherit'
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to='/dashboard'
              color='inherit'
            >
              Dashboard
            </Link>
            <Link
              component={RouterLink}
              to='/transactions'
              color='inherit'
            >
              Transactions
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        component='main'
        sx={{ flex: 1, py: 4 }}
      >
        <Outlet />
      </Container>

      <Box
        component='footer'
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth='sm'>
          <Typography
            variant='body2'
            color='text.secondary'
            align='center'
          >
            © {new Date().getFullYear()} Luca Ledger. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default RootLayout;
