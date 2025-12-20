/**
 * Login Page Component
 * Standalone login page with enhanced branding and navigation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Navigation will be handled by AuthScreen/ProtectedRoute
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        p: 2,
      }}
    >
      <Container maxWidth='sm'>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant='h4'
              component='h1'
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Luca Ledger
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
            >
              Sign in to access your accounts
            </Typography>
          </Box>

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete='username'
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label='Password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type='submit'
              variant='contained'
              fullWidth
              size='large'
              disabled={isLoading || !username || !password}
              startIcon={<LoginIcon />}
              sx={{ mb: 3 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box
            sx={{ textAlign: 'center', borderTop: '1px solid #e0e0e0', pt: 3 }}
          >
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mb: 2 }}
            >
              Don&apos;t have an account?
            </Typography>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => navigate('/register')}
              startIcon={<PersonAddIcon />}
              sx={{ mb: 2 }}
            >
              Create New Account
            </Button>
            <Button
              variant='text'
              fullWidth
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              size='small'
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
