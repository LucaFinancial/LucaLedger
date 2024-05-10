import { Box, Button, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions, enums } from '@/store/accounts';

import { Cancel as CancelIcon, Check as SaveIcon } from '@mui/icons-material';

export default function AccountNameEdit({ account, setIsEditing }) {
  const [name, setName] = useState(account.name);
  const dispatch = useDispatch();

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCancel = () => {
    setName(account.name);
    setIsEditing(false);
  };

  const handleSave = () => {
    dispatch(
      actions.updateAccountProperty(account, enums.AccountFields.NAME, name)
    );
    setIsEditing(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TextField
        value={name}
        onChange={handleNameChange}
        onKeyDown={handleKeyPress}
      />
      <Button onClick={handleSave}>
        <SaveIcon />
      </Button>
      <Button onClick={handleCancel}>
        <CancelIcon />
      </Button>
    </Box>
  );
}

AccountNameEdit.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setIsEditing: PropTypes.func.isRequired,
};
