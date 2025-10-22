import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reset state when modal opens with new account
  useEffect(() => {
    if (open) {
      setName(account.name);
      setType(account.type);
      setStatementDay(account.statementDay || 1);
      setIsDirty(false);
      setShowConfirmDialog(false);
    }
  }, [open, account]);

  // Track if any changes have been made
  useEffect(() => {
    const hasChanges =
      name !== account.name ||
      type !== account.type ||
      (type === constants.AccountType.CREDIT_CARD &&
        statementDay !== (account.statementDay || 1));
    setIsDirty(hasChanges);
  }, [name, type, statementDay, account]);

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
    if (name !== account.name) {
      dispatch(
        actions.updateAccountProperty(
          account,
          constants.AccountFields.NAME,
          name
        )
      );
    }

    // Save type if changed
    if (type !== account.type) {
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
      statementDay !== (account.statementDay || 1)
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

  const handleClose = (event) => {
    // Prevent modal click from bubbling to card
    if (event) {
      event.stopPropagation();
    }

    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    setIsDirty(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowConfirmDialog(false);
  };

  const handleDialogClick = (event) => {
    // Stop propagation to prevent clicking modal from navigating to account detail
    event.stopPropagation();
  };

  return (
    <>
      <Dialog
        open={open && !showConfirmDialog}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
        aria-labelledby='account-settings-dialog-title'
        onClick={handleDialogClick}
      >
        <DialogTitle id='account-settings-dialog-title'>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Account Settings
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
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
        {isDirty && (
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSaveChanges}
              variant='contained'
            >
              Save Changes
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Confirmation dialog for unsaved changes */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleContinueEditing}
        onClick={handleDialogClick}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. What would you like to do?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinueEditing}>Continue Editing</Button>
          <Button onClick={handleDiscardChanges}>Discard Changes</Button>
          <Button
            onClick={handleSaveChanges}
            variant='contained'
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
