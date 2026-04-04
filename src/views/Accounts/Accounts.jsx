import { Box, FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectors as accountSelectors, utils as accountUtils } from '@/store/accounts';
import AccountCard from './AccountCard';
import ButtonGroup from './ButtonGroup';

const accountSortByName = (a, b) => a.name.localeCompare(b.name);

export default function Accounts() {
  const accounts = useSelector(accountSelectors.selectAccounts);
  const [showClosedAccounts, setShowClosedAccounts] = useState(false);
  const sortedAccounts = useMemo(
    () => [...accounts].sort(accountSortByName),
    [accounts],
  );
  const visibleAccounts = useMemo(
    () =>
      sortedAccounts.filter(
        (account) =>
          showClosedAccounts || !accountUtils.isAccountClosed(account),
      ),
    [showClosedAccounts, sortedAccounts],
  );

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <Typography variant='h3' style={{ fontWeight: 'bold', padding: '25px' }}>
        Accounts
      </Typography>
      <Box
        sx={{
          width: '98%',
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={showClosedAccounts}
              onChange={(event) => setShowClosedAccounts(event.target.checked)}
              color='error'
            />
          }
          label='Show Closed Accounts'
        />
      </Box>
      <Grid
        container
        spacing={3}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '98%',
        }}
      >
        {visibleAccounts.map((account) => (
          <Grid key={account.id} size='auto'>
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>
      <ButtonGroup />
    </Box>
  );
}
