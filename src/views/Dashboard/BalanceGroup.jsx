import { useAccountBalances } from '@/hooks/useAccountBalances';
import { selectors } from '@/store/accounts';
import { selectors as transactionSelectors } from '@/store/transactions';
import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import BalanceCard from './BalanceCard';

export default function BalanceGroup({ accountType }) {
  const accounts = useSelector(selectors.selectAccounts);
  const allTransactions = useSelector(transactionSelectors.selectTransactions);
  const filteredAccounts = accounts.filter(
    (account) => account.type === accountType
  );
  const { totals } = useAccountBalances(filteredAccounts, allTransactions);

  return (
    <Grid
      container
      spacing={3}
      sx={{ mb: 4 }}
    >
      {[
        {
          title: 'Current Balance',
          amount: totals.current,
          color: '#2196f3',
        },
        { title: 'Pending', amount: totals.pending, color: '#ff9800' },
        { title: 'Scheduled', amount: totals.scheduled, color: '#4caf50' },
        { title: 'Future Balance', amount: totals.future, color: '#9c27b0' },
      ].map((balance) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={balance.title}
        >
          <BalanceCard
            {...balance}
            total={totals.future}
          />
        </Grid>
      ))}
    </Grid>
  );
}

BalanceGroup.propTypes = {
  accountType: PropTypes.string.isRequired,
};
