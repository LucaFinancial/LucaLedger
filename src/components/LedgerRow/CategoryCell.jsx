import { TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { actions as transactionActions } from '@/store/transactions';
import CategorySelect from '@/components/CategorySelect';

export default function CategoryCell({ transaction, isSelected }) {
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
        variant='standard'
        fullWidth
        label=''
        placeholder='Category'
        isSelected={isSelected}
      />
    </TableCell>
  );
}

CategoryCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
};
