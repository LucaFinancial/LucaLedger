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
} from '@mui/material';
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

  const handleClose = () => {
    setSelectedState('');
    onClose();
  };

  const handleApply = () => {
    onApplyChanges(selectedState);
    setSelectedState('');
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant='contained'
          disabled={!selectedState}
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
