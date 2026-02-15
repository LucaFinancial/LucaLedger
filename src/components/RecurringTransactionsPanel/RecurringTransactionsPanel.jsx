import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectors as recurringTransactionSelectors,
  actions as recurringTransactionActions,
  constants as recurringTransactionConstants,
} from '@/store/recurringTransactions';
import RecurringTransactionModal from '@/components/RecurringTransactionModal';

const formatFrequency = (transaction) => {
  const { frequency, interval } = transaction;

  const singularUnits = {
    [recurringTransactionConstants.RecurringFrequencyEnum.DAY]: 'Day',
    [recurringTransactionConstants.RecurringFrequencyEnum.WEEK]: 'Week',
    [recurringTransactionConstants.RecurringFrequencyEnum.MONTH]: 'Month',
    [recurringTransactionConstants.RecurringFrequencyEnum.YEAR]: 'Year',
  };

  const pluralUnits = {
    [recurringTransactionConstants.RecurringFrequencyEnum.DAY]: 'Days',
    [recurringTransactionConstants.RecurringFrequencyEnum.WEEK]: 'Weeks',
    [recurringTransactionConstants.RecurringFrequencyEnum.MONTH]: 'Months',
    [recurringTransactionConstants.RecurringFrequencyEnum.YEAR]: 'Years',
  };

  const normalizedInterval = Number.isInteger(interval) && interval > 0 ? interval : 1;
  const unit =
    normalizedInterval === 1
      ? singularUnits[frequency] || frequency
      : pluralUnits[frequency] || frequency;

  return `Every ${normalizedInterval} ${unit}`;
};

const formatAmount = (amount) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(amount / 100);
};

export default function RecurringTransactionsPanel({ accountId }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactionsByAccountId(
      accountId,
    ),
  );

  const sortedTransactions = useMemo(
    () =>
      [...recurringTransactions].sort((a, b) =>
        a.description.localeCompare(b.description),
      ),
    [recurringTransactions],
  );

  const handleAddClick = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    dispatch(
      recurringTransactionActions.removeRecurringTransactionById(
        transaction.id,
      ),
    );
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleModalSave = (transactionData) => {
    if (editingTransaction) {
      dispatch(
        recurringTransactionActions.updateRecurringTransactionProperty(
          editingTransaction.id,
          transactionData,
        ),
      );
    } else {
      dispatch(
        recurringTransactionActions.createNewRecurringTransaction({
          ...transactionData,
          accountId,
        }),
      );
    }
    setModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>Recurring</Typography>
        <Tooltip title='Add recurring transaction'>
          <IconButton size='small' onClick={handleAddClick} color='primary'>
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      {sortedTransactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            No recurring transactions
          </Typography>
          <Button
            variant='outlined'
            size='small'
            startIcon={<Add />}
            onClick={handleAddClick}
          >
            Add First
          </Button>
        </Box>
      ) : (
        <List dense>
          {sortedTransactions.map((transaction) => (
            <ListItem
              key={transaction.id}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              secondaryAction={
                <Box>
                  <Tooltip title='Edit'>
                    <IconButton
                      size='small'
                      onClick={() => handleEditClick(transaction)}
                    >
                      <Edit fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Delete'>
                    <IconButton
                      size='small'
                      onClick={() => handleDeleteClick(transaction)}
                      color='error'
                    >
                      <Delete fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {transaction.description}
                    </Typography>
                    <Chip
                      size='small'
                      label={formatFrequency(transaction)}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    variant='caption'
                    color={
                      transaction.amount >= 0 ? 'success.main' : 'error.main'
                    }
                  >
                    {formatAmount(transaction.amount)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <RecurringTransactionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        transaction={editingTransaction}
        accountId={accountId}
      />
    </Box>
  );
}

RecurringTransactionsPanel.propTypes = {
  accountId: PropTypes.string.isRequired,
};
