import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

export default function CategoryResetConfirmModal({
  open,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color='warning' />
        Reset Categories
      </DialogTitle>

      <DialogContent>
        <Alert severity='warning' sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>

        <Typography variant='body1' sx={{ mb: 2 }}>
          Are you sure you want to reset all categories to the default set?
        </Typography>

        <Box sx={{ pl: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            This will:
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            component='ul'
            sx={{ ml: 2 }}
          >
            <li>Delete all your custom categories</li>
            <li>Restore the original default categories</li>
            <li>Remove any custom subcategories you&apos;ve created</li>
          </Typography>
        </Box>

        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          Your transaction data will not be affected, but transactions may lose
          their category assignments.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant='contained' color='warning'>
          Reset Categories
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryResetConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
