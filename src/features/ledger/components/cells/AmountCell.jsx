import {
  Button,
  InputAdornment,
  TableCell,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  doublePrecisionFormatString,
  parseFloatDoublePrecision,
} from '@/utils';

import { actions } from '@/store/transactions';

import { Cancel, Check } from '@mui/icons-material';

export default function AmountCell({ transaction }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(
    parseFloatDoublePrecision(transaction.amount)
  );

  const validNumberRegex = /^-?\d+(\.\d{1,2})?$|^-?\.\d{1,2}$|^-?\d+\.$|^-?$/;

  const handleChange = (event) => {
    const { value } = event.target;
    if (value === '-') {
      setValue(value);
    } else if (value === '') {
      setValue(value);
    } else if (validNumberRegex.test(value)) {
      setValue(value);
    }
  };

  const handleSave = () => {
    let newValue = value;
    if (newValue === '') {
      newValue = 0;
    } else if (newValue === '-') {
      newValue = 0;
    }
    if (validNumberRegex.test(newValue)) {
      newValue = parseFloatDoublePrecision(newValue);
      const newTransaction = { ...transaction, amount: newValue };
      dispatch(actions.updateTransactionById(transaction.id, newTransaction));
      setEdit(false);
    }
  };

  const handleCancel = () => {
    setValue(parseFloatDoublePrecision(transaction.amount));
    setEdit(false);
  };

  const handleEdit = () => {
    if (value === 0) setValue('');
    setEdit(true);
    setTimeout(() => {
      inputRef.current.focus();
    }, 0);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <TableCell style={{ cursor: 'pointer', width: '200px' }}>
      {edit ? (
        <>
          <TextField
            variant='filled'
            type='text'
            value={value}
            inputRef={inputRef}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            inputProps={{ step: '0.01' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>$</InputAdornment>
              ),
            }}
          />
          <Button
            variant='contained'
            width='100px'
            height='30px'
            onClick={handleSave}
          >
            <Check />
          </Button>
          <Button
            variant='outlined'
            width='100px'
            height='30px'
            onClick={handleCancel}
          >
            <Cancel />
          </Button>
        </>
      ) : (
        <Typography
          variant='body1'
          onClick={handleEdit}
        >
          $ {doublePrecisionFormatString(transaction.amount)}
        </Typography>
      )}
    </TableCell>
  );
}

AmountCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
