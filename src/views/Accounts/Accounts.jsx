import { Box, Grid, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectors as accountSelectors } from '@/store/accounts';
import AccountCard from './AccountCard';
import ButtonGroup from './ButtonGroup';
import BetaBanner from '@/components/BetaBanner';

const accountSortByName = (a, b) => a.name.localeCompare(b.name);

export default function Accounts() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const sortedAccounts = [...accounts].sort(accountSortByName);

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
    >
      <Box sx={{ width: '98%', maxWidth: '1200px', mt: 2 }}>
        <BetaBanner />
      </Box>
      <Typography
        variant='h3'
        style={{ fontWeight: 'bold', padding: '25px' }}
      >
        Accounts
      </Typography>
      <Grid
        container
        spacing={3}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '98%',
        }}
      >
        {sortedAccounts.map((account) => (
          <Grid
            item
            key={account.id}
          >
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>
      <ButtonGroup />
    </Box>
  );
}
