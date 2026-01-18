import { FormControl, MenuItem, Select, Chip } from '@mui/material';
import { Repeat } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions, constants } from '@/store/transactions';
import { LEDGER_STATUS_SELECT_WIDTH } from '@/components/LedgerTable/ledgerColumnConfig';

export default function TransactionStateSelect({
  transaction,
  isSelected,
  isVirtual,
}) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [status, setStatus] = useState(transaction.transactionState);

  useEffect(() => {
    setStatus(transaction.transactionState);
  }, [transaction.transactionState]);

  const handleChange = (event) => {
    const { value } = event.target;
    dispatch(
      actions.updateTransactionProperty(
        accountId,
        transaction,
        constants.TransactionFields.TRANSACTION_STATE,
        value,
      ),
    );
    setStatus(value);
  };

  // For virtual/recurring transactions, show a chip instead of a select
  if (isVirtual || status === 'recurring') {
    return (
      <Chip
        icon={<Repeat fontSize='small' />}
        label='Recurring'
        size='small'
        sx={{
          backgroundColor: 'secondary.light',
          color: 'secondary.contrastText',
          fontStyle: 'italic',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    );
  }

  return (
    <FormControl
      sx={{
        width: LEDGER_STATUS_SELECT_WIDTH,
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
          color: isSelected ? 'white' : 'inherit',
          '& .MuiSvgIcon-root': {
            color: isSelected ? 'white' : 'inherit',
          },
        }}
      >
        {Object.keys(constants.TransactionStateEnum).map((key) => {
          return (
            <MenuItem
              key={key}
              value={constants.TransactionStateEnum[key]}
              sx={{
                textTransform: 'capitalize',
              }}
            >
              {constants.TransactionStateEnum[key]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

TransactionStateSelect.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  isVirtual: PropTypes.bool,
};
