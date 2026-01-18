import { TableCell, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  actions as transactionActions,
  constants as transactionConstants,
} from '@/store/transactions';
import { actions as recurringTransactionEventActions } from '@/store/recurringTransactionEvents';

export default function ActionCell({
  transaction,
  isVirtual,
  recurringTransaction,
  occurrenceDate,
}) {
  const dispatch = useDispatch();

  const handleCreateClick = () => {
    if (isVirtual && recurringTransaction && occurrenceDate) {
      dispatch(
        recurringTransactionEventActions.realizeRecurringTransaction(
          recurringTransaction,
          occurrenceDate,
        ),
      );
    }
  };

  const handleScheduleClick = () => {
    dispatch(
      transactionActions.updateTransactionProperty(
        transaction.accountId,
        transaction,
        transactionConstants.TransactionFields.TRANSACTION_STATE,
        transactionConstants.TransactionStateEnum.SCHEDULED,
      ),
    );
  };

  const handleCompleteClick = () => {
    dispatch(
      transactionActions.updateTransactionProperty(
        transaction.accountId,
        transaction,
        transactionConstants.TransactionFields.TRANSACTION_STATE,
        transactionConstants.TransactionStateEnum.COMPLETED,
      ),
    );
  };

  // Determine which button to show based on status
  const renderButton = () => {
    if (isVirtual) {
      return (
        <Button
          size='small'
          variant='outlined'
          color='primary'
          onClick={handleCreateClick}
          sx={{ minWidth: 80 }}
        >
          Create
        </Button>
      );
    }

    switch (transaction.transactionState) {
      case transactionConstants.TransactionStateEnum.PLANNED:
        return (
          <Button
            size='small'
            variant='outlined'
            color='info'
            onClick={handleScheduleClick}
            sx={{ minWidth: 80 }}
          >
            Schedule
          </Button>
        );
      case transactionConstants.TransactionStateEnum.SCHEDULED:
      case transactionConstants.TransactionStateEnum.PENDING:
        return (
          <Button
            size='small'
            variant='outlined'
            color='success'
            onClick={handleCompleteClick}
            sx={{ minWidth: 80 }}
          >
            Complete
          </Button>
        );
      case transactionConstants.TransactionStateEnum.COMPLETED:
        // No button for complete status
        return null;
      default:
        return null;
    }
  };

  return (
    <TableCell
      sx={{
        width: '100px',
        textAlign: 'center',
      }}
    >
      {renderButton()}
    </TableCell>
  );
}

ActionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isVirtual: PropTypes.bool,
  recurringTransaction: PropTypes.object,
  occurrenceDate: PropTypes.string,
};

ActionCell.defaultProps = {
  isVirtual: false,
  recurringTransaction: null,
  occurrenceDate: null,
};
