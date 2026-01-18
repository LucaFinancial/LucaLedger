import { IconButton, TableCell, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  actions as transactionActions,
  constants as transactionConstants,
} from '@/store/transactions';
import { actions as recurringTransactionEventActions } from '@/store/recurringTransactionEvents';
import { AccessTime, CheckCircle, AddCircleOutline } from '@mui/icons-material';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function QuickActionCell({
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

  const renderAction = () => {
    if (isVirtual) {
      return (
        <Tooltip title='Create transaction'>
          <IconButton size='small' onClick={handleCreateClick} color='primary'>
            <AddCircleOutline fontSize='small' />
          </IconButton>
        </Tooltip>
      );
    }

    switch (transaction.transactionState) {
      case transactionConstants.TransactionStateEnum.PLANNED:
        return (
          <Tooltip title='Schedule transaction'>
            <IconButton size='small' onClick={handleScheduleClick} color='info'>
              <AccessTime fontSize='small' />
            </IconButton>
          </Tooltip>
        );
      case transactionConstants.TransactionStateEnum.SCHEDULED:
      case transactionConstants.TransactionStateEnum.PENDING:
        return (
          <Tooltip title='Complete transaction'>
            <IconButton
              size='small'
              onClick={handleCompleteClick}
              color='success'
            >
              <CheckCircle fontSize='small' />
            </IconButton>
          </Tooltip>
        );
      case transactionConstants.TransactionStateEnum.COMPLETED:
      default:
        return null;
    }
  };

  return (
    <TableCell sx={LEDGER_COLUMN_STYLES.quickAction}>
      {renderAction()}
    </TableCell>
  );
}

QuickActionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isVirtual: PropTypes.bool,
  recurringTransaction: PropTypes.object,
  occurrenceDate: PropTypes.string,
};

QuickActionCell.defaultProps = {
  isVirtual: false,
  recurringTransaction: null,
  occurrenceDate: null,
};
