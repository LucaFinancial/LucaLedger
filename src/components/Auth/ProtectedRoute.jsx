/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { authState, isInitialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to login when not authenticated
  useEffect(() => {
    if (isInitialized && authState !== 'authenticated') {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [authState, isInitialized, navigate, location]);

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
        <Typography variant='h6' sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Don't render children if not authenticated
  if (authState !== 'authenticated') {
    return null;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
