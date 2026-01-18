/**
 * Auth Screen Component
 * Main authentication screen that displays login or registration forms
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthScreen() {
  const { authState, setAuthState } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to main app when authenticated
  useEffect(() => {
    if (authState === 'authenticated') {
      // Redirect to the page they were trying to access, or default to home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [authState, navigate, location]);

  // Determine if we should show registration or login
  const shouldShowRegister = authState === 'no-users' || showRegister;

  if (authState === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
        <Typography variant='h6' sx={{ mt: 2, color: 'white' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (shouldShowRegister) {
    return (
      <RegisterForm
        onSwitchToLogin={() => {
          setShowRegister(false);
          if (authState === 'no-users') {
            // Can't switch to login if no users exist
            return;
          }
          setAuthState('login');
        }}
        showBackToLogin={authState !== 'no-users'}
      />
    );
  }

  return <LoginForm onSwitchToRegister={() => setShowRegister(true)} />;
}
