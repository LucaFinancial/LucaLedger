import {
  Box,
  Typography,
  Container,
  Link as MuiLink,
  Paper,
} from '@mui/material';

export default function Help() {
  return (
    <Box>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant='h2'
            component='h1'
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            How to Use Luca Ledger
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: 'text.secondary', maxWidth: 800, mx: 'auto' }}
          >
            Luca Ledger is designed to be intuitive and easy to use. Follow
            these steps to get started managing your finances effectively.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Step 1 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              1
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                Create Your First Account
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Navigate to the{' '}
                <MuiLink
                  href='/accounts'
                  underline='hover'
                  sx={{ fontWeight: 600 }}
                >
                  Accounts
                </MuiLink>{' '}
                page and click &quot;Create New Account&quot; to set up a
                checking, savings, or credit card account. Give it a meaningful
                name and set the initial balance to get started.
              </Typography>
            </Box>
          </Box>

          {/* Step 2 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              2
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                Add and Manage Transactions
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Click on any account card to open its ledger. Add new
                transactions with descriptions, amounts, dates, and categories.
                Edit or delete existing transactions as needed. Use transaction
                statuses (Complete, Scheduled, Planned) to track future
                expenses.
              </Typography>
            </Box>
          </Box>

          {/* Step 3 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              3
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                Organize with Categories
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Visit the{' '}
                <MuiLink
                  href='/categories'
                  underline='hover'
                  sx={{ fontWeight: 600 }}
                >
                  Categories
                </MuiLink>{' '}
                page to create custom categories and subcategories for your
                transactions. Organize expenses by type (groceries, utilities,
                entertainment) to gain insights into your spending patterns.
              </Typography>
            </Box>
          </Box>

          {/* Step 4 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              4
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                Monitor Your Financial Dashboard
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Check the{' '}
                <MuiLink
                  href='/dashboard'
                  underline='hover'
                  sx={{ fontWeight: 600 }}
                >
                  Dashboard
                </MuiLink>{' '}
                regularly to see an overview of all your accounts, current
                balances, recent activity, and spending breakdowns by category.
                Track your financial health at a glance.
              </Typography>
            </Box>
          </Box>

          {/* Step 5 */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              5
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                Backup and Restore Your Data
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Use the save/load functionality in the navigation menu to export
                your data as a backup file. Keep regular backups to protect your
                financial records and enable easy transfer between devices or
                browsers.
              </Typography>
            </Box>
          </Box>

          {/* Pro Tips */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mt: 2,
              backgroundColor: '#e3f2fd',
              borderLeft: '4px solid #2196f3',
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: '#1565c0', mb: 2 }}
            >
              💡 Pro Tips
            </Typography>
            <Box
              component='ul'
              sx={{
                m: 0,
                pl: 3,
                '& li': { mb: 1.5, color: 'text.secondary' },
              }}
            >
              <li>
                <Typography variant='body2'>
                  Use the bulk edit feature to quickly categorize multiple
                  transactions at once
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  Set transaction statuses to &quot;Scheduled&quot; for upcoming
                  bills to plan ahead
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  Enable encryption in{' '}
                  <MuiLink
                    href='/settings'
                    underline='hover'
                    sx={{ fontWeight: 600 }}
                  >
                    Settings
                  </MuiLink>{' '}
                  for an extra layer of security
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  Create subcategories to track specific spending areas within
                  broader categories
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  Review your dashboard weekly to stay on top of your financial
                  health
                </Typography>
              </li>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
