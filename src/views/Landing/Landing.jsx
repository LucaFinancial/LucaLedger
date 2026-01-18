import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
          pt: 2,
          px: 4,
          pb: 4,
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
            Welcome to Luca Ledger
          </Typography>
        </Box>

        {/* New in Version 2 Section */}
        <Section title='New in Version 2'>
          <Typography variant='body1' sx={{ mb: 2, color: 'text.secondary' }}>
            Version 2 brings powerful new capabilities and architectural
            improvements to help you manage your finances more effectively and
            securely.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Transaction Categories */}
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
                📊 Transaction Categories
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                ✏️ Bulk Edit for Transactions
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                🔒 Enhanced Security
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                📁 Unified File Format
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                💰 Improved Precision
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
              <Typography variant='body1' color='text.secondary'>
                Modern, intuitive ledger interface with enhanced balance cards,
                interactive spending visualizations by category with pie charts,
                and smart filtering by month and transaction status for better
                financial insights.
              </Typography>
            </Paper>

            {/* Statements Feature */}
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
                sx={{ fontWeight: 600, color: '#4527a0', mb: 1 }}
              >
                📄 Statements Feature
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Generate comprehensive financial statements for your accounts.
                View detailed transaction histories, account summaries, and
                export statements for record-keeping and tax purposes.
              </Typography>
            </Paper>

            {/* Improved Dashboard */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#3f51b5',
                backgroundColor: '#e8eaf6',
                '&:hover': {
                  backgroundColor: '#c5cae9',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#283593', mb: 1 }}
              >
                📊 Improved Dashboard
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Enhanced dashboard with comprehensive financial overview, visual
                spending trends, account balance summaries, and quick access to
                recent transactions for better financial management at a glance.
              </Typography>
            </Paper>

            {/* Analytics for Spending by Categories */}
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
                📈 Analytics for Spending by Categories
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Powerful analytics tools to track spending patterns across
                categories. Visualize your expenses with interactive charts,
                identify spending trends, and make data-driven financial
                decisions.
              </Typography>
            </Paper>
          </Box>
        </Section>

        {/* Coming Next Section */}
        <Section title='Coming Next'>
          <Typography variant='body1' sx={{ mb: 3, color: 'text.secondary' }}>
            We&apos;re actively developing exciting new features to make Luca
            Ledger even more powerful for managing your finances:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Split Categories */}
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
                🔀 Split Categories for Transactions
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Allocate a single transaction across multiple categories with
                custom split amounts. Perfect for purchases covering different
                expense types like groceries and household items in one trip.
              </Typography>
            </Paper>

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
              <Typography variant='body1' color='text.secondary'>
                Professional-grade double-entry bookkeeping system for accurate
                financial tracking with debits, credits, and automatic balance
                reconciliation. Link transactions across accounts to track
                transfers, payments, and movements between your checking,
                savings, and credit card accounts seamlessly.
              </Typography>
            </Paper>

            {/* Recurring Transactions */}
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
                🔄 Recurring Transactions
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                📈 Advanced Reporting & Analytics
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                🎯 Smart Budget Management
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                📊 Investment Account Tracking
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Monitor your investment portfolios alongside traditional
                accounts. Track stocks, bonds, mutual funds, and other assets
                with performance metrics and portfolio allocation insights.
              </Typography>
            </Paper>

            {/* Rolling Year Option for Continuous Date Range */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#795548',
                backgroundColor: '#efebe9',
                '&:hover': {
                  backgroundColor: '#d7ccc8',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#4e342e', mb: 1 }}
              >
                📅 &quot;Rolling&quot; Year Option for Continuous Date Range
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Track your finances with a rolling 12-month window that
                continuously updates to show the last year of activity. Perfect
                for monitoring annual spending trends and year-over-year
                comparisons without manual date adjustments.
              </Typography>
            </Paper>

            {/* Enhanced Monthly Grouping and Separator */}
            <Paper
              elevation={1}
              sx={{
                p: 2.5,
                borderLeft: '4px solid',
                borderColor: '#607d8b',
                backgroundColor: '#eceff1',
                '&:hover': {
                  backgroundColor: '#cfd8dc',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#37474f', mb: 1 }}
              >
                📋 Enhanced Monthly Grouping and Separator
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Improved transaction organization with clear monthly separators
                and groupings. Navigate through your transaction history more
                easily with visual month boundaries and summary totals for each
                period.
              </Typography>
            </Paper>
          </Box>
        </Section>

        {/* Data Storage Section */}
        <Section title='Data Storage & Privacy'>
          <Typography variant='body1' sx={{ mb: 3, color: 'text.secondary' }}>
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
                🔐 Complete Privacy
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                ✈️ Works Completely Offline
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                🛡️ Industry-Standard Encryption
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
                🚀 Modern Storage Architecture
              </Typography>
              <Typography variant='body1' color='text.secondary'>
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
              <Typography variant='body1' color='text.secondary'>
                Full control over your data with simple export and import
                functionality. Create backups anytime, transfer between devices,
                or keep archives for your records—all in a standard,
                human-readable JSON format.
              </Typography>
            </Paper>
          </Box>
        </Section>
      </Container>
    </Box>
  );
}
