import { Box, Grid, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';

function getExpenseColor(amount) {
  return amount >= 0 ? '#f44336' : '#4caf50';
}

function IncomeMetricsRow({
  incomeAndCredits,
  income,
  credits,
  formatCurrency,
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' color='text.secondary'>
            Income & Credits
          </Typography>
          <Typography
            variant='h6'
            sx={{ color: '#4caf50', fontWeight: 'bold' }}
          >
            {formatCurrency(incomeAndCredits)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' color='text.secondary'>
            Income
          </Typography>
          <Typography
            variant='h6'
            sx={{ color: '#4caf50', fontWeight: 'bold' }}
          >
            {formatCurrency(income)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, textAlign: 'right' }}>
          <Typography variant='caption' color='text.secondary'>
            Credits
          </Typography>
          <Typography
            variant='h6'
            sx={{ color: '#4caf50', fontWeight: 'bold' }}
          >
            {formatCurrency(credits)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ExpenseMetricsRow({
  expenses,
  creditCardPayments,
  creditCardExpenses,
  formatCurrency,
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' color='text.secondary'>
            Expenses
          </Typography>
          <Typography
            variant='h6'
            sx={{ color: getExpenseColor(expenses), fontWeight: 'bold' }}
          >
            {formatCurrency(expenses)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' color='text.secondary'>
            Card Payments
          </Typography>
          <Typography
            variant='h6'
            sx={{
              color: getExpenseColor(creditCardPayments),
              fontWeight: 'bold',
            }}
          >
            {formatCurrency(creditCardPayments)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, textAlign: 'right' }}>
          <Typography variant='caption' color='text.secondary'>
            Card Expenses
          </Typography>
          <Typography
            variant='h6'
            sx={{
              color: getExpenseColor(creditCardExpenses),
              fontWeight: 'bold',
            }}
          >
            {formatCurrency(creditCardExpenses)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function BalanceMetricsRow({ balance, creditCardBalance, formatCurrency }) {
  return (
    <Box
      sx={{
        pt: 1,
        borderTop: '1px solid #90caf9',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' color='text.secondary'>
            Balance
          </Typography>
          <Typography
            variant='h6'
            sx={{
              color: balance >= 0 ? '#4caf50' : '#f44336',
              fontWeight: 'bold',
            }}
          >
            {formatCurrency(balance)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, textAlign: 'right' }}>
          <Typography variant='caption' color='text.secondary'>
            Card Balance
          </Typography>
          <Typography
            variant='h6'
            sx={{
              color: creditCardBalance > 0 ? '#f44336' : '#4caf50',
              fontWeight: 'bold',
            }}
          >
            {formatCurrency(creditCardBalance)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function MonthOverviewSummary({
  dateRanges,
  combinedBalances,
  monthEndProjections,
  currentMonthTotals,
  remainingMonthTotals,
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
      <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 2 }}>
        {format(dateRanges.today, 'MMMM yyyy')} Overview
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
          <Typography variant='body2' color='text.secondary'>
            Day {monthEndProjections.currentDay} of{' '}
            {monthEndProjections.daysInMonth}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
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
      <Grid container spacing={2}>
        {/* Month-to-Date (Actuals) */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <IncomeMetricsRow
              incomeAndCredits={currentMonthTotals.incomeAndCredits}
              income={currentMonthTotals.income}
              credits={currentMonthTotals.credits}
              formatCurrency={formatCurrency}
            />
            <ExpenseMetricsRow
              expenses={currentMonthTotals.expenses}
              creditCardPayments={currentMonthTotals.creditCardPayments}
              creditCardExpenses={currentMonthTotals.creditCardExpenses}
              formatCurrency={formatCurrency}
            />
            <BalanceMetricsRow
              balance={combinedBalances.current}
              creditCardBalance={combinedBalances.creditCardCurrent}
              formatCurrency={formatCurrency}
            />
          </Paper>
        </Grid>

        {/* Remaining Month (Scheduled/Planned) */}
        <Grid size={{ xs: 12, md: 4 }}>
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
            <IncomeMetricsRow
              incomeAndCredits={remainingMonthTotals.incomeAndCredits}
              income={remainingMonthTotals.income}
              credits={remainingMonthTotals.credits}
              formatCurrency={formatCurrency}
            />
            <ExpenseMetricsRow
              expenses={remainingMonthTotals.expenses}
              creditCardPayments={remainingMonthTotals.creditCardPayments}
              creditCardExpenses={remainingMonthTotals.creditCardExpenses}
              formatCurrency={formatCurrency}
            />
            <Box
              sx={{
                pt: 1,
                borderTop: '1px solid #ffcc80',
              }}
            >
              <Typography variant='caption' color='text.secondary'>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
              Total
            </Typography>
            <IncomeMetricsRow
              incomeAndCredits={monthEndProjections.projectedIncomeAndCredits}
              income={monthEndProjections.projectedIncome}
              credits={monthEndProjections.projectedCredits}
              formatCurrency={formatCurrency}
            />
            <Box sx={{ mb: 1 }}>
              <Typography variant='caption' color='text.secondary'>
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
              <Typography variant='caption' color='text.secondary'>
                Balance
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color:
                    combinedBalances.projected >= 0 ? '#4caf50' : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                {formatCurrency(combinedBalances.projected)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
