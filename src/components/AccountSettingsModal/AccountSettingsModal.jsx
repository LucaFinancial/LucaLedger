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
  const [isDirty, setIsDirty] = useState(false);
  // Store initial values to compare against
  const [initialName, setInitialName] = useState(account.name);
  const [initialType, setInitialType] = useState(account.type);
  const [initialStatementDay, setInitialStatementDay] = useState(
    account.statementDay || 1
  );

  // Reset state when modal opens with new account
  useEffect(() => {
    if (open) {
      setName(account.name);
      setType(account.type);
      setStatementDay(account.statementDay || 1);
      setInitialName(account.name);
      setInitialType(account.type);
      setInitialStatementDay(account.statementDay || 1);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account.id]); // Only depend on open and account.id to avoid resetting when account properties change

  // Track if any changes have been made
  useEffect(() => {
    const hasChanges =
      name !== initialName ||
      type !== initialType ||
      (type === constants.AccountType.CREDIT_CARD &&
        statementDay !== initialStatementDay);
    setIsDirty(hasChanges);
  }, [name, type, statementDay, initialName, initialType, initialStatementDay]);

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

  const handleSaveChanges = () => {
    // Save name if changed
    if (name !== initialName) {
      dispatch(
        actions.updateAccountProperty(
          account,
          constants.AccountFields.NAME,
          name
        )
      );
    }

    // Save type if changed
    if (type !== initialType) {
      if (type === constants.AccountType.CREDIT_CARD) {
        // When switching to credit card, update both type and statement day
        const updatedAccount = { ...account, type, statementDay };
        dispatch(actions.updateAccount(updatedAccount));
      } else {
        dispatch(
          actions.updateAccountProperty(
            account,
            constants.AccountFields.TYPE,
            type
          )
        );
      }
    } else if (
      type === constants.AccountType.CREDIT_CARD &&
      statementDay !== initialStatementDay
    ) {
      // Save statement day if changed for credit card
      dispatch(
        actions.updateAccountProperty(
          account,
          constants.AccountFields.STATEMENT_DAY,
          statementDay
        )
      );
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
          {type === constants.AccountType.CREDIT_CARD && (
            <TextField
              label='Statement Closing Date'
              type='number'
              value={statementDay}
              onChange={handleStatementDayChange}
              fullWidth
              helperText='Day of month (1-28)'
              inputProps={{ min: 1, max: 28 }}
            />
          )}
        </Box>

        <Box>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}
          >
            Recommended Settings (Coming Soon)
          </Typography>
          <Typography
            variant='body2'
            sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}
          >
            These settings are placeholders and will be functional in a future
            update.
          </Typography>

          <FormControlLabel
            control={<Switch disabled />}
            label='Enable automatic categorization'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Send monthly statement reminders'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Show balance projections'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Enable spending alerts'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={<Switch disabled />}
            label='Auto-archive old transactions'
            sx={{ mb: 1 }}
          />
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
  }).isRequired,
};
