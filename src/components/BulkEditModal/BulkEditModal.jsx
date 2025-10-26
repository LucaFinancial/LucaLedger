import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { constants } from '@/store/transactions';

export default function BulkEditModal({
  open,
  onClose,
  selectedCount,
  onApplyChanges,
}) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialState, setInitialState] = useState({ status: '', date: null });

  const handleClose = () => {
    setSelectedState('');
    setSelectedDate(null);
    setInitialState({ status: '', date: null });
    onClose();
  };

  const handleApply = () => {
    const updates = {};

    // Only include status if it was changed
    if (selectedState && selectedState !== initialState.status) {
      updates.status = selectedState;
    }

    // Only include date if it was changed and is valid
    if (
      selectedDate &&
      selectedDate.isValid() &&
      selectedDate !== initialState.date
    ) {
      updates.date = selectedDate;
    }

    // Only apply if at least one field was changed
    if (Object.keys(updates).length > 0) {
      onApplyChanges(updates);
    }

    setSelectedState('');
    setSelectedDate(null);
    setInitialState({ status: '', date: null });
  };

  return (
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
            {Object.keys(constants.TransactionStatusEnum).map((key) => (
              <MenuItem
                key={key}
                value={constants.TransactionStatusEnum[key]}
              >
                {constants.TransactionStatusEnum[key]}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant='contained'
          disabled={!selectedState && !selectedDate}
        >
          Change All
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BulkEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCount: PropTypes.number.isRequired,
  onApplyChanges: PropTypes.func.isRequired,
};
