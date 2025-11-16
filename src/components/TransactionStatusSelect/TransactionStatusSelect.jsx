import { FormControl, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions, constants } from '@/store/transactions';

const getStatusColor = (status) => {
  switch (status) {
    case constants.TransactionStatusEnum.COMPLETE:
      return {
        color: 'success.main',
        bgcolor: 'success.light',
        borderColor: 'success.main',
      };
    case constants.TransactionStatusEnum.PENDING:
      return {
        color: 'warning.main',
        bgcolor: 'warning.light',
        borderColor: 'warning.main',
      };
    case constants.TransactionStatusEnum.PLANNED:
      return {
        color: 'info.main',
        bgcolor: 'info.light',
        borderColor: 'info.main',
      };
    case constants.TransactionStatusEnum.SCHEDULED:
      return {
        color: 'secondary.main',
        bgcolor: 'secondary.light',
        borderColor: 'secondary.main',
      };
    default:
      return {
        color: 'text.primary',
        bgcolor: 'background.paper',
        borderColor: 'divider',
      };
  }
};

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

  const statusColors = getStatusColor(status);

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
        sx={{
          textTransform: 'capitalize',
          color: statusColors.color,
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        {Object.keys(constants.TransactionStatusEnum).map((key) => {
          return (
            <MenuItem
              key={key}
              value={constants.TransactionStatusEnum[key]}
              sx={{
                textTransform: 'capitalize',
              }}
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
