import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance,
  Security,
  Analytics,
  Speed,
} from '@mui/icons-material';

import { SvgIconComponent } from '@mui/icons-material';

interface FeatureCardProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card sx={{ p: 3, height: '100%' }}>
    <Stack
      spacing={2}
      alignItems='center'
      textAlign='center'
    >
      <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
      <Typography variant='h6'>{title}</Typography>
      <Typography color='text.secondary'>{description}</Typography>
    </Stack>
  </Card>
);

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          backgroundColor: 'primary.light',
        }}
      >
        <Container maxWidth='md'>
          <Typography
            variant='h2'
            gutterBottom
          >
            Take Control of Your Finances
          </Typography>
          <Typography
            variant='h5'
            color='text.secondary'
            paragraph
          >
            Track expenses, manage budgets, and achieve your financial goals
            with Luca Ledger
          </Typography>
          <Button
            size='large'
            variant='contained'
            onClick={() => navigate('/register')}
            sx={{ mt: 4 }}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container>
        <Typography
          variant='h3'
          textAlign='center'
          gutterBottom
        >
          Features
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr',
            },
          }}
        >
          <FeatureCard
            icon={AccountBalance}
            title='Expense Tracking'
            description='Track all your expenses in one place with automatic categorization'
          />
          <FeatureCard
            icon={Security}
            title='Secure'
            description='Bank-level security to keep your financial data safe'
          />
          <FeatureCard
            icon={Analytics}
            title='Smart Analytics'
            description='Gain insights into your spending habits with detailed reports'
          />
          <FeatureCard
            icon={Speed}
            title='Real-time Updates'
            description='Stay up to date with instant transaction notifications'
          />
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
        }}
      >
        <Container>
          <Typography
            variant='h4'
            gutterBottom
          >
            Ready to Start?
          </Typography>
          <Typography
            variant='h6'
            sx={{ mb: 4 }}
          >
            Join thousands of users who trust Luca Ledger
          </Typography>
          <Button
            variant='contained'
            color='secondary'
            size='large'
            onClick={() => navigate('/register')}
          >
            Create Free Account
          </Button>
        </Container>
      </Box>
    </Stack>
  );
};

export default HomePage;
