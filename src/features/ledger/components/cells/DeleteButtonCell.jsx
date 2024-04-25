import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { actions } from '@/store/transactions';

import DeleteIcon from '@mui/icons-material/Delete';

export default function DeleteButtonCell({ transaction }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(actions.removeTransactionById(transaction.id));
  };

  return (
    <TableCell style={{ width: '50px' }}>
      <DeleteIcon
        onClick={handleDelete}
        style={{ cursor: 'pointer' }}
      />
    </TableCell>
  );
}

DeleteButtonCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
