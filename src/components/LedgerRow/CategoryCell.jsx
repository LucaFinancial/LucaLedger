import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { actions as transactionActions } from '@/store/transactions';
import CategorySelect from '@/components/CategorySelect';

export default function CategoryCell({ transaction }) {
  const dispatch = useDispatch();

  const handleCategoryChange = (categoryId) => {
    dispatch(
      transactionActions.updateTransactionProperty(
        transaction.accountId,
        transaction,
        'categoryId',
        categoryId
      )
    );
  };

  return (
    <TableCell sx={{ minWidth: 220 }}>
      <CategorySelect
        value={transaction.categoryId}
        onChange={handleCategoryChange}
        size='small'
        fullWidth
      />
    </TableCell>
  );
}

CategoryCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
