import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import AccountTypePicker from '@/components/AccountTypePicker';
import StatementDayInput from '@/components/StatementDayInput';
import BalanceDisplay from '@/components/BalanceDisplay';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { SettingsPanelItem } from './SettingsPanelItem';
import {
  selectors as transactionSelectors,
  actions as transactionActions,
} from '@/store/transactions';
import { selectors as categorySelectors } from '@/store/categories';

export default function SettingsPanel({
  account,
  selectedCount,
  onBulkEditClick,
}) {
  const dispatch = useDispatch();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id)
  );
  const flatCategories = useSelector(categorySelectors.selectAllCategoriesFlat);

  // Find transactions with invalid categories
  const invalidCategoryCount = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.categoryId) return false;
      return !flatCategories.some((cat) => cat.id === transaction.categoryId);
    }).length;
  }, [transactions, flatCategories]);

  const completedBalance = transactions
    .filter((transaction) => transaction.status === 'complete ')
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const pendingBalance = transactions
    .filter((transaction) =>
      ['complete ', 'pending '].includes(transaction.status)
    )
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const scheduledBalance = transactions
    .filter((transaction) =>
      ['complete ', 'pending ', 'scheduled '].includes(transaction.status)
    )
    .reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const futureBalance = transactions.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  );

  const getBulkEditButtonText = () => {
    if (selectedCount === 0) {
      return 'Select Transactions';
    } else if (selectedCount === 1) {
      return 'Edit 1 Transaction';
    } else {
      return `Edit ${selectedCount} Transactions`;
    }
  };

  const handleSettingsClick = () => {
    setSettingsModalOpen(true);
  };

  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false);
  };

  const handleClearInvalidCategories = () => {
    // Find all transactions with invalid categories and clear them
    const transactionsToUpdate = transactions
      .filter((transaction) => {
        if (!transaction.categoryId) return false;
        return !flatCategories.some((cat) => cat.id === transaction.categoryId);
      })
      .map((t) => t.id);

    if (transactionsToUpdate.length > 0) {
      dispatch(
        transactionActions.updateMultipleTransactionsFields(
          transactionsToUpdate,
          { categoryId: null }
        )
      );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          borderBottom: '1px solid black',
          width: '100%',
        }}
      >
        Ledger Settings
      </Typography>
      <Box>
        <SettingsPanelItem>
          <AccountTypePicker account={account} />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <StatementDayInput account={account} />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Current Balance'
            balance={completedBalance}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Pending Balance'
            balance={pendingBalance}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Scheduled Balance'
            balance={scheduledBalance}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <BalanceDisplay
            label='Future Balance'
            balance={futureBalance}
          />
        </SettingsPanelItem>
        <SettingsPanelItem>
          <Button
            variant='outlined'
            fullWidth
            onClick={handleSettingsClick}
            sx={{ mt: 2 }}
          >
            Account Settings
          </Button>
        </SettingsPanelItem>
        <SettingsPanelItem>
          <Button
            variant='contained'
            fullWidth
            disabled={selectedCount === 0}
            onClick={onBulkEditClick}
            sx={{ mt: 2 }}
          >
            {getBulkEditButtonText()}
          </Button>
        </SettingsPanelItem>
        <SettingsPanelItem>
          <Button
            variant='outlined'
            color='warning'
            fullWidth
            disabled={invalidCategoryCount === 0}
            onClick={handleClearInvalidCategories}
            sx={{ mt: 2 }}
          >
            Clear Invalid Categories
            {invalidCategoryCount > 0 && ` (${invalidCategoryCount})`}
          </Button>
        </SettingsPanelItem>
      </Box>
      <AccountSettingsModal
        open={settingsModalOpen}
        onClose={handleSettingsModalClose}
        account={account}
      />
    </Box>
  );
}

SettingsPanel.propTypes = {
  account: PropTypes.object.isRequired,
  selectedCount: PropTypes.number,
  onBulkEditClick: PropTypes.func,
};
