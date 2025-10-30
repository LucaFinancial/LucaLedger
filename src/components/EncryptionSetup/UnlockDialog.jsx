import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function UnlockDialog({ open, onUnlock, error }) {
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUnlock(password, stayLoggedIn);
  };

  return (
    <Dialog
      open={open}
      maxWidth='xs'
      fullWidth
      disableEscapeKeyDown
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Unlock Your Ledger</DialogTitle>
        <DialogContent>
          <Typography
            variant='body2'
            sx={{ mb: 2 }}
          >
            Enter your encryption password to access your data.
          </Typography>

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
            required
          />

          <Tooltip
            title='Keep you logged in while this browser tab remains open. You will need to enter your password again if you close the tab or browser.'
            arrow
            placement='top'
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                />
              }
              label='Stay logged in during this session'
              sx={{ mt: 2 }}
            />
          </Tooltip>
        </DialogContent>
        <DialogActions>
          <Button
            type='submit'
            variant='contained'
            disabled={!password}
            fullWidth
          >
            Unlock
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

UnlockDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onUnlock: PropTypes.func.isRequired,
  error: PropTypes.string,
};
