import { Badge, Box, IconButton, TableCell, Tooltip } from '@mui/material';
import { CallSplit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  actions as transactionActions,
  updateTransaction,
} from '@/store/transactions';
import CategorySelect from '@/components/CategorySelect';
import SplitEditorModal from '@/components/SplitEditorModal';

export default function CategoryCell({ transaction, isSelected }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const hasSplits = transaction.splits && transaction.splits.length > 0;

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
      <TableCell sx={{ minWidth: 220 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
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
