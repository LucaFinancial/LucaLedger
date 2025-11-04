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

export default function CategoryDeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
  categoryName,
  isSubcategory = false,
}) {
  const itemType = isSubcategory ? 'subcategory' : 'category';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color='warning' />
        Delete {isSubcategory ? 'Subcategory' : 'Category'}
      </DialogTitle>

      <DialogContent>
        <Alert
          severity='warning'
          sx={{ mb: 2 }}
        >
          This action cannot be undone!
        </Alert>

        <Typography
          variant='body1'
          sx={{ mb: 2 }}
        >
          Are you sure you want to delete{' '}
          {categoryName ? (
            <Box
              component='span'
              sx={{ fontWeight: 'bold' }}
            >
              &quot;{categoryName}&quot;
            </Box>
          ) : (
            `this ${itemType}`
          )}
          ?
        </Typography>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 1 }}
        >
          This will:
        </Typography>
        <Box
          component='ul'
          sx={{ ml: 2, mt: 0 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            component='li'
          >
            Permanently remove the {itemType} from your system
          </Typography>
          {!isSubcategory && (
            <Typography
              variant='body2'
              color='text.secondary'
              component='li'
            >
              Delete all subcategories within this category
            </Typography>
          )}
          <Typography
            variant='body2'
            color='text.secondary'
            component='li'
          >
            Leave transactions with invalid category references (transactions
            will keep their category assignments, but they will be marked as
            invalid)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='error'
        >
          Delete {isSubcategory ? 'Subcategory' : 'Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryDeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  categoryName: PropTypes.string,
  isSubcategory: PropTypes.bool,
};
