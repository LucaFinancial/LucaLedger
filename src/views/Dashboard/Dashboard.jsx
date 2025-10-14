import { useAccountBalances } from '@/hooks/useAccountBalances';
import { selectors, constants } from '@/store/accounts';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import AccountRow from './AccountRow';
import BalanceGroup from './BalanceGroup';

export default function Dashboard() {
  const accounts = useSelector(selectors.selectAccounts);
  const { accounts: accountsWithBalances } = useAccountBalances(accounts);

  const { SAVINGS, CHECKING, CREDIT_CARD } = constants.AccountType;

  return (
    <Box sx={{ p: 3 }}>
      <AnnouncementBanner />

      <Typography
        variant='h4'
        sx={{ mb: 4 }}
      >
        Financial Overview
      </Typography>

      <Box>
        <Typography>Checking Account</Typography>
        <BalanceGroup accountType={CHECKING} />
      </Box>

      <Box>
        <Typography>Savings Account</Typography>
        <BalanceGroup accountType={SAVINGS} />
      </Box>

      <Box>
        <Typography>Credit Card</Typography>
        <BalanceGroup accountType={CREDIT_CARD} />
      </Box>

      <Typography
        variant='h5'
        sx={{ mb: 3 }}
      >
        Accounts
      </Typography>

      {accountsWithBalances.map((account, index) => (
        <AccountRow
          key={account.id || index}
          account={account}
        />
      ))}
    </Box>
  );
}
