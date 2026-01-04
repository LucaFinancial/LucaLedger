import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, addYears } from 'date-fns';
import PropTypes from 'prop-types';
import CategorySelect from '@/components/CategorySelect';
import { constants as recurringTransactionConstants } from '@/store/recurringTransactions';
import config from '@/config';

const BI_WEEKLY_OPTION = 'BI_WEEKLY';

const frequencyOptions = [
  {
    value: recurringTransactionConstants.RecurringFrequencyEnum.DAY,
    label: 'Daily',
  },
  {
    value: recurringTransactionConstants.RecurringFrequencyEnum.WEEK,
    label: 'Weekly',
  },
  {
    value: BI_WEEKLY_OPTION,
    label: 'Bi-Weekly',
  },
  {
    value: recurringTransactionConstants.RecurringFrequencyEnum.MONTH,
    label: 'Monthly',
  },
  {
    value: recurringTransactionConstants.RecurringFrequencyEnum.YEAR,
    label: 'Yearly',
  },
];

export default function RecurringTransactionModal({
  open,
  onClose,
  onSave,
  transaction,
}) {
  const isEditing = Boolean(transaction);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [frequency, setFrequency] = useState(
    recurringTransactionConstants.RecurringFrequencyEnum.MONTH
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [hasEndDate, setHasEndDate] = useState(false);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(
        transaction.amount !== undefined
          ? (transaction.amount / 100).toFixed(2)
          : ''
      );
      setCategoryId(transaction.categoryId || null);

      let freq =
        transaction.frequency ||
        recurringTransactionConstants.RecurringFrequencyEnum.MONTH;
      if (
        freq === recurringTransactionConstants.RecurringFrequencyEnum.WEEK &&
        transaction.interval === 2
      ) {
        freq = BI_WEEKLY_OPTION;
      }
      setFrequency(freq);

      setStartDate(
        transaction.startOn
          ? parseISO(transaction.startOn.replace(/\//g, '-'))
          : new Date()
      );
      if (transaction.endOn) {
        setEndDate(parseISO(transaction.endOn.replace(/\//g, '-')));
        setHasEndDate(true);
      } else {
        setEndDate(null);
        setHasEndDate(false);
      }
    } else {
      // Reset to defaults for new transaction
      setDescription('');
      setAmount('');
      setCategoryId(null);
      setFrequency(recurringTransactionConstants.RecurringFrequencyEnum.MONTH);
      setStartDate(new Date());
      setEndDate(null);
      setHasEndDate(false);
    }
  }, [transaction, open]);

  const handleSubmit = () => {
    const amountValue = parseFloat(amount) || 0;
    const amountInCents = Math.round(amountValue * 100);

    let finalFrequency = frequency;
    let interval = 1;

    if (frequency === BI_WEEKLY_OPTION) {
      finalFrequency =
        recurringTransactionConstants.RecurringFrequencyEnum.WEEK;
      interval = 2;
    }

    const data = {
      description: description.trim(),
      amount: amountInCents,
      categoryId,
      frequency: finalFrequency,
      interval,
      startOn: format(startDate, config.dateFormatString),
      endOn:
        hasEndDate && endDate ? format(endDate, config.dateFormatString) : null,
      occurrences: transaction?.occurrences || null,
      recurringTransactionState:
        transaction?.recurringTransactionState ||
        recurringTransactionConstants.RecurringTransactionStateEnum.ACTIVE,
    };

    onSave(data);
  };

  const isValid =
    description.trim().length > 0 &&
    amount !== '' &&
    !isNaN(parseFloat(amount));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label='Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label='Amount'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type='number'
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>$</InputAdornment>
              ),
            }}
            helperText='Positive for income, negative for expense'
          />

          <CategorySelect
            value={categoryId}
            onChange={(newValue) => setCategoryId(newValue)}
          />

          <FormControl fullWidth>
            <InputLabel id='frequency-label'>Frequency</InputLabel>
            <Select
              labelId='frequency-label'
              value={frequency}
              label='Frequency'
              onChange={(e) => setFrequency(e.target.value)}
            >
              {frequencyOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label='Start Date'
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant={hasEndDate ? 'contained' : 'outlined'}
              size='small'
              onClick={() => {
                setHasEndDate(!hasEndDate);
                if (!hasEndDate) {
                  setEndDate(addYears(startDate, 1));
                }
              }}
            >
              {hasEndDate ? 'Has End Date' : 'No End Date'}
            </Button>
            {hasEndDate && (
              <DatePicker
                label='End Date'
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={startDate}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!isValid}
        >
          {isEditing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RecurringTransactionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  transaction: PropTypes.object,
};
