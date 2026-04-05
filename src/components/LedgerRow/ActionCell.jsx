import { IconButton, Menu, MenuItem, TableCell, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import TransactionLinkDialog from '@/components/LinkDialogs/TransactionLinkDialog';
import { selectors as transactionLinkSelectors, actions as transactionLinkActions } from '@/store/transactionLinks';
import { selectors as transactionSplitSelectors } from '@/store/transactionSplits';
import { actions as transactionActions } from '@/store/transactions';
import { MoreVert, Delete, Link, LinkOff } from '@mui/icons-material';
import { LEDGER_COLUMN_STYLES } from '@/components/LedgerTable/ledgerColumnConfig';

export default function ActionCell({ transaction, isVirtual = false }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const transactionLink = useSelector(
    transactionLinkSelectors.selectTransactionLinkByTransactionId(transaction.id),
  );
  const transactionSplits = useSelector(
    transactionSplitSelectors.selectSplitsByTransactionId(transaction.id),
  );
  const hasSplits = transactionSplits.length > 0;
  const linkedTransactionId =
    transactionLink?.sourceTransactionId === transaction.id
      ? transactionLink.destinationTransactionId
      : transactionLink?.destinationTransactionId || null;

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

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const handleUnlink = async () => {
    await dispatch(
      transactionLinkActions.unlinkTransactionByTransactionId(transaction.id),
    );
    handleCloseMenu();
  };

  if (isVirtual) {
    return <TableCell sx={LEDGER_COLUMN_STYLES.actionMenu} />;
  }

  return (
    <>
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
          <Tooltip
            title={
              hasSplits ? 'Transactions with splits cannot be linked yet.' : ''
            }
            disableHoverListener={!hasSplits}
            placement='left'
          >
            <span>
              <MenuItem onClick={handleOpenLinkDialog} disabled={hasSplits}>
                <Link fontSize='small' style={{ marginRight: 8 }} />
                {transactionLink ? 'Change Linked Transaction' : 'Link Transaction'}
              </MenuItem>
            </span>
          </Tooltip>
          {transactionLink && (
            <MenuItem onClick={handleUnlink}>
              <LinkOff fontSize='small' style={{ marginRight: 8 }} />
              Unlink Transaction
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <Delete fontSize='small' style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </TableCell>
      <TransactionLinkDialog
        open={linkDialogOpen}
        onClose={handleCloseLinkDialog}
        sourceTransactionId={transaction.id}
        preselectedTransactionId={linkedTransactionId}
      />
    </>
  );
}
