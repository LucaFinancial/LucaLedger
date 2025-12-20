import {
  Badge,
  Box,
  IconButton,
  TableCell,
  Tooltip,
  Typography,
} from '@mui/material';
import { CallSplit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as transactionActions,
  updateTransaction,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';
import CategorySelect from '@/components/CategorySelect';
import SplitEditorModal from '@/components/SplitEditorModal';

export default function CategoryCell({ transaction, isSelected }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const categories = useSelector(categorySelectors.selectAllCategories);

  const hasSplits = transaction.splits && transaction.splits.length > 0;

  const splitCategoryNames = useMemo(() => {
    if (!hasSplits) return '';
    return transaction.splits
      .map((split) => {
        const cat = categories.find((c) => c.id === split.categoryId);
        return cat ? cat.name : 'Uncategorized';
      })
      .join(', ');
  }, [hasSplits, transaction.splits, categories]);

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

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveSplits = (splits) => {
    const updatedTransaction = {
      ...transaction,
      splits: splits.length > 0 ? splits : undefined,
    };
    dispatch(updateTransaction(updatedTransaction));
  };

  return (
    <>
      <TableCell sx={{ minWidth: 170 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            {hasSplits ? (
              <Tooltip title={splitCategoryNames}>
                <Typography
                  variant='body2'
                  noWrap
                >
                  {splitCategoryNames}
                </Typography>
              </Tooltip>
            ) : (
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
            )}
          </Box>
          <Tooltip title={hasSplits ? 'Edit splits' : 'Split into categories'}>
            <IconButton
              onClick={handleOpenModal}
              size='small'
              color={hasSplits ? 'primary' : 'default'}
            >
              <Badge
                badgeContent={hasSplits ? transaction.splits.length : 0}
                color='primary'
                invisible={!hasSplits}
              >
                <CallSplit fontSize='small' />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
      <SplitEditorModal
        open={modalOpen}
        onClose={handleCloseModal}
        transaction={transaction}
        onSave={handleSaveSplits}
      />
    </>
  );
}

CategoryCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
};
