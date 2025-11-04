import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import CategorySelect from '@/components/CategorySelect';
import { centsToDollars, dollarsToCents } from '@/utils';

/**
 * SplitEditorModal allows users to divide a transaction into multiple category allocations
 */
export default function SplitEditorModal({
  open,
  onClose,
  transaction,
  onSave,
}) {
  const [splits, setSplits] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize splits from transaction when modal opens
  useEffect(() => {
    if (open && transaction) {
      if (transaction.splits && transaction.splits.length > 0) {
        // Load existing splits
        setSplits(transaction.splits.map((split) => ({ ...split })));
      } else {
        // Start with one empty split
        setSplits([
          {
            id: uuid(),
            categoryId: transaction.categoryId || '',
            amount: Math.abs(transaction.amount),
          },
        ]);
      }
      setErrors({});
    }
  }, [open, transaction]);

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      {
        id: uuid(),
        categoryId: '',
        amount: 0,
      },
    ]);
  };

  const handleRemoveSplit = (splitId) => {
    setSplits(splits.filter((split) => split.id !== splitId));
  };

  const handleCategoryChange = (splitId, categoryId) => {
    setSplits(
      splits.map((split) =>
        split.id === splitId ? { ...split, categoryId } : split
      )
    );
    // Clear error for this split when category changes
    if (errors[splitId]) {
      setErrors({ ...errors, [splitId]: undefined });
    }
  };

  const handleAmountChange = (splitId, value) => {
    // Allow empty, numbers with up to 2 decimals, and negative sign
    const validNumberRegex = /^\d*\.?\d{0,2}$/;

    if (value === '' || validNumberRegex.test(value)) {
      const amountInCents =
        value === '' ? 0 : dollarsToCents(parseFloat(value));
      setSplits(
        splits.map((split) =>
          split.id === splitId ? { ...split, amount: amountInCents } : split
        )
      );
      // Clear error for this split when amount changes
      if (errors[splitId]) {
        setErrors({ ...errors, [splitId]: undefined });
      }
    }
  };

  const handleDistributeRemaining = () => {
    if (splits.length === 0) return;

    const totalAmount = Math.abs(transaction.amount);
    const currentTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    const remaining = totalAmount - currentTotal;

    if (remaining > 0) {
      // Find the last split with amount 0 or the last split overall
      const lastEmptyIndex = splits.reduce(
        (lastIdx, split, idx) => (split.amount === 0 ? idx : lastIdx),
        splits.length - 1
      );

      setSplits(
        splits.map((split, idx) =>
          idx === lastEmptyIndex
            ? { ...split, amount: split.amount + remaining }
            : split
        )
      );
    }
  };

  const validateSplits = () => {
    const newErrors = {};
    let isValid = true;

    // Check that we have at least one split
    if (splits.length === 0) {
      isValid = false;
    }

    // Validate each split
    splits.forEach((split) => {
      if (!split.categoryId) {
        newErrors[split.id] = 'Category required';
        isValid = false;
      }
      if (split.amount < 0) {
        newErrors[split.id] = 'Amount must be >= 0';
        isValid = false;
      }
    });

    // Check that sum equals transaction amount
    const totalAmount = Math.abs(transaction.amount);
    const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

    if (splitsTotal !== totalAmount) {
      newErrors.sum = `Sum of splits ($${centsToDollars(splitsTotal).toFixed(
        2
      )}) must equal transaction amount ($${centsToDollars(totalAmount).toFixed(
        2
      )})`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateSplits()) {
      onSave(splits);
      onClose();
    }
  };

  const handleClose = () => {
    setSplits([]);
    setErrors({});
    onClose();
  };

  if (!transaction) return null;

  const totalAmount = Math.abs(transaction.amount);
  const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);
  const remaining = totalAmount - splitsTotal;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>Split Transaction into Categories</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2 }}
          >
            Transaction Amount:{' '}
            <strong>${centsToDollars(totalAmount).toFixed(2)}</strong>
          </Typography>

          <Stack spacing={2}>
            {splits.map((split) => (
              <Paper
                key={split.id}
                sx={{
                  p: 2,
                  backgroundColor: errors[split.id] ? '#ffebee' : '#f5f5f5',
                  border: errors[split.id]
                    ? '1px solid #f44336'
                    : '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <CategorySelect
                      value={split.categoryId}
                      onChange={(categoryId) =>
                        handleCategoryChange(split.id, categoryId)
                      }
                      size='small'
                      variant='outlined'
                      fullWidth
                      label='Category'
                      placeholder='Select category'
                    />
                    {errors[split.id] && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {errors[split.id]}
                      </Typography>
                    )}
                  </Box>
                  <TextField
                    type='text'
                    value={
                      split.amount === 0
                        ? ''
                        : centsToDollars(split.amount).toFixed(2)
                    }
                    onChange={(e) =>
                      handleAmountChange(split.id, e.target.value)
                    }
                    size='small'
                    sx={{ width: 150 }}
                    label='Amount'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>$</InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveSplit(split.id)}
                    disabled={splits.length === 1}
                    color='error'
                    size='small'
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              startIcon={<Add />}
              onClick={handleAddSplit}
              variant='outlined'
              size='small'
            >
              Add Split
            </Button>
            <Button
              onClick={handleDistributeRemaining}
              variant='outlined'
              size='small'
              disabled={remaining <= 0}
            >
              Distribute Remaining
            </Button>
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: remaining === 0 ? '#e8f5e9' : '#fff3e0',
              borderRadius: 1,
            }}
          >
            <Typography variant='body2'>
              <strong>Remaining:</strong> $
              {centsToDollars(remaining).toFixed(2)}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
            >
              Total of splits: ${centsToDollars(splitsTotal).toFixed(2)} / $
              {centsToDollars(totalAmount).toFixed(2)}
            </Typography>
            {errors.sum && (
              <Typography
                variant='caption'
                color='error'
                sx={{ display: 'block', mt: 1 }}
              >
                {errors.sum}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={splits.length === 0 || remaining !== 0}
        >
          Save Splits
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SplitEditorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transaction: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
