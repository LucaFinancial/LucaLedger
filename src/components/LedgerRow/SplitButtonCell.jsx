import { Badge, IconButton, TableCell, Tooltip } from '@mui/material';
import { CallSplit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SplitEditorModal from '@/components/SplitEditorModal';
import { updateTransaction } from '@/store/transactions';

export default function SplitButtonCell({ transaction }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const hasSplits = transaction.splits && transaction.splits.length > 0;

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
      <TableCell style={{ width: '50px', textAlign: 'center' }}>
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

SplitButtonCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
