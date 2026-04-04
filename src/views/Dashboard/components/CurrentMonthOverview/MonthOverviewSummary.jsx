import { Box, Grid, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';

const THREE_METRIC_ROW_SX = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(3, minmax(0, 1fr))',
  },
  gap: 2,
  alignItems: 'start',
};

function getExpenseColor(amount) {
  return amount >= 0 ? '#f44336' : '#4caf50';
}

function MetricCell({ label, value, valueColor, formatCurrency, textAlign }) {
  return (
    <Box sx={{ minWidth: 0, textAlign }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='h6' sx={{ color: valueColor, fontWeight: 'bold' }}>
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
}

function IncomeMetricsRow({
  incomeAndCredits,
  income,
  credits,
  formatCurrency,
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={THREE_METRIC_ROW_SX}>
        <MetricCell
          label='Income & Credits'
          value={incomeAndCredits}
          valueColor='#4caf50'
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'left' }}
        />
        <MetricCell
          label='Income'
          value={income}
          valueColor='#4caf50'
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'center' }}
        />
        <MetricCell
          label='Credits'
          value={credits}
          valueColor='#4caf50'
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
        />
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
      <Box sx={THREE_METRIC_ROW_SX}>
        <MetricCell
          label='Expenses'
          value={expenses}
          valueColor={getExpenseColor(expenses)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'left' }}
        />
        <MetricCell
          label='Card Payments'
          value={creditCardPayments}
          valueColor={getExpenseColor(creditCardPayments)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'center' }}
        />
        <MetricCell
          label='Card Expenses'
          value={creditCardExpenses}
          valueColor={getExpenseColor(creditCardExpenses)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
        />
      </Box>
    </Box>
  );
}

function SummaryMetricsRow({
  net,
  balance,
  creditCardBalance,
  borderColor,
  formatCurrency,
}) {
  return (
    <Box
      sx={{
        pt: 1,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      <Box sx={THREE_METRIC_ROW_SX}>
        <MetricCell
          label='Net'
          value={net}
          valueColor={net >= 0 ? '#4caf50' : '#f44336'}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'left' }}
        />
        <MetricCell
          label='Balance'
          value={balance}
          valueColor={balance >= 0 ? '#4caf50' : '#f44336'}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'center' }}
        />
        <MetricCell
          label='Card Balance'
          value={creditCardBalance}
          valueColor={creditCardBalance > 0 ? '#f44336' : '#4caf50'}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
        />
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
            <SummaryMetricsRow
              net={currentMonthTotals.netFlow}
              balance={combinedBalances.current}
              creditCardBalance={combinedBalances.creditCardCurrent}
              borderColor='#90caf9'
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
            <SummaryMetricsRow
              net={remainingMonthTotals.netFlow}
              balance={combinedBalances.projected}
              creditCardBalance={combinedBalances.creditCardProjected}
              borderColor='#ffcc80'
              formatCurrency={formatCurrency}
            />
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
              End of Month Totals
            </Typography>
            <IncomeMetricsRow
              incomeAndCredits={monthEndProjections.projectedIncomeAndCredits}
              income={monthEndProjections.projectedIncome}
              credits={monthEndProjections.projectedCredits}
              formatCurrency={formatCurrency}
            />
            <ExpenseMetricsRow
              expenses={monthEndProjections.projectedExpenses}
              creditCardPayments={monthEndProjections.projectedCreditCardPayments}
              creditCardExpenses={monthEndProjections.projectedCreditCardExpenses}
              formatCurrency={formatCurrency}
            />
            <SummaryMetricsRow
              net={monthEndProjections.projectedNetFlow}
              balance={combinedBalances.projected}
              creditCardBalance={combinedBalances.creditCardProjected}
              borderColor='#ce93d8'
              formatCurrency={formatCurrency}
            />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
