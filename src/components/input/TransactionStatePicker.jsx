import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '@/store/transactions';
import { TransactionStateEnum } from '@/store/constants';

export default function TransactionStatePicker({ transaction }) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(transaction.transactionState);

  const handleChange = (newStatus) => {
    setStatus(newStatus);
    dispatch(
      actions.updateTransactionById(transaction.id, {
        ...transaction,
        transactionState: newStatus,
      })
    );
  };

  return (
    <FormControl
      sx={{ width: '125px' }}
      variant='standard'
      fullWidth
    >
      <InputLabel id='demo-simple-select-label'>Status</InputLabel>
      <Select
        labelId='transaction-state-picker-label'
        id='transaction-state-picker'
        value={status}
        label='Status'
        onChange={(event) => handleChange(event.target.value)}
      >
        {Object.keys(TransactionStateEnum).map((key) => {
          return (
            <MenuItem
              key={key}
              value={TransactionStateEnum[key]}
            >
              {TransactionStateEnum[key]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

TransactionStatePicker.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    transactionState: PropTypes.string.isRequired,
  }).isRequired,
};
