import { Paper, Typography } from '@mui/material';
import {
  ExpenseMetricsRow,
  IncomeMetricsRow,
  SummaryMetricsRow,
} from './MonthOverviewMetricRows';

export default function OverviewPeriodCard({
  title,
  titleColor,
  backgroundColor,
  cardBorderColor,
  summaryBorderColor,
  metrics,
  leftMetric,
  rightMetric,
  formatCurrency,
  tooltips,
}) {
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor,
        border: `1px solid ${cardBorderColor}`,
      }}
    >
      <Typography
        variant='subtitle2'
        sx={{ fontWeight: 'bold', mb: 1, color: titleColor }}
      >
        {title}
      </Typography>
      <IncomeMetricsRow
        incomeAndCredits={metrics.incomeAndCredits}
        income={metrics.income}
        cardCreditsAndPayments={metrics.cardCreditsAndPayments}
        formatCurrency={formatCurrency}
        tooltips={tooltips}
      />
      <ExpenseMetricsRow
        cashOutflows={metrics.cashOutflows}
        expenses={metrics.expenses}
        cardCharges={metrics.cardCharges}
        formatCurrency={formatCurrency}
        tooltips={tooltips}
      />
      <SummaryMetricsRow
        leftMetric={leftMetric}
        rightMetric={rightMetric}
        borderColor={summaryBorderColor}
        formatCurrency={formatCurrency}
      />
    </Paper>
  );
}
