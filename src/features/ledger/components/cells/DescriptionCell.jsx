import { Box, Button, TableCell, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/transactions';

import { Cancel, Check } from '@mui/icons-material';

export default function DescriptionCell({ transaction }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [description, setDescription] = useState(transaction.description);

  const handleSave = () => {
    const newTransaction = { ...transaction, description };
    dispatch(actions.updateTransactionById(transaction.id, newTransaction));
    setEdit(false);
  };

  const handleCancel = () => {
    setDescription(transaction.description);
    setEdit(false);
  };

  const handleEdit = () => {
    if (description === 'Enter transaction description') {
      setDescription('');
    }
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

  const buttonStyle = { height: '40px', width: '75px' };

  return (
    <TableCell style={{ width: '500px' }}>
      {edit ? (
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            variant='filled'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={handleKeyPress}
            inputRef={inputRef}
          />
          <Button
            variant='contained'
            style={buttonStyle}
            onClick={handleSave}
          >
            <Check />
          </Button>
          <Button
            variant='outlined'
            style={buttonStyle}
            onClick={handleCancel}
          >
            <Cancel />
          </Button>
        </Box>
      ) : (
        <Typography
          variant='body1'
          style={{ cursor: 'pointer' }}
          onClick={handleEdit}
        >
          {transaction.description === ''
            ? 'Enter description here'
            : transaction.description}
        </Typography>
      )}
    </TableCell>
  );
}

DescriptionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
