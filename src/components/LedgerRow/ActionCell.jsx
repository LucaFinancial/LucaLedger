import { IconButton, Menu, MenuItem, TableCell } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { actions as transactionActions } from '@/store/transactions';
import { MoreVert, Delete } from '@mui/icons-material';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function ActionCell({ transaction, isVirtual }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    dispatch(transactionActions.removeTransactionById(accountId, transaction));
    handleCloseMenu();
  };

  if (isVirtual) {
    return <TableCell sx={LEDGER_COLUMN_STYLES.actionMenu} />;
  }

  return (
    <TableCell sx={LEDGER_COLUMN_STYLES.actionMenu}>
      <IconButton size='small' onClick={handleOpenMenu}>
        <MoreVert fontSize='small' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDelete}>
          <Delete fontSize='small' style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </TableCell>
  );
}

ActionCell.propTypes = {
  transaction: PropTypes.object.isRequired,
  isVirtual: PropTypes.bool,
};

ActionCell.defaultProps = {
  isVirtual: false,
};
