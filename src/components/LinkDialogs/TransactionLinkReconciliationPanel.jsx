import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import {
  formatTransactionLinkCurrency,
  formatTransactionLinkDateLabel,
} from './transactionLinkDialogHelpers';

function TransactionSummaryCard({ title, transaction, accountName }) {
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
        {transaction.description || 'No description'}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {formatTransactionLinkDateLabel(transaction.date)}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {formatTransactionLinkCurrency(transaction.amount)}
      </Typography>
    </Paper>
  );
}

export default function TransactionLinkReconciliationPanel({
  sourceTransaction,
  destinationTransaction,
  sourceAccountName,
  destinationAccountName,
  sourceTitle = 'Transaction 1',
  destinationTitle = 'Transaction 2',
  blockingReason = '',
  errorMessage = '',
  selectedDate,
  onSelectedDateChange,
  selectedAbsoluteAmount,
  onSelectedAbsoluteAmountChange,
  syncDescription,
  onSyncDescriptionChange,
  sharedDescription,
  onSharedDescriptionChange,
}) {
  const hasDateMismatch = sourceTransaction.date !== destinationTransaction.date;
  const hasAmountMismatch =
    Math.abs(sourceTransaction.amount) !== Math.abs(destinationTransaction.amount);
  const hasDescriptionMismatch =
    String(sourceTransaction.description || '') !==
    String(destinationTransaction.description || '');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <TransactionSummaryCard
          title={sourceTitle}
          transaction={sourceTransaction}
          accountName={sourceAccountName}
        />
        <TransactionSummaryCard
          title={destinationTitle}
          transaction={destinationTransaction}
          accountName={destinationAccountName}
        />
      </Box>

      {blockingReason ? (
        <Alert severity='error'>{blockingReason}</Alert>
      ) : hasDateMismatch || hasAmountMismatch || hasDescriptionMismatch ? (
        <Alert severity='info'>
          Resolve any differences below, then save the link.
        </Alert>
      ) : (
        <Alert severity='success'>
          These transactions already match and are ready to be linked.
        </Alert>
      )}

      {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}

      {hasDateMismatch && (
        <FormControl>
          <FormLabel>Which date is correct?</FormLabel>
          <RadioGroup
            value={selectedDate}
            onChange={(event) => onSelectedDateChange(event.target.value)}
          >
            <FormControlLabel
              value={sourceTransaction.date}
              control={<Radio />}
              label={`Use ${sourceTitle} date: ${formatTransactionLinkDateLabel(sourceTransaction.date)}`}
            />
            <FormControlLabel
              value={destinationTransaction.date}
              control={<Radio />}
              label={`Use ${destinationTitle} date: ${formatTransactionLinkDateLabel(destinationTransaction.date)}`}
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
              value={String(Math.abs(sourceTransaction.amount))}
              control={<Radio />}
              label={`Use ${sourceTitle} amount: ${formatTransactionLinkCurrency(
                Math.abs(sourceTransaction.amount),
              )}`}
            />
            <FormControlLabel
              value={String(Math.abs(destinationTransaction.amount))}
              control={<Radio />}
              label={`Use ${destinationTitle} amount: ${formatTransactionLinkCurrency(
                Math.abs(destinationTransaction.amount),
              )}`}
            />
          </RadioGroup>
          <Typography variant='caption' color='text.secondary'>
            The selected absolute amount will be applied to both transactions
            while keeping each transaction&apos;s current sign.
          </Typography>
        </FormControl>
      )}

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={syncDescription}
              onChange={(event) => onSyncDescriptionChange(event.target.checked)}
            />
          }
          label='Use the same description for both transactions'
        />
        {syncDescription && (
          <TextField
            label='Shared description'
            value={sharedDescription}
            onChange={(event) => onSharedDescriptionChange(event.target.value)}
            fullWidth
            size='small'
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    </Box>
  );
}
