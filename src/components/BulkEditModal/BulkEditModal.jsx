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
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions, constants } from '@/store/transactionsLegacy';

export default function BulkEditModal({
  open,
  onClose,
  selectedTransactions,
  onClearSelection,
}) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [newStatus, setNewStatus] = useState('');

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleChangeAll = () => {
    if (!newStatus) return;

    // Update all selected transactions
    selectedTransactions.forEach((transaction) => {
      dispatch(
        actions.updateTransactionProperty(
          accountId,
          transaction,
          constants.TransactionFields.STATUS,
          newStatus
        )
      );
    });

    // Clear selection and close modal
    onClearSelection();
    setNewStatus('');
    onClose();
  };

  const handleCancel = () => {
    setNewStatus('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Edit Selected Transactions</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth
          sx={{ mt: 2 }}
        >
          <InputLabel id='bulk-status-select-label'>
            Select new state
          </InputLabel>
          <Select
            labelId='bulk-status-select-label'
            id='bulk-status-select'
            value={newStatus}
            label='Select new state'
            onChange={handleStatusChange}
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
        <Button
          onClick={handleCancel}
          variant='outlined'
        >
          Cancel
        </Button>
        <Button
          onClick={handleChangeAll}
          variant='contained'
          disabled={!newStatus}
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
  selectedTransactions: PropTypes.array.isRequired,
  onClearSelection: PropTypes.func.isRequired,
};
