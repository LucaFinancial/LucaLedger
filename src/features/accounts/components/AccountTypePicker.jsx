import { Box, InputLabel, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions, enums } from '@/store/accounts';

export default function AccountTypePicker({ account }) {
  const [type, setType] = useState(account.type);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const { value } = event.target;
    setType(value);
    if (value === enums.AccountType.CREDIT_CARD) {
      const updatedAccount = { ...account, type: value, statementDay: 1 };
      dispatch(actions.updateAccount(updatedAccount));
    } else {
      dispatch(
        actions.updateAccountProperty(account, enums.AccountFields.TYPE, value)
      );
    }
  };

  return (
    <Box>
      <InputLabel id='account-type-label'>Account Type</InputLabel>
      <Select
        labelId='account-type-label'
        id='account-type'
        value={type}
        label='Account Type'
        onChange={handleChange}
        style={{ width: '150px' }}
      >
        {Object.keys(enums.AccountType).map((key) => (
          <MenuItem
            key={key}
            value={enums.AccountType[key]}
          >
            {enums.AccountType[key]}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

AccountTypePicker.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};
