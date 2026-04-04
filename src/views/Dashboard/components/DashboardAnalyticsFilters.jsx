import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from '@mui/material';

import { utils as accountUtils } from '@/store/accounts';

export default function DashboardAnalyticsFilters({
  accounts,
  excludeClosedAccounts,
  excludedAccountIds,
  onExcludeClosedAccountsChange,
  onToggleAccount,
  onReset,
}) {
  const includedCount = accounts.filter((account) => {
    if (excludeClosedAccounts && accountUtils.isAccountClosed(account)) {
      return false;
    }

    return !excludedAccountIds.includes(account.id);
  }).length;

  const hasActiveFilters =
    excludeClosedAccounts || excludedAccountIds.length > 0;

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        border: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 1,
        }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
            Analytics Filters
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            UI only. Resets on refresh.
          </Typography>
        </Box>
        <Button onClick={onReset} disabled={!hasActiveFilters}>
          Reset
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={excludeClosedAccounts}
            onChange={(event) =>
              onExcludeClosedAccountsChange(event.target.checked)
            }
            size='small'
          />
        }
        label='Exclude closed accounts'
        sx={{ mb: 1 }}
      />

      <Typography variant='caption' color='text.secondary'>
        Included {includedCount} of {accounts.length} accounts. Click an account
        chip to exclude or re-include it.
      </Typography>

      <Box
        sx={{
          mt: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {accounts.map((account) => {
          const isClosed = accountUtils.isAccountClosed(account);
          const isExcludedByClosedToggle = excludeClosedAccounts && isClosed;
          const isManuallyExcluded = excludedAccountIds.includes(account.id);
          const isIncluded = !isExcludedByClosedToggle && !isManuallyExcluded;

          return (
            <Chip
              key={account.id}
              label={`${account.name}${isClosed ? ' (Closed)' : ''}`}
              clickable={!isExcludedByClosedToggle}
              disabled={isExcludedByClosedToggle}
              onClick={() => onToggleAccount(account.id)}
              color={isIncluded ? 'primary' : 'default'}
              variant={isIncluded ? 'filled' : 'outlined'}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
