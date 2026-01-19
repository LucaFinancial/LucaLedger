/**
 * Welcome/Landing Page Component
 * Public-facing welcome page for unauthenticated users
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '@/auth';
import { version } from '../../../package.json';
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema';

export default function Welcome() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login } = useAuth();

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          pt: 6,
          pb: 12,
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4} alignItems='center'>
            {/* Header row - in-flow title */}
            <Grid item xs={12}>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                align='center'
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: { xs: '2.4rem', md: '2.8rem', lg: '3.5rem' },
                  mb: { xs: 0.5, md: 1 },
                }}
              >
                Luca Ledger
              </Typography>
            </Grid>
            {/* Left side - Hero Text */}
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component='h1'
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 2,
                }}
              >
                Take Control of Your Finances
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Luca Ledger is a secure, privacy-first personal finance
                application that keeps your financial data completely under your
                control.
              </Typography>

              {/* Feature highlights */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon sx={{ color: 'white' }} />
                  <Typography variant='body1' sx={{ color: 'white' }}>
                    Bank-grade AES-256 encryption
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DevicesIcon sx={{ color: 'white' }} />
                  <Typography variant='body1' sx={{ color: 'white' }}>
                    Works completely offline
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon sx={{ color: 'white' }} />
                  <Typography variant='body1' sx={{ color: 'white' }}>
                    Your data never leaves your device
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Login Form or CTA */}
            <Grid item xs={12} md={6}>
              {isMobile ? (
                // Mobile: Show simple CTAs
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant='contained'
                    size='large'
                    fullWidth
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant='outlined'
                    size='large'
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              ) : (
                // Desktop: Show inline login form
                <Paper elevation={8} sx={{ p: 4, borderRadius: 2 }}>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      textAlign: 'center',
                    }}
                  >
                    Sign In
                  </Typography>

                  {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleLogin}>
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
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
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
                      sx={{ mb: 2 }}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Don&apos;t have an account?
                    </Typography>
                    <Button
                      variant='text'
                      onClick={() => navigate('/register')}
                      startIcon={<PersonAddIcon />}
                      sx={{ mt: 1 }}
                    >
                      Create New Account
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Typography
          variant='h3'
          component='h2'
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 2,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Powerful Features
        </Typography>
        <Typography
          variant='h6'
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 6,
          }}
        >
          Everything you need to manage your finances effectively
        </Typography>

        <Grid container spacing={4}>
          {/* Transaction Categories */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderLeft: '4px solid',
                borderColor: '#2196f3',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1565c0', mb: 2 }}
              >
                📊 Transaction Categories
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Organize your finances with custom categories and subcategories.
                Track spending by category and gain insights into where your
                money goes.
              </Typography>
            </Paper>
          </Grid>

          {/* Encryption */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderLeft: '4px solid',
                borderColor: '#4caf50',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#2e7d32', mb: 2 }}
              >
                🔒 Enhanced Security
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Data encryption at rest with industry standard AES-256
                encryption. Your financial data is protected with the same
                encryption used by banks and government agencies.
              </Typography>
            </Paper>
          </Grid>

          {/* Multiple Accounts */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderLeft: '4px solid',
                borderColor: '#9c27b0',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#7b1fa2', mb: 2 }}
              >
                💳 Multiple Account Support
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Track checking, savings, and credit card accounts all in one
                place. Get a complete view of your financial picture across all
                your accounts.
              </Typography>
            </Paper>
          </Grid>

          {/* Analytics */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                borderLeft: '4px solid',
                borderColor: '#ff5722',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#d84315', mb: 2 }}
              >
                📈 Analytics & Insights
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Powerful analytics tools to track spending patterns across
                categories. Visualize your expenses with interactive charts and
                make data-driven financial decisions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Privacy & Security Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 2,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Privacy First
          </Typography>
          <Typography
            variant='h6'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 6,
            }}
          >
            Your financial data stays completely under your control
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
                <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                  Bank-Grade Encryption
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  AES-256 encryption protects your data with the same security
                  standard used by financial institutions worldwide.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <DevicesIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                  Completely Offline
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Once loaded, works entirely offline. No internet required, no
                  data transmission, complete privacy.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <LockIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
                <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                  Local Storage Only
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Your data never leaves your device. No servers, no cloud sync,
                  no third-party access.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          py: 8,
        }}
      >
        <Container maxWidth='md'>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant='h3'
              component='h2'
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 2,
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
              }}
            >
              Create your free account and take control of your finances today
            </Typography>
            <Button
              variant='contained'
              size='large'
              onClick={() => navigate('/register')}
              startIcon={<PersonAddIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
            >
              Create Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#263238',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                Luca Ledger
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                A secure, privacy-first personal finance application for
                tracking your expenses.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    justifyContent: 'flex-start',
                  }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    justifyContent: 'flex-start',
                  }}
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 4,
              pt: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}
            >
              © {new Date().getFullYear()} Luca Ledger. All rights reserved.
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                display: 'block',
                mt: 1,
              }}
            >
              App v{version} • Schema v{CURRENT_SCHEMA_VERSION}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
