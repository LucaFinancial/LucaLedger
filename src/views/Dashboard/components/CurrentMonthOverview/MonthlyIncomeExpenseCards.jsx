import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function MonthlyIncomeExpenseCards({
  currentMonthTotals,
  monthEndProjections,
  formatCurrency,
}) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4}>
        <Card
          sx={{
            borderTop: '3px solid #4caf50',
            backgroundColor: '#f1f8f4',
          }}
        >
          <CardContent>
            <Typography
              color='textSecondary'
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Income
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Current
                </Typography>
                <Typography
                  variant='h5'
                  sx={{ color: '#4caf50', fontWeight: 'bold' }}
                >
                  {formatCurrency(currentMonthTotals.income)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='caption' color='text.secondary'>
                  Projected
                </Typography>
                <Typography
                  variant='h5'
                  sx={{ color: '#388e3c', fontWeight: 'bold' }}
                >
                  {formatCurrency(monthEndProjections.projectedIncome)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card
          sx={{
            borderTop: '3px solid #f44336',
            backgroundColor: '#fef1f0',
          }}
        >
          <CardContent>
            <Typography
              color='textSecondary'
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Expenses
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Current
                </Typography>
                <Typography
                  variant='h5'
                  sx={{ color: '#f44336', fontWeight: 'bold' }}
                >
                  {formatCurrency(currentMonthTotals.expenses)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='caption' color='text.secondary'>
                  Projected
                </Typography>
                <Typography
                  variant='h5'
                  sx={{ color: '#d32f2f', fontWeight: 'bold' }}
                >
                  {formatCurrency(monthEndProjections.projectedExpenses)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card
          sx={{
            borderTop: '3px solid #2196f3',
            backgroundColor: '#e3f2fd',
          }}
        >
          <CardContent>
            <Typography
              color='textSecondary'
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Net Flow
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Current
                </Typography>
                <Typography
                  variant='h5'
                  sx={{
                    color:
                      currentMonthTotals.netFlow >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                  }}
                >
                  {formatCurrency(currentMonthTotals.netFlow)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='caption' color='text.secondary'>
                  Projected
                </Typography>
                <Typography
                  variant='h5'
                  sx={{
                    color:
                      monthEndProjections.projectedNetFlow >= 0
                        ? '#4caf50'
                        : '#f44336',
                    fontWeight: 'bold',
                  }}
                >
                  {formatCurrency(monthEndProjections.projectedNetFlow)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

MonthlyIncomeExpenseCards.propTypes = {
  currentMonthTotals: PropTypes.shape({
    income: PropTypes.number.isRequired,
    expenses: PropTypes.number.isRequired,
    netFlow: PropTypes.number.isRequired,
  }).isRequired,
  monthEndProjections: PropTypes.shape({
    projectedIncome: PropTypes.number.isRequired,
    projectedExpenses: PropTypes.number.isRequired,
    projectedNetFlow: PropTypes.number.isRequired,
  }).isRequired,
  formatCurrency: PropTypes.func.isRequired,
};
