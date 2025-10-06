import { Box, Grid, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectors } from '@/store/accountsLegacy';
import AccountCard from './AccountCard';
import ButtonGroup from './ButtonGroup';

const accountSortByName = (a, b) => a.name.localeCompare(b.name);

export default function Accounts() {
  const accounts = useSelector(selectors.selectAccounts);
  const sortedAccounts = [...accounts].sort(accountSortByName);

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
    >
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
