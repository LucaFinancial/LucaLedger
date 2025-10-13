import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/accountsLegacy';
import { constants } from '@/store/accounts';

export default function StatementDayInput({ account }) {
  const dispatch = useDispatch();
  const [statementDay, setStatementDay] = useState(account.statementDay || 1);

  if (account.type !== constants.AccountType.CREDIT_CARD) {
    return null;
  }

  const handleChange = (event) => {
    const { value } = event.target;
    let newValue = null;
    if (value === '') {
      newValue = 1;
    } else {
      newValue = parseInt(value);
    }
    if (newValue < 1) {
      newValue = 1;
    } else if (newValue > 28) {
      newValue = 28;
    }
    setStatementDay(newValue);
    dispatch(
      actions.updateAccountProperty(
        account,
        constants.AccountFields.STATEMENT_DAY,
        newValue
      )
    );
  };

  return (
    <Box>
      <TextField
        label='Statement Day'
        type='number'
        value={statementDay}
        onChange={handleChange}
        style={{ width: '150px' }}
      />
    </Box>
  );
}

StatementDayInput.propTypes = {
  account: PropTypes.shape({
    statementDay: PropTypes.number,
    type: PropTypes.string.isRequired,
  }).isRequired,
};
