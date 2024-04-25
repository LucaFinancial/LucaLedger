import { Box, Grid, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { selectAllAccounts } from './store/selectors';
import AccountCard from './components/AccountCard';
import ButtonGroup from './components/ButtonGroup';

const accountSortByName = (a, b) => a.name.localeCompare(b.name);

export default function AccountsPage() {
  const accounts = useSelector(selectAllAccounts);
  const sortedAccounts = [...accounts].sort(accountSortByName);

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      height='100vh'
    >
      <Typography
        variant='h3'
        style={{ fontWeight: 'bold', padding: '18px' }}
      >
        Accounts
      </Typography>
      <Grid
        container
        spacing={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '60%',
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
