import { FormControl, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions, constants } from '@/store/transactionsLegacy';

export default function TransactionStatusSelect({ transaction }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [status, setStatus] = useState(transaction.status);

  useEffect(() => {
    setStatus(transaction.status);
  }, [transaction.status]);

  const handleChange = (event) => {
    const { value } = event.target;
    dispatch(
      actions.updateTransactionProperty(
        accountId,
        transaction,
        constants.TransactionFields.STATUS,
        value
      )
    );
    setStatus(value);
  };

  return (
    <FormControl
      sx={{
        width: '120px',
        '& .MuiInput-underline:before': {
          borderBottom: 'none',
        },
        '& .MuiInput-underline:after': {
          borderBottom: 'none',
        },
      }}
      variant='standard'
      fullWidth
    >
      <Select
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={status}
        label='Status'
        onChange={handleChange}
      >
        {Object.keys(constants.TransactionStatusEnum).map((key) => {
          return (
            <MenuItem
              key={key}
              value={constants.TransactionStatusEnum[key]}
            >
              {constants.TransactionStatusEnum[key]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

TransactionStatusSelect.propTypes = {
  transaction: PropTypes.object.isRequired,
};
