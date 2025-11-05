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
          <Typography
            variant='body1'
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            We&apos;re actively developing exciting new features to make Luca
            Ledger even more powerful for managing your finances:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Double-entry Accounting */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#9c27b0',
                backgroundColor: '#f3e5f5',
                '&:hover': {
                  backgroundColor: '#e1bee7',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#7b1fa2', mb: 1 }}
              >
                📚 Double-Entry Accounting
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Professional-grade double-entry bookkeeping system for accurate
                financial tracking with debits, credits, and automatic balance
                reconciliation.
              </Typography>
            </Paper>

            {/* Recurring Transactions */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#00bcd4',
                backgroundColor: '#e0f7fa',
                '&:hover': {
                  backgroundColor: '#b2ebf2',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#0097a7', mb: 1 }}
              >
                🔄 Recurring Transactions
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Automate your regular expenses and income with flexible
                recurring transaction patterns. Set it once and let the system
                handle monthly bills, subscriptions, and paychecks.
              </Typography>
            </Paper>

            {/* Enhanced Reporting */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#ff5722',
                backgroundColor: '#fbe9e7',
                '&:hover': {
                  backgroundColor: '#ffccbc',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#d84315', mb: 1 }}
              >
                📈 Advanced Reporting & Analytics
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Interactive charts, spending trends, and customizable reports to
                visualize your financial health. Export reports as PDF or CSV
                for tax preparation and record-keeping.
              </Typography>
            </Paper>

            {/* Budget Management */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#4caf50',
                backgroundColor: '#e8f5e9',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}
              >
                🎯 Smart Budget Management
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Create and monitor budgets by category with real-time alerts
                when approaching limits. Track your progress and adjust spending
                to meet your financial goals.
              </Typography>
            </Paper>

            {/* Investment Account Tracking */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#673ab7',
                backgroundColor: '#ede7f6',
                '&:hover': {
                  backgroundColor: '#d1c4e9',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#512da8', mb: 1 }}
              >
                📊 Investment Account Tracking
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Monitor your investment portfolios alongside traditional
                accounts. Track stocks, bonds, mutual funds, and other assets
                with performance metrics and portfolio allocation insights.
              </Typography>
            </Paper>
          </Box>
        </Section>

        {/* Data Storage Section */}
        <Section title='Data Storage & Privacy'>
          <Typography
            variant='body1'
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Your data privacy is our top priority. Luca Ledger is built with a
            privacy-first approach, ensuring your financial information stays
            completely under your control.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Complete Privacy */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#4caf50',
                backgroundColor: '#e8f5e9',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}
              >
                🔐 Complete Privacy
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Your financial data never leaves your device. Everything is
                stored locally in your browser&apos;s IndexedDB with no servers,
                no cloud sync, and no third-party access. Your data is yours
                alone.
              </Typography>
            </Paper>

            {/* Offline Capability */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#2196f3',
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}
              >
                ✈️ Works Completely Offline
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Once loaded, the application works entirely offline. Manage your
                finances anywhere, anytime—no internet connection required. Your
                data stays on your device and accessible only to you.
              </Typography>
            </Paper>

            {/* Enhanced Security */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#ff9800',
                backgroundColor: '#fff3e0',
                '&:hover': {
                  backgroundColor: '#ffe0b2',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}
              >
                🛡️ Industry-Standard Encryption
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Optional AES-256 encryption at rest protects your financial data
                with the same encryption standard used by banks and government
                agencies. Enable encryption in settings for an additional layer
                of security.
              </Typography>
            </Paper>

            {/* Modern Data Format */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#9c27b0',
                backgroundColor: '#f3e5f5',
                '&:hover': {
                  backgroundColor: '#e1bee7',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#7b1fa2', mb: 1 }}
              >
                🚀 Modern Storage Architecture
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Version 2 uses IndexedDB for superior performance and
                reliability compared to localStorage. Enjoy faster data access,
                better organization, and seamless automatic migration from
                earlier versions.
              </Typography>
            </Paper>

            {/* Export & Backup */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#00bcd4',
                backgroundColor: '#e0f7fa',
                '&:hover': {
                  backgroundColor: '#b2ebf2',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#0097a7', mb: 1 }}
              >
                💾 Easy Export & Backup
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Full control over your data with simple export and import
                functionality. Create backups anytime, transfer between devices,
                or keep archives for your records—all in a standard,
                human-readable JSON format.
              </Typography>
            </Paper>
          </Box>
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
