import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

export default function MonthOverviewSummary({
  monthEndProjections,
  currentMonthTotals,
  remainingMonthTotals,
  totals,
  formatCurrency,
}) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant='h6'
        sx={{ fontWeight: 'bold', mb: 2 }}
      >
        Month Overview
      </Typography>

      {/* Progress bar */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
          >
            Day {monthEndProjections.currentDay} of{' '}
            {monthEndProjections.daysInMonth}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {monthEndProjections.daysRemaining} days remaining
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 8,
            backgroundColor: '#e0e0e0',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${monthEndProjections.monthProgress}%`,
              height: '100%',
              backgroundColor: '#2196f3',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* Three-column summary */}
      <Grid
        container
        spacing={2}
      >
        {/* Month-to-Date (Actuals) */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1, color: '#2196f3' }}
            >
              Current
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Income
              </Typography>
              <Typography
                variant='h6'
                sx={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                {formatCurrency(currentMonthTotals.income)}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Expenses {totals.pending - totals.current < 0 && '(Pending)'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  variant='h6'
                  sx={{ color: '#f44336', fontWeight: 'bold' }}
                >
                  {formatCurrency(currentMonthTotals.expenses)}
                </Typography>
                {totals.pending - totals.current < 0 && (
                  <Typography
                    variant='body1'
                    sx={{ color: '#ff9800', fontWeight: 'bold' }}
                  >
                    ({formatCurrency(Math.abs(totals.pending - totals.current))})
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                pt: 1,
                borderTop: '1px solid #90caf9',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Balance {totals.pending !== totals.current && '(Pending)'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  variant='h6'
                  sx={{ color: '#2196f3', fontWeight: 'bold' }}
                >
                  {formatCurrency(totals.current)}
                </Typography>
                {totals.pending !== totals.current && (
                  <Typography
                    variant='body1'
                    sx={{ color: '#2196f3', fontWeight: 'bold' }}
                  >
                    ({formatCurrency(totals.pending)})
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Remaining Month (Scheduled/Planned) */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#fff3e0',
              border: '1px solid #ff9800',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1, color: '#ff9800' }}
            >
              Remaining
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Income
              </Typography>
              <Typography
                variant='h6'
                sx={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                {formatCurrency(remainingMonthTotals.income)}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Expenses
              </Typography>
              <Typography
                variant='h6'
                sx={{ color: '#f44336', fontWeight: 'bold' }}
              >
                {formatCurrency(remainingMonthTotals.expenses)}
              </Typography>
            </Box>
            <Box
              sx={{
                pt: 1,
                borderTop: '1px solid #ffcc80',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Net
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color:
                    remainingMonthTotals.netFlow >= 0 ? '#4caf50' : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                {formatCurrency(remainingMonthTotals.netFlow)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Month-End Projection */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#f3e5f5',
              border: '1px solid #9c27b0',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1, color: '#9c27b0' }}
            >
              Projected
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Income
              </Typography>
              <Typography
                variant='h6'
                sx={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                {formatCurrency(monthEndProjections.projectedIncome)}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Expenses
              </Typography>
              <Typography
                variant='h6'
                sx={{ color: '#f44336', fontWeight: 'bold' }}
              >
                {formatCurrency(monthEndProjections.projectedExpenses)}
              </Typography>
            </Box>
            <Box
              sx={{
                pt: 1,
                borderTop: '1px solid #ce93d8',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Projected Balance
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color:
                    monthEndProjections.projectedNetFlow >= 0
                      ? '#4caf50'
                      : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                {formatCurrency(totals.future)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
