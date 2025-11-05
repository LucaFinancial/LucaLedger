import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
} from '@mui/material';
import BetaBanner from '@/components/BetaBanner';

// Reusable Section Component
function Section({ title, children }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        '&:hover': {
          boxShadow: 6,
        },
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <Typography
        variant='h4'
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          borderBottom: '2px solid',
          borderColor: 'primary.light',
          pb: 1,
          mb: 3,
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Landing() {
  return (
    <Box>
      <Box sx={{ px: 3, pt: 3 }}>
        <BetaBanner />
      </Box>
      <Container
        maxWidth='lg'
        sx={{ py: 4 }}
      >
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
            Welcome to Luca Ledger
          </Typography>
        </Box>

        {/* New in Version 2 Section */}
        <Section title='New in Version 2'>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Transaction Categories */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: 'success.main',
                backgroundColor: 'success.50',
                '&:hover': {
                  backgroundColor: 'success.100',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'success.dark', mb: 1 }}
              >
                📊 Transaction Categories
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Organize your finances with custom categories and subcategories.
                Track spending by category and gain insights into where your
                money goes.
              </Typography>
            </Paper>

            {/* Bulk Edit */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
                '&:hover': {
                  backgroundColor: 'primary.100',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}
              >
                ✏️ Bulk Edit for Transactions
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Efficiently edit multiple transactions at once, saving time and
                improving data management.
              </Typography>
            </Paper>

            {/* Enhanced Security */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: 'warning.main',
                backgroundColor: 'warning.50',
                '&:hover': {
                  backgroundColor: 'warning.100',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'warning.dark', mb: 1 }}
              >
                🔒 Enhanced Security
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Data encryption at rest with industry standard AES-256
                encryption and migration from localStorage to IndexedDB for
                better performance and security.
              </Typography>
            </Paper>

            {/* Improved File Handling */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: 'info.main',
                backgroundColor: 'info.50',
                '&:hover': {
                  backgroundColor: 'info.100',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'info.dark', mb: 1 }}
              >
                📁 Unified File Format
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                All accounts and transactions are now stored in a single unified
                file format, with transactions separated from account data for
                better organization.
              </Typography>
            </Paper>

            {/* Precision Improvements */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: 'secondary.main',
                backgroundColor: 'secondary.50',
                '&:hover': {
                  backgroundColor: 'secondary.100',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'secondary.dark', mb: 1 }}
              >
                💰 Improved Precision
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Enhanced monetary calculations by storing amounts in minor units
                (cents), eliminating floating-point errors.
              </Typography>
            </Paper>

            {/* Additional Features */}
            <Box sx={{ mt: 1 }}>
              <Typography
                variant='h6'
                sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}
              >
                Plus many more improvements:
              </Typography>
              <Box
                component='ul'
                sx={{
                  listStyle: 'none',
                  pl: 0,
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <Box
                  component='li'
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ color: 'primary.main', mt: 0.5 }}>✓</Box>
                  <Typography variant='body2'>
                    Clear filter button in ledger view
                  </Typography>
                </Box>
                <Box
                  component='li'
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ color: 'primary.main', mt: 0.5 }}>✓</Box>
                  <Typography variant='body2'>
                    User settings page for personalization
                  </Typography>
                </Box>
                <Box
                  component='li'
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ color: 'primary.main', mt: 0.5 }}>✓</Box>
                  <Typography variant='body2'>
                    Account-specific settings page
                  </Typography>
                </Box>
                <Box
                  component='li'
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ color: 'primary.main', mt: 0.5 }}>✓</Box>
                  <Typography variant='body2'>
                    Unified store architecture
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Section>

        {/* Coming Next Section */}
        <Section title='Coming Next'>
          <Typography component='div'>
            <ul style={{ lineHeight: '1.8' }}>
              <li>
                <strong>Double-entry Accounting:</strong> Implement double-entry
                bookkeeping for accurate financial tracking
              </li>
              <li>
                <strong>Recurring Transactions:</strong> Set up automatic
                recurring expenses and income to streamline your budgeting
                process
              </li>
              <li>
                <strong>Enhanced Reporting:</strong> More detailed financial
                reports and visualizations to help you understand your spending
                patterns
              </li>
              <li>
                <strong>Budget Management:</strong> Set and track budgets for
                different categories to stay on top of your spending goals
              </li>
            </ul>
          </Typography>
        </Section>

        {/* Data Storage Section */}
        <Section title='Data Storage & Privacy'>
          <Typography paragraph>
            Your data privacy is our top priority. Luca Ledger stores all your
            financial data locally in your browser&apos;s IndexedDB. This means:
          </Typography>
          <Typography component='div'>
            <ul style={{ lineHeight: '1.8' }}>
              <li>
                <strong>Complete Privacy:</strong> Your financial data never
                leaves your device and is not sent to any servers
              </li>
              <li>
                <strong>Offline Capability:</strong> The application works
                completely offline once loaded
              </li>
              <li>
                <strong>Enhanced Security:</strong> Optional data encryption at
                rest with industry standard AES-256 encryption to protect your
                financial information
              </li>
              <li>
                <strong>Improved Data Format:</strong> Version 2 introduces an
                improved data structure with IndexedDB storage that provides
                better performance, enhanced security, and more flexibility for
                future features. If you&apos;re upgrading from an earlier
                version, your data will be automatically migrated to the new
                format on first load
              </li>
            </ul>
          </Typography>
        </Section>

        {/* How to Use Section */}
        <Section title='How to Use the App'>
          <Typography paragraph>
            Luca Ledger is designed to be intuitive and easy to use. This
            section will guide you through the essential features to help you
            manage your finances effectively.
          </Typography>
          <Typography component='div'>
            <ol style={{ lineHeight: '2' }}>
              <li>
                <strong>Create Your First Account:</strong> Navigate to the{' '}
                <MuiLink
                  href='/accounts'
                  underline='hover'
                >
                  Accounts
                </MuiLink>{' '}
                page and click &quot;Create New Account&quot; to set up a
                checking, savings, or credit card account.
              </li>
              <li>
                <strong>Add Transactions:</strong> Click on any account to view
                its ledger and add, edit, or categorize transactions.
              </li>
              <li>
                <strong>View Your Dashboard:</strong> Visit the{' '}
                <MuiLink
                  href='/dashboard'
                  underline='hover'
                >
                  Dashboard
                </MuiLink>{' '}
                to see an overview of all your accounts and current balances.
              </li>
              <li>
                <strong>Track Your Spending:</strong> Use the balance cards to
                monitor checking, savings, and credit card totals at a glance.
              </li>
              <li>
                <strong>Manage Your Data:</strong> Use the save/load
                functionality in the header to backup or restore your data.
              </li>
            </ol>
          </Typography>
        </Section>
      </Container>
    </Box>
  );
}
