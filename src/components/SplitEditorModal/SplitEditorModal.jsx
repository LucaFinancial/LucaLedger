import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { centsToDollars } from '@/utils';
import SplitItem from './components/SplitItem';
import SplitSummary from './components/SplitSummary';
import { useSplitEditor } from './hooks/useSplitEditor';
import { validateSplits, calculateRemaining } from './utils/validation';

/**
 * SplitEditorModal allows users to divide a transaction into multiple category allocations
 */
export default function SplitEditorModal({
  open,
  onClose,
  transaction,
  onSave,
}) {
  const {
    splits,
    errors,
    setErrors,
    handleAddSplit,
    handleRemoveSplit,
    handleCategoryChange,
    handleAmountChange,
    handleDistributeRemaining,
  } = useSplitEditor(open, transaction);

  const handleSave = () => {
    const totalAmount = Math.abs(transaction.amount);
    const { isValid, errors: validationErrors } = validateSplits(
      splits,
      totalAmount,
    );

    if (isValid) {
      onSave(splits);
      onClose();
    } else {
      setErrors(validationErrors);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!transaction) return null;

  const totalAmount = Math.abs(transaction.amount);
  const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);
  const remaining = calculateRemaining(totalAmount, splits);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>Split Transaction into Categories</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Transaction Amount:{' '}
            <strong>${centsToDollars(totalAmount).toFixed(2)}</strong>
          </Typography>

          <Stack spacing={2}>
            {splits.map((split) => (
              <SplitItem
                key={split.id}
                split={split}
                error={errors[split.id]}
                onCategoryChange={handleCategoryChange}
                onAmountChange={handleAmountChange}
                onRemove={handleRemoveSplit}
                canRemove={splits.length > 1}
              />
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
              onClick={() => handleDistributeRemaining(totalAmount)}
              variant='outlined'
              size='small'
              disabled={remaining <= 0}
            >
              Distribute Remaining
            </Button>
          </Box>

          <SplitSummary
            totalAmount={totalAmount}
            splitsTotal={splitsTotal}
            remaining={remaining}
            sumError={errors.sum}
          />
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
