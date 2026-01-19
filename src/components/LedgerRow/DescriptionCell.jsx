import { Box, Button, TableCell, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions, constants } from '@/store/transactions';
import { Cancel, Check } from '@mui/icons-material';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function DescriptionCell({ transaction }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const inputRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [description, setDescription] = useState(transaction.description);

  const handleSave = () => {
    dispatch(
      actions.updateTransactionProperty(
        accountId,
        transaction,
        constants.TransactionFields.DESCRIPTION,
        description,
      ),
    );
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

  const buttonStyle = { height: '35px', width: '50px', marginLeft: '8px' };

  return (
    <TableCell sx={LEDGER_COLUMN_STYLES.description}>
      {edit ? (
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            variant='filled'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={handleKeyPress}
            inputRef={inputRef}
            sx={{
              width: '100%',
              '.MuiFilledInput-root': {
                height: '30px',
                paddingBottom: '8px',
              },
            }}
          />
          <Button variant='contained' style={buttonStyle} onClick={handleSave}>
            <Check />
          </Button>
          <Button variant='outlined' style={buttonStyle} onClick={handleCancel}>
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
