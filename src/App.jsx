import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Provider } from 'react-redux';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

import { AuthProvider, useAuth } from '@/auth';
import { ProtectedRoute } from '@/components/Auth';
import MainLayout from '@/components/MainLayout/MainLayout';
import VersionProvider from '@/components/VersionProvider';
import EncryptionProvider from '@/components/EncryptionProvider';
import Welcome from '@/views/Welcome';
import Login from '@/views/Login';
import Register from '@/views/Register';
import store from '@/store';

// Component to handle authenticated redirect from root
function RootRedirect() {
  const { authState, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized) {
      if (authState === 'authenticated') {
        // Redirect authenticated users to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authState, isInitialized, navigate]);

  // Show Welcome page for unauthenticated users
  if (!isInitialized || authState === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (authState === 'authenticated') {
    return null; // Redirect will happen via useEffect
  }

  return <Welcome />;
}

// Component to handle public routes that redirect if authenticated
function PublicRoute({ children }) {
  const { authState, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && authState === 'authenticated') {
      navigate('/dashboard', { replace: true });
    }
  }, [authState, isInitialized, navigate]);

  if (!isInitialized || authState === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (authState === 'authenticated') {
    return null;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Provider store={store}>
        <AuthProvider>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path='/' element={<RootRedirect />} />
              <Route
                path='/login'
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path='/register'
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              {/* Protected routes */}
              <Route
                path='/*'
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
          <EncryptionProvider />
          <VersionProvider />
        </AuthProvider>
      </Provider>
    </LocalizationProvider>
  );
}
