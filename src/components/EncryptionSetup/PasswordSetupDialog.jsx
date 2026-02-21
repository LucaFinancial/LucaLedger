import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { generateSecurePassword } from '@/crypto/encryption';

export default function PasswordSetupDialog({ open, onComplete, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start countdown
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

  // Cleanup timer on unmount
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

  const handleSubmit = () => {
    onComplete(password);
  };

  const isValid = () => {
    if (password.length < 8) return false;
    if (password !== confirmPassword) return false;
    // If generated password, must be copied before enabling
    if (isGenerated && !passwordCopied) return false;
    return true;
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>Set Up Encryption Password</DialogTitle>
      <DialogContent>
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            <strong>Important:</strong> If you forget your password, your data
            cannot be recovered. Please store it in a secure password manager.
          </Typography>
        </Alert>

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
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)}>
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
          error={confirmPassword.length > 0 && password !== confirmPassword}
          helperText={
            confirmPassword.length > 0 && password !== confirmPassword
              ? 'Passwords do not match'
              : ''
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
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
          onClick={handleSubmit}
          variant='contained'
          disabled={!isValid()}
        >
          {isGenerated && !passwordCopied && countdown === 0
            ? 'Copy Password to Enable'
            : isGenerated && passwordCopied && countdown > 0
              ? `Enable in ${countdown}s`
              : 'Enable Encryption'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PasswordSetupDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
