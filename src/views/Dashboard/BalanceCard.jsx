import { formatCentsAsDollars } from '@/utils';
import { Card, CardContent, LinearProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const BalanceCard = ({ title, amount, total, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography
        color='textSecondary'
        gutterBottom
      >
        {title}
      </Typography>
      <Typography
        variant='h4'
        component='div'
      >
        ${formatCentsAsDollars(amount)}
      </Typography>
      <LinearProgress
        variant='determinate'
        value={(amount / total) * 100}
        sx={{
          mt: 2,
          height: 8,
          borderRadius: 5,
          backgroundColor: `${color}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </CardContent>
  </Card>
);

BalanceCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default BalanceCard;
