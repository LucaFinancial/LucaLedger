/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { authState, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
        <Typography
          variant='h6'
          sx={{ mt: 2 }}
        >
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (authState !== 'authenticated') {
    return (
      <Navigate
        to='/login'
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
