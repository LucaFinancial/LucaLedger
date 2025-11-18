import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BetaBanner from '@/components/BetaBanner';

// Reusable Section Component (now an Accordion)
function Section({ title, children, defaultExpanded = true }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        mb: 2,
        borderRadius: 2,
        '&:before': { display: 'none' },
        boxShadow: 3,
        '&.Mui-expanded': {
          boxShadow: 6,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
          '&:hover': {
            backgroundColor: '#fafafa',
          },
          '& .MuiAccordionSummary-content': {
            my: 2,
          },
        }}
      >
        <Typography
          variant='h5'
          sx={{
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          p: 4,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
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
                borderColor: '#f44336',
                backgroundColor: '#ffebee',
                '&:hover': {
                  backgroundColor: '#ffcdd2',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#c62828', mb: 1 }}
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

            {/* Unified File Format */}
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

            {/* Refreshed Ledger View */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#009688',
                backgroundColor: '#e0f2f1',
                '&:hover': {
                  backgroundColor: '#b2dfdb',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#00695c', mb: 1 }}
              >
                🎨 Refreshed Ledger View
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
              >
                Modern, intuitive ledger interface with enhanced balance cards,
                interactive spending visualizations by category with pie charts,
                and smart filtering by month and transaction status for better
                financial insights.
              </Typography>
            </Paper>
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
          <Typography
            variant='body1'
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Luca Ledger is designed to be intuitive and easy to use. Follow
            these steps to get started managing your finances effectively.
          </Typography>
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
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Create Your First Account
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
                  Navigate to the{' '}
                  <MuiLink
                    href='/accounts'
                    underline='hover'
                    sx={{ fontWeight: 600 }}
                  >
                    Accounts
                  </MuiLink>{' '}
                  page and click &quot;Create New Account&quot; to set up a
                  checking, savings, or credit card account. Give it a
                  meaningful name and set the initial balance to get started.
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
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Add and Manage Transactions
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
                  Click on any account card to open its ledger. Add new
                  transactions with descriptions, amounts, dates, and
                  categories. Edit or delete existing transactions as needed.
                  Use transaction statuses (Complete, Scheduled, Planned) to
                  track future expenses.
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
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Organize with Categories
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
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
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Monitor Your Financial Dashboard
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
                  Check the{' '}
                  <MuiLink
                    href='/dashboard'
                    underline='hover'
                    sx={{ fontWeight: 600 }}
                  >
                    Dashboard
                  </MuiLink>{' '}
                  regularly to see an overview of all your accounts, current
                  balances, recent activity, and spending breakdowns by
                  category. Track your financial health at a glance.
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
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Backup and Restore Your Data
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                >
                  Use the save/load functionality in the navigation menu to
                  export your data as a backup file. Keep regular backups to
                  protect your financial records and enable easy transfer
                  between devices or browsers.
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
                    Set transaction statuses to &quot;Scheduled&quot; for
                    upcoming bills to plan ahead
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
                    Review your dashboard weekly to stay on top of your
                    financial health
                  </Typography>
                </li>
              </Box>
            </Paper>
          </Box>
        </Section>
      </Container>
    </Box>
  );
}
