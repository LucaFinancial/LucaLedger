import { TableCell, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { selectors as entitySelectors } from '@/store/entities';
import { actions as transactionActions } from '@/store/transactions';
import EntityPicker from '@/components/input/EntityPicker';

export const EntityCellType = Object.freeze({
  PAYOR: 'payor',
  PAYEE: 'payee',
});

export default function EntityCell({ transaction, column }) {
  const dispatch = useDispatch();

  let entityId;
  if (column === EntityCellType.PAYOR) {
    entityId = transaction.payorId;
  } else if (column === EntityCellType.PAYEE) {
    entityId = transaction.payeeId;
  } else {
    throw new Error(`Unknown column type: ${column}`);
  }

  const entity = useSelector(entitySelectors.selectEntityById(entityId));

  const handleChange = (newEntityId) => {
    if (column === EntityCellType.PAYOR) {
      dispatch(
        transactionActions.updateTransactionById(transaction.id, {
          ...transaction,
          payorId: newEntityId,
        })
      );
    } else if (column === EntityCellType.PAYEE) {
      dispatch(
        transactionActions.updateTransactionById(transaction.id, {
          ...transaction,
          payeeId: newEntityId,
        })
      );
    } else {
      throw new Error(`Unknown column type: ${column}`);
    }
  };

  if (!entity) {
    return (
      <TableCell>
        <Typography>Unknown entity</Typography>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <EntityPicker
        selectedEntity={entity}
        onChange={handleChange}
      />
    </TableCell>
  );
}

EntityCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  column: PropTypes.string.isRequired,
};
