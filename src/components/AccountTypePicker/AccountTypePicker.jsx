import { Box, InputLabel, MenuItem, Select } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { actions, constants, utils as accountUtils } from '@/store/accounts';

export default function AccountTypePicker({ account }) {
  const [type, setType] = useState(account.type);
  const dispatch = useDispatch();

  // Sync local state when account prop changes
  useEffect(() => {
    setType(account.type);
  }, [account.type]);

  const handleChange = (event) => {
    const { value } = event.target;
    setType(value);
    if (value === constants.AccountType.CREDIT_CARD) {
      const updatedAccount = {
        ...account,
        type: value,
        statementClosingDay: 1,
      };
      dispatch(actions.updateAccount(updatedAccount));
    } else {
      dispatch(
        actions.updateAccountProperty(
          account,
          constants.AccountFields.TYPE,
          value,
        ),
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
        renderValue={(value) => accountUtils.formatAccountType(value)}
        style={{ width: '150px' }}
      >
        {accountUtils
          .sortAccountTypes(constants.AccountTypeOptions)
          .map((accountType) => (
            <MenuItem key={accountType} value={accountType}>
              {accountUtils.formatAccountType(accountType)}
            </MenuItem>
          ))}
      </Select>
    </Box>
  );
}
