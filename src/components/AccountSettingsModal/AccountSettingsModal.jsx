import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

export default function AccountSettingsModal({ open, onClose, account }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      aria-labelledby='account-settings-dialog-title'
    >
      <DialogTitle id='account-settings-dialog-title'>
        Account Settings
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            Account Information
          </Typography>
          <Typography variant='body1'>
            <strong>Name:</strong> {account.name}
          </Typography>
          <Typography variant='body1'>
            <strong>Type:</strong> {account.type}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}
          >
            Recommended Settings (Coming Soon)
          </Typography>
          <Typography
            variant='body2'
            sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}
          >
            These settings are placeholders and will be functional in a future
            update.
          </Typography>

          <FormControlLabel
            control={<Switch disabled />}
            label='Enable automatic categorization'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Send monthly statement reminders'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Show balance projections'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Enable spending alerts'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Auto-archive old transactions'
            sx={{ mb: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant='contained'
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AccountSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};
