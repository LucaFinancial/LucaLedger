import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import AccountTypePicker from '@/components/AccountTypePicker';
import StatementDayInput from '@/components/StatementDayInput';
import BalanceDisplay from '@/components/BalanceDisplay';
import { SettingsPanelItem } from './SettingsPanelItem';
import { selectors as transactionSelectors } from '@/store/transactions';

export default function SettingsPanel({ account }) {
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id)
  );

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
      </Box>
    </Box>
  );
}

SettingsPanel.propTypes = {
  account: PropTypes.object.isRequired,
};
