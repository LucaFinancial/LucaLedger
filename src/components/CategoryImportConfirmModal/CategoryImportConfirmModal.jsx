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

export default function CategoryImportConfirmModal({
  open,
  onConfirm,
  onCancel,
  categoriesCount,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>Import Categories</DialogTitle>
      <DialogContent>
        <Typography variant='body1' sx={{ mb: 2 }}>
          This file contains {categoriesCount} categor
          {categoriesCount === 1 ? 'y' : 'ies'}. Do you want to overwrite your
          existing categories with the categories from this file?
        </Typography>

        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            <strong>This action will:</strong>
          </Typography>
          <Typography
            variant='body2'
            component='ul'
            sx={{ mt: 1, mb: 0, pl: 2 }}
          >
            <li>Replace all your current categories with the imported ones</li>
            <li>Cannot be undone once confirmed</li>
            <li>May affect existing transaction categorization</li>
          </Typography>
        </Alert>

        <Typography variant='body2' color='text.secondary'>
          Choose &quot;Import Categories&quot; to replace your current
          categories, or &quot;Keep Current&quot; to keep your existing
          categories and skip the import.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Keep Current</Button>
        <Button onClick={onConfirm} variant='contained' color='warning'>
          Import Categories
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryImportConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  categoriesCount: PropTypes.number.isRequired,
};
