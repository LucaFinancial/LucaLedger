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
import { Add, Edit, Delete, Link, LinkOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectors as recurringTransactionSelectors,
  actions as recurringTransactionActions,
  constants as recurringTransactionConstants,
} from '@/store/recurringTransactions';
import {
  selectors as recurringTransactionLinkSelectors,
  actions as recurringTransactionLinkActions,
} from '@/store/recurringTransactionLinks';
import RecurringTransactionLinkDialog from '@/components/LinkDialogs/RecurringTransactionLinkDialog';
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

  const parsedInterval = Number.parseInt(interval, 10);
  const normalizedInterval =
    Number.isInteger(parsedInterval) && parsedInterval > 0 ? parsedInterval : 1;
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
  const [linkDialogState, setLinkDialogState] = useState({
    open: false,
    sourceRecurringTransactionId: null,
    preselectedRecurringTransactionId: null,
  });

  const recurringTransactions = useSelector(
    recurringTransactionSelectors.selectRecurringTransactionsByAccountId(
      accountId,
    ),
  );
  const recurringTransactionLinks = useSelector(
    recurringTransactionLinkSelectors.selectActiveRecurringTransactionLinks,
  );
  const recurringLinkMap = useMemo(
    () =>
      recurringTransactionLinks.reduce((map, link) => {
        map.set(link.sourceRecurringTransactionId, link);
        map.set(link.destinationRecurringTransactionId, link);
        return map;
      }, new Map()),
    [recurringTransactionLinks],
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

  const handleOpenLinkDialog = (transaction) => {
    const recurringTransactionLink = recurringLinkMap.get(transaction.id) || null;
    const linkedRecurringTransactionId =
      recurringTransactionLink?.sourceRecurringTransactionId === transaction.id
        ? recurringTransactionLink.destinationRecurringTransactionId
        : recurringTransactionLink?.destinationRecurringTransactionId || null;

    setLinkDialogState({
      open: true,
      sourceRecurringTransactionId: transaction.id,
      preselectedRecurringTransactionId: linkedRecurringTransactionId,
    });
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogState({
      open: false,
      sourceRecurringTransactionId: null,
      preselectedRecurringTransactionId: null,
    });
  };

  const handleUnlinkClick = async (transaction) => {
    await dispatch(
      recurringTransactionLinkActions.unlinkRecurringTransactionByRecurringTransactionId(
        transaction.id,
      ),
    );
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
                  <Tooltip title='Link recurring transaction'>
                    <IconButton
                      size='small'
                      onClick={() => handleOpenLinkDialog(transaction)}
                      color='primary'
                    >
                      <Link fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  {recurringLinkMap.has(transaction.id) && (
                    <Tooltip title='Unlink recurring transaction'>
                      <IconButton
                        size='small'
                        onClick={() => handleUnlinkClick(transaction)}
                        color='warning'
                      >
                        <LinkOff fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
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
                    {recurringLinkMap.has(transaction.id) && (
                      <Chip
                        size='small'
                        label='Linked'
                        color='primary'
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
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
      <RecurringTransactionLinkDialog
        open={linkDialogState.open}
        onClose={handleCloseLinkDialog}
        sourceRecurringTransactionId={linkDialogState.sourceRecurringTransactionId}
        preselectedRecurringTransactionId={
          linkDialogState.preselectedRecurringTransactionId
        }
      />
    </Box>
  );
}
