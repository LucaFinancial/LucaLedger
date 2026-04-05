import {
  Alert,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  formatRecurringLinkCurrency,
  formatRecurringScheduleLabel,
} from './recurringLinkDialogHelpers';

function RecurringTransactionSummaryCard({
  title,
  recurringTransaction,
  accountName,
}) {
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {accountName}
      </Typography>
      <Typography variant='body2'>
        {recurringTransaction.description || 'No description'}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {formatRecurringScheduleLabel(recurringTransaction)}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {formatRecurringLinkCurrency(recurringTransaction.amount)}
      </Typography>
    </Paper>
  );
}

export default function RecurringTransactionLinkReconciliationPanel({
  sourceRecurringTransaction,
  destinationRecurringTransaction,
  sourceAccountName,
  destinationAccountName,
  sourceTitle = 'Recurring Transaction 1',
  destinationTitle = 'Recurring Transaction 2',
  blockingReason = '',
  errorMessage = '',
  selectedScheduleSource,
  onSelectedScheduleSourceChange,
  selectedAbsoluteAmount,
  onSelectedAbsoluteAmountChange,
  selectedIsSameSign,
  onSelectedIsSameSignChange,
  sharedDescription,
  onSharedDescriptionChange,
}) {
  const hasScheduleMismatch =
    sourceRecurringTransaction.startOn !== destinationRecurringTransaction.startOn ||
    sourceRecurringTransaction.frequency !==
      destinationRecurringTransaction.frequency ||
    sourceRecurringTransaction.interval !==
      destinationRecurringTransaction.interval ||
    (sourceRecurringTransaction.endOn || null) !==
      (destinationRecurringTransaction.endOn || null);
  const hasAmountMismatch =
    Math.abs(sourceRecurringTransaction.amount) !==
    Math.abs(destinationRecurringTransaction.amount);
  const hasDescriptionMismatch =
    String(sourceRecurringTransaction.description || '') !==
    String(destinationRecurringTransaction.description || '');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <RecurringTransactionSummaryCard
          title={sourceTitle}
          recurringTransaction={sourceRecurringTransaction}
          accountName={sourceAccountName}
        />
        <RecurringTransactionSummaryCard
          title={destinationTitle}
          recurringTransaction={destinationRecurringTransaction}
          accountName={destinationAccountName}
        />
      </Box>

      {blockingReason ? (
        <Alert severity='error'>{blockingReason}</Alert>
      ) : hasScheduleMismatch || hasAmountMismatch || hasDescriptionMismatch ? (
        <Alert severity='info'>
          Resolve any recurring-rule differences below, then save the link.
        </Alert>
      ) : (
        <Alert severity='success'>
          These recurring transactions already match and are ready to be
          linked.
        </Alert>
      )}

      {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}

      {hasScheduleMismatch && (
        <FormControl>
          <FormLabel>Which recurring schedule is correct?</FormLabel>
          <RadioGroup
            value={selectedScheduleSource}
            onChange={(event) =>
              onSelectedScheduleSourceChange(event.target.value)
            }
          >
            <FormControlLabel
              value='source'
              control={<Radio />}
              label={`Use ${sourceTitle} schedule: ${formatRecurringScheduleLabel(
                sourceRecurringTransaction,
              )}`}
            />
            <FormControlLabel
              value='destination'
              control={<Radio />}
              label={`Use ${destinationTitle} schedule: ${formatRecurringScheduleLabel(
                destinationRecurringTransaction,
              )}`}
            />
          </RadioGroup>
        </FormControl>
      )}

      {hasAmountMismatch && (
        <FormControl>
          <FormLabel>Which amount is correct?</FormLabel>
          <RadioGroup
            value={selectedAbsoluteAmount}
            onChange={(event) =>
              onSelectedAbsoluteAmountChange(event.target.value)
            }
          >
            <FormControlLabel
              value={String(Math.abs(sourceRecurringTransaction.amount))}
              control={<Radio />}
              label={`Use ${sourceTitle} amount: ${formatRecurringLinkCurrency(
                Math.abs(sourceRecurringTransaction.amount),
              )}`}
            />
            <FormControlLabel
              value={String(Math.abs(destinationRecurringTransaction.amount))}
              control={<Radio />}
              label={`Use ${destinationTitle} amount: ${formatRecurringLinkCurrency(
                Math.abs(destinationRecurringTransaction.amount),
              )}`}
            />
          </RadioGroup>
          <Typography variant='caption' color='text.secondary'>
            The selected absolute amount will be applied to both recurring
            transactions. The sign relationship is controlled by the toggle
            below.
          </Typography>
        </FormControl>
      )}

      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={selectedIsSameSign}
              onChange={(event) =>
                onSelectedIsSameSignChange(event.target.checked)
              }
            />
          }
          label={
            selectedIsSameSign
              ? 'Linked amounts use the same sign'
              : 'Linked amounts use opposite signs'
          }
        />
        <Typography variant='caption' color='text.secondary'>
          Use the same sign for mirrored payments. Use opposite signs for
          transfers between accounts.
        </Typography>
      </Box>

      <TextField
        label='Shared description'
        value={sharedDescription}
        onChange={(event) => onSharedDescriptionChange(event.target.value)}
        fullWidth
        size='small'
        helperText='This description will be applied to both linked recurring transactions.'
      />
    </Box>
  );
}
