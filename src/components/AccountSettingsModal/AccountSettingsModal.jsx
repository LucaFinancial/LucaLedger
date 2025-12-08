import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions, constants } from '@/store/accounts';

export default function AccountSettingsModal({ open, onClose, account }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [statementDay, setStatementDay] = useState(account.statementDay || 1);
  const [statementLockedToMonth, setStatementLockedToMonth] = useState(
    account.statementLockedToMonth || false
  );
  const [groupBy, setGroupBy] = useState(
    account.groupBy || constants.GroupByMode.MONTH
  );
  const [isDirty, setIsDirty] = useState(false);
  // Store initial values to compare against
  const [initialName, setInitialName] = useState(account.name);
  const [initialType, setInitialType] = useState(account.type);
  const [initialStatementDay, setInitialStatementDay] = useState(
    account.statementDay || 1
  );
  const [initialStatementLockedToMonth, setInitialStatementLockedToMonth] =
    useState(account.statementLockedToMonth || false);
  const [initialGroupBy, setInitialGroupBy] = useState(
    account.groupBy || constants.GroupByMode.MONTH
  );

  // Reset state when modal opens with new account
  useEffect(() => {
    if (open) {
      setName(account.name);
      setType(account.type);
      setStatementDay(account.statementDay || 1);
      setStatementLockedToMonth(account.statementLockedToMonth || false);
      setGroupBy(account.groupBy || constants.GroupByMode.MONTH);
      setInitialName(account.name);
      setInitialType(account.type);
      setInitialStatementDay(account.statementDay || 1);
      setInitialStatementLockedToMonth(account.statementLockedToMonth || false);
      setInitialGroupBy(account.groupBy || constants.GroupByMode.MONTH);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account.id]); // Only depend on open and account.id to avoid resetting when account properties change

  // Track if any changes have been made
  useEffect(() => {
    const hasChanges =
      name !== initialName ||
      type !== initialType ||
      statementDay !== initialStatementDay ||
      statementLockedToMonth !== initialStatementLockedToMonth ||
      groupBy !== initialGroupBy;
    setIsDirty(hasChanges);
  }, [
    name,
    type,
    statementDay,
    statementLockedToMonth,
    groupBy,
    initialName,
    initialType,
    initialStatementDay,
    initialStatementLockedToMonth,
    initialGroupBy,
  ]);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setType(newType);
    // If switching to credit card and no statement day, set default
    if (newType === constants.AccountType.CREDIT_CARD && !statementDay) {
      setStatementDay(1);
    }
  };

  const handleStatementDayChange = (event) => {
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
  };

  const handleStatementLockedToMonthChange = (event) => {
    setStatementLockedToMonth(event.target.checked);
  };

  const handleGroupByChange = (event) => {
    setGroupBy(event.target.value);
  };

  const handleSaveChanges = () => {
    // Collect all changes into a single update object
    const updates = {};

    if (name !== initialName) {
      updates.name = name;
    }

    if (type !== initialType) {
      updates.type = type;
      // When switching to credit card, ensure statement day is included
      if (type === constants.AccountType.CREDIT_CARD) {
        updates.statementDay = statementDay;
      }
    }

    // Save statement day if changed (for any account type now)
    if (statementDay !== initialStatementDay) {
      updates.statementDay = statementDay;
    }

    if (statementLockedToMonth !== initialStatementLockedToMonth) {
      updates.statementLockedToMonth = statementLockedToMonth;
    }

    if (groupBy !== initialGroupBy) {
      updates.groupBy = groupBy;
    }

    // Apply all updates in a single dispatch
    if (Object.keys(updates).length > 0) {
      const updatedAccount = { ...account, ...updates };
      dispatch(actions.updateAccount(updatedAccount));
    }

    setIsDirty(false);
    onClose();
  };

  const handleCancel = (event) => {
    // Prevent modal click from bubbling to card
    if (event) {
      event.stopPropagation();
    }

    // Reset to initial values (values when modal opened)
    setName(initialName);
    setType(initialType);
    setStatementDay(initialStatementDay);
    setStatementLockedToMonth(initialStatementLockedToMonth);
    setGroupBy(initialGroupBy);
    setIsDirty(false);
    onClose();
  };

  const handleDialogClick = (event) => {
    // Stop propagation to prevent clicking modal from navigating to account detail
    event.stopPropagation();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='sm'
      fullWidth
      aria-labelledby='account-settings-dialog-title'
      onClick={handleDialogClick}
    >
      <DialogTitle id='account-settings-dialog-title'>
        Account Settings
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Account Information
          </Typography>
          <TextField
            label='Account Name'
            value={name}
            onChange={handleNameChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <InputLabel id='account-type-label'>Account Type</InputLabel>
            <Select
              labelId='account-type-label'
              id='account-type'
              value={type}
              onChange={handleTypeChange}
              fullWidth
            >
              {Object.keys(constants.AccountType).map((key) => (
                <MenuItem
                  key={key}
                  value={constants.AccountType[key]}
                >
                  {constants.AccountType[key]}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Statement Settings
          </Typography>
          <TextField
            label='Statement Closing Day'
            type='number'
            value={statementDay}
            onChange={handleStatementDayChange}
            fullWidth
            helperText='Day of month (1-28)'
            inputProps={{ min: 1, max: 28 }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={statementLockedToMonth}
                onChange={handleStatementLockedToMonthChange}
              />
            }
            label='Lock statements to calendar months'
            sx={{ mb: 2 }}
          />
          <FormControl
            component='fieldset'
            sx={{ mt: 1 }}
          >
            <FormLabel component='legend'>Group By</FormLabel>
            <RadioGroup
              value={groupBy}
              onChange={handleGroupByChange}
            >
              <FormControlLabel
                value={constants.GroupByMode.MONTH}
                control={<Radio />}
                label='Month (months are collapsible, statements are dividers)'
              />
              <FormControlLabel
                value={constants.GroupByMode.STATEMENT}
                control={<Radio />}
                label='Statement (statement periods are collapsible, months are dividers)'
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSaveChanges}
          variant='contained'
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AccountSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    statementDay: PropTypes.number,
    statementLockedToMonth: PropTypes.bool,
    groupBy: PropTypes.string,
  }).isRequired,
};
