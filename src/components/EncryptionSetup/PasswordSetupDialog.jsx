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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { generateSecurePassword } from '@/crypto/encryption';

export default function PasswordSetupDialog({ open, onComplete, onCancel }) {
  const [useGenerated, setUseGenerated] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(
    generateSecurePassword()
  );
  const [customPassword, setCustomPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateNew = () => {
    setGeneratedPassword(generateSecurePassword());
    setCopied(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    const password = useGenerated ? generatedPassword : customPassword;

    if (!useGenerated && customPassword !== confirmPassword) {
      return; // Passwords don't match
    }

    onComplete(password, stayLoggedIn);
  };

  const isValid = () => {
    if (useGenerated) {
      return true;
    }
    return customPassword.length >= 8 && customPassword === confirmPassword;
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Set Up Encryption Password</DialogTitle>
      <DialogContent>
        <Alert
          severity='warning'
          sx={{ mb: 2 }}
        >
          <Typography variant='body2'>
            <strong>Important:</strong> If you forget your password, your data
            cannot be recovered. Please store it in a secure password manager.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Button
            variant={useGenerated ? 'contained' : 'outlined'}
            onClick={() => setUseGenerated(true)}
            sx={{ mr: 1 }}
          >
            Generate Secure Password
          </Button>
          <Button
            variant={!useGenerated ? 'contained' : 'outlined'}
            onClick={() => setUseGenerated(false)}
          >
            Use My Own Password
          </Button>
        </Box>

        {useGenerated ? (
          <Box>
            <Typography
              variant='body2'
              sx={{ mb: 1 }}
            >
              A secure password has been generated for you. Please copy and save
              it in a password manager.
            </Typography>
            <TextField
              fullWidth
              value={generatedPassword}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <IconButton
                      onClick={handleCopyPassword}
                      color={copied ? 'success' : 'default'}
                    >
                      <ContentCopy />
                    </IconButton>
                    <IconButton onClick={handleGenerateNew}>
                      <Refresh />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {copied && (
              <Typography
                variant='caption'
                color='success.main'
              >
                Password copied to clipboard!
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label='Password'
              type={showPassword ? 'text' : 'password'}
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
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
              error={
                confirmPassword.length > 0 && customPassword !== confirmPassword
              }
              helperText={
                confirmPassword.length > 0 && customPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
          }
          label='Stay logged in for 14 days'
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!isValid()}
        >
          Enable Encryption
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
