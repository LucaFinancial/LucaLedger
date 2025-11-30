/**
 * Registration Component
 * Handles new user registration with password warnings
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  ContentCopy,
  Refresh,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '@/auth';
import { generateSecurePassword } from '@/crypto/encryption';

export default function RegisterForm({ onSwitchToLogin, showBackToLogin }) {
  const { register, isUsernameAvailable } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
    setIsGenerated(true);
    setPasswordCopied(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setCountdown(10);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPasswordCopied(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handlePasswordChange = (value) => {
    setPassword(value);
    setIsGenerated(false);
    setPasswordCopied(false);
  };

  // Check username availability on change
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      return;
    }

    const checkUsername = async () => {
      const available = await isUsernameAvailable(username);
      setUsernameError(available ? '' : 'Username already in use');
    };

    const timeoutId = setTimeout(checkUsername, 300);
    return () => clearTimeout(timeoutId);
  }, [username, isUsernameAvailable]);

  const isValid = () => {
    if (!username || username.length < 3) return false;
    if (usernameError) return false;
    if (password.length < 8) return false;
    if (password !== confirmPassword) return false;
    if (isGenerated && !passwordCopied) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 450,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
            variant='body2'
            color='text.secondary'
          >
            Create a new account to get started
          </Typography>
        </Box>

        <Alert
          severity='warning'
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant='body2'>
            <strong>Important:</strong> Your password cannot be recovered if
            lost. All your financial data is encrypted with your password and
            stored only on this device.
          </Typography>
        </Alert>

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
            error={!!usernameError}
            helperText={usernameError || 'Minimum 3 characters'}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant='outlined'
              onClick={handleGeneratePassword}
              startIcon={<Refresh />}
              fullWidth
            >
              Generate Secure Password
            </Button>
          </Box>

          <TextField
            fullWidth
            label='Password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            autoComplete='new-password'
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
            helperText='Minimum 8 characters'
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label='Confirm Password'
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete='new-password'
            required
            error={confirmPassword.length > 0 && password !== confirmPassword}
            helperText={
              confirmPassword.length > 0 && password !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {isGenerated && password && (
              <Button
                onClick={handleCopyPassword}
                startIcon={<ContentCopy />}
                color={passwordCopied ? 'success' : 'primary'}
                variant='outlined'
              >
                {passwordCopied ? 'Copied!' : 'Copy Password'}
              </Button>
            )}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              size='large'
              disabled={isLoading || !isValid()}
              startIcon={<PersonAddIcon />}
            >
              {isLoading
                ? 'Creating...'
                : isGenerated && !passwordCopied && countdown === 0
                ? 'Copy Password to Enable'
                : isGenerated && passwordCopied && countdown > 0
                ? `Create in ${countdown}s`
                : 'Create Account'}
            </Button>
          </Box>
        </form>

        {showBackToLogin && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Already have an account?{' '}
              <Link
                component='button'
                variant='body2'
                onClick={onSwitchToLogin}
                sx={{ cursor: 'pointer' }}
              >
                <LoginIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                />
                Sign in
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

RegisterForm.propTypes = {
  onSwitchToLogin: PropTypes.func,
  showBackToLogin: PropTypes.bool,
};

RegisterForm.defaultProps = {
  onSwitchToLogin: () => {},
  showBackToLogin: false,
};
