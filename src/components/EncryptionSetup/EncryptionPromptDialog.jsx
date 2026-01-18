import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';

export default function EncryptionPromptDialog({
  open,
  onEncryptNow,
  onRemindLater,
  onDismiss,
}) {
  return (
    <Dialog open={open} maxWidth='sm' fullWidth>
      <DialogTitle>Secure Your Data with Encryption</DialogTitle>
      <DialogContent>
        <Typography variant='body1' sx={{ mb: 2 }}>
          Your ledger data is currently stored without encryption. We recommend
          enabling encryption to protect your financial information.
        </Typography>

        <Alert severity='info' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            <strong>What happens when you enable encryption:</strong>
          </Typography>
          <Typography variant='body2' component='ul' sx={{ mt: 1, mb: 0 }}>
            <li>All your data will be encrypted with a secure password</li>
            <li>
              You&apos;ll need to enter your password when you open the app
            </li>
            <li>
              Your data will be protected with military-grade AES-256 encryption
            </li>
            <li>Data stays on your device - nothing is sent to a server</li>
          </Typography>
        </Alert>

        <Alert severity='warning' sx={{ mb: 1 }}>
          <Typography variant='body2'>
            <strong>Note:</strong> In a future update, encryption will become
            mandatory for all users.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onDismiss} color='inherit'>
          Dismiss
        </Button>
        <Button onClick={onRemindLater}>Remind Me Later</Button>
        <Button onClick={onEncryptNow} variant='contained' color='primary'>
          Encrypt Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EncryptionPromptDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onEncryptNow: PropTypes.func.isRequired,
  onRemindLater: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
