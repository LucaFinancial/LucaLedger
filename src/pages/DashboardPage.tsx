import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Receipt,
  AccountBalance,
} from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const SummaryCard = ({ title, value, icon: Icon }: SummaryCardProps) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
      <Box>
        <Typography
          color='textSecondary'
          variant='body2'
        >
          {title}
        </Typography>
        <Typography variant='h5'>{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant='h4'>Dashboard</Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 220px' }}>
          <SummaryCard
            title='Total Balance'
            value='$5,240.00'
            icon={AccountBalance}
          />
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <SummaryCard
            title='Monthly Income'
            value='$3,500.00'
            icon={TrendingUp}
          />
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <SummaryCard
            title='Monthly Expenses'
            value='$2,100.00'
            icon={AttachMoney}
          />
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <SummaryCard
            title='Pending Bills'
            value='$450.00'
            icon={Receipt}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 600px' }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography
              variant='h6'
              sx={{ mb: 2 }}
            >
              Spending Overview
            </Typography>
            {/* Chart Component */}
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px' }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography
              variant='h6'
              sx={{ mb: 2 }}
            >
              Recent Transactions
            </Typography>
            {/* Transactions List */}
          </Card>
        </Box>
      </Box>

      <Card sx={{ p: 2 }}>
        <Typography
          variant='h6'
          sx={{ mb: 2 }}
        >
          Budget Status
        </Typography>
        {/* Budget Progress Bars */}
      </Card>
    </Stack>
  );
};

export default DashboardPage;
