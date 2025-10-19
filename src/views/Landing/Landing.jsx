import {
  Box,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
} from '@mui/material';

export default function Landing() {
  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h3'
          component='h1'
          gutterBottom
        >
          Welcome to Luca Ledger
        </Typography>
        <Typography
          variant='h6'
          color='text.secondary'
          paragraph
        >
          A simple, powerful personal finance management application for
          tracking your expenses across multiple accounts.
        </Typography>
      </Box>

      {/* Overview Section */}
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h4'
          gutterBottom
        >
          Overview
        </Typography>
        <Typography paragraph>
          Luca Ledger is a React-based personal finance management application
          designed to help you track expenses, manage multiple accounts, and
          maintain a clear picture of your financial health. The application
          supports multiple account types including Checking, Savings, and
          Credit Card accounts.
        </Typography>
      </Paper>

      {/* Upcoming Features Section */}
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h4'
          gutterBottom
        >
          Upcoming Features
        </Typography>
        <Typography component='div'>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Data Encryption at Rest:</strong> Your financial data will
              be encrypted when stored, ensuring maximum security and privacy
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
            <li>
              <strong>Transaction Categories:</strong> Improved category
              management with custom categories and subcategories
            </li>
          </ul>
        </Typography>
      </Paper>

      {/* Data Storage Section */}
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h4'
          gutterBottom
        >
          Data Storage &amp; Privacy
        </Typography>
        <Typography paragraph>
          Your data privacy is our top priority. Luca Ledger stores all your
          financial data locally in your browser&apos;s localStorage. This
          means:
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
          </ul>
        </Typography>
        <Typography
          paragraph
          sx={{ mt: 2 }}
        >
          <strong>Version 2 Data Format:</strong> The latest version introduces
          an improved data structure that provides better performance and more
          flexibility for future features. If you&apos;re upgrading from an
          earlier version, your data will be automatically migrated to the new
          format on first load.
        </Typography>
      </Paper>

      {/* How to Use Section */}
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h4'
          gutterBottom
        >
          How to Use the App
        </Typography>
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
      </Paper>

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
