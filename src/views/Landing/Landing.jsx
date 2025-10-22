import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
} from '@mui/material';

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
        <Typography
          variant='h5'
          color='text.secondary'
          paragraph
          sx={{ maxWidth: '800px', mx: 'auto', fontWeight: 400 }}
        >
          A simple, powerful personal finance management application for
          tracking your expenses across multiple accounts.
        </Typography>
      </Box>

      {/* Overview Section */}
      <Section title='Overview'>
        <Typography paragraph>
          Luca Ledger is a React-based personal finance management application
          designed to help you track expenses, manage multiple accounts, and
          maintain a clear picture of your financial health. The application
          supports multiple account types including Checking, Savings, and
          Credit Card accounts.
        </Typography>
      </Section>

      {/* New in Version 2 Section */}
      <Section title='New in Version 2'>
        <Typography component='div'>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Bulk Edit for Transactions:</strong> Efficiently edit
              multiple transactions at once, saving time and improving data
              management
            </li>
            <li>
              <strong>Enhanced Security:</strong> Data encryption at rest with
              industry standard AES-256 encryption and migration from
              localStorage to IndexedDB for better performance and security
            </li>
            <li>
              <strong>Improved File Handling:</strong> All accounts and
              transactions are now stored in a single unified file format, with
              transactions separated from account data for better organization
            </li>
            <li>
              <strong>Clear Filter Button in Ledger View:</strong> Small
              improvement to quickly clear filter text in the ledger view with a
              convenient clear button
            </li>
            <li>
              <strong>Data Refactor:</strong> Unified store architecture with
              migration to new data format and cleanup of deprecated structures
              for improved performance
            </li>
          </ul>
        </Typography>
      </Section>

      {/* Coming Next Section */}
      <Section title='Coming Next'>
        <Typography component='div'>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Convert Amounts to Integer Minor Units:</strong> Improved
              precision for monetary calculations by storing amounts in minor
              units (cents)
            </li>
            <li>
              <strong>User Settings Page:</strong> Customize your experience
              with personalized settings and preferences
            </li>
            <li>
              <strong>Account Settings Page:</strong> Manage account-specific
              settings and configurations
            </li>
            <li>
              <strong>Recurring Transactions:</strong> Set up automatic
              recurring expenses and income to streamline your budgeting process
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
            <li>
              <strong>Transaction Categories:</strong> Improved category
              management with custom categories and subcategories
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
              future features. If you&apos;re upgrading from an earlier version,
              your data will be automatically migrated to the new format on
              first load
            </li>
          </ul>
        </Typography>
      </Section>

      {/* How to Use Section */}
      <Section title='How to Use the App'>
        <Typography paragraph>
          Getting started with Luca Ledger is easy. Follow these simple steps:
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
              page and click &quot;Create New Account&quot; to set up your first
              checking, savings, or credit card account.
            </li>
            <li>
              <strong>Add Transactions:</strong> Click on any account to view
              its ledger. Here you can add, edit, and categorize your
              transactions.
            </li>
            <li>
              <strong>View Your Dashboard:</strong> Visit the{' '}
              <MuiLink
                href='/dashboard'
                underline='hover'
              >
                Dashboard
              </MuiLink>{' '}
              to see a comprehensive overview of all your accounts and their
              current balances.
            </li>
            <li>
              <strong>Track Your Spending:</strong> Use the balance cards to
              monitor your checking, savings, and credit card totals at a
              glance.
            </li>
            <li>
              <strong>Manage Your Data:</strong> Use the save/load functionality
              in the header to backup your data or restore from a previous
              backup.
            </li>
          </ol>
        </Typography>
        <Typography
          paragraph
          sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}
        >
          Tip: For detailed instructions and advanced features, refer to the
          User Guide accessible from the application.
        </Typography>
      </Section>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant='body2'>
          Ready to get started? Navigate to{' '}
          <MuiLink
            href='/accounts'
            underline='hover'
          >
            Accounts
          </MuiLink>{' '}
          to create your first account, or visit the{' '}
          <MuiLink
            href='/dashboard'
            underline='hover'
          >
            Dashboard
          </MuiLink>{' '}
          to see your financial overview.
        </Typography>
      </Box>
    </Container>
  );
}
