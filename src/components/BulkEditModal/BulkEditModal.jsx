import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isValid } from 'date-fns';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { constants } from '@/store/transactions';
import CategorySelect from '@/components/CategorySelect';

export default function BulkEditModal({
  open,
  onClose,
  selectedCount,
  onApplyChanges,
  onDeleteTransactions,
}) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleClose = () => {
    setSelectedState('');
    setSelectedDate(null);
    setSelectedCategory(null);
    onClose();
  };

  const handleApply = () => {
    const updates = {};

    // Only include status if it was set
    if (selectedState) {
      updates.status = selectedState;
    }

    // Only include date if it was set and is valid
    if (selectedDate && isValid(selectedDate)) {
      updates.date = selectedDate;
    }

    // Only include category if it was set
    if (selectedCategory) {
      updates.categoryId = selectedCategory;
    }

    // Only apply if at least one field was set
    if (Object.keys(updates).length > 0) {
      onApplyChanges(updates);
    }

    setSelectedState('');
    setSelectedDate(null);
    setSelectedCategory(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    onDeleteTransactions();
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          Edit {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
        </DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            sx={{ mt: 2 }}
          >
            <InputLabel id='bulk-edit-state-label'>Select new state</InputLabel>
            <Select
              labelId='bulk-edit-state-label'
              id='bulk-edit-state-select'
              value={selectedState}
              label='Select new state'
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {Object.keys(constants.TransactionStateEnum).map((key) => (
                <MenuItem
                  key={key}
                  value={constants.TransactionStateEnum[key]}
                >
                  {constants.TransactionStateEnum[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            sx={{ mt: 3 }}
          >
            <Typography sx={{ mb: 1 }}>Select new date</Typography>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </FormControl>
          <FormControl
            fullWidth
            sx={{ mt: 3 }}
          >
            <Typography sx={{ mb: 1 }}>Select new category</Typography>
            <CategorySelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              fullWidth
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteClick}
            color='error'
            variant='outlined'
          >
            Delete Selected
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleApply}
              variant='contained'
              disabled={
                !selectedState &&
                (!selectedDate || !isValid(selectedDate)) &&
                !selectedCategory
              }
            >
              Change All
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCount} transaction
            {selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

BulkEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCount: PropTypes.number.isRequired,
  onApplyChanges: PropTypes.func.isRequired,
  onDeleteTransactions: PropTypes.func.isRequired,
};
