import { Box } from '@mui/material';
import MetricCell from './MetricCell';
import {
  getExpenseColor,
  THREE_METRIC_ROW_SX,
} from './monthOverviewSummaryUtils';

export function IncomeMetricsRow({
  incomeAndCredits,
  income,
  cardCreditsAndPayments,
  formatCurrency,
  tooltips,
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
          tooltip={tooltips.incomeAndCredits}
        />
        <MetricCell
          label='Income'
          value={income}
          valueColor='#4caf50'
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'center' }}
          tooltip={tooltips.income}
        />
        <MetricCell
          label='Card Credits & Payments'
          value={cardCreditsAndPayments}
          valueColor='#4caf50'
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
          tooltip={tooltips.cardCreditsAndPayments}
        />
      </Box>
    </Box>
  );
}

export function ExpenseMetricsRow({
  cashOutflows,
  expenses,
  cardCharges,
  formatCurrency,
  tooltips,
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={THREE_METRIC_ROW_SX}>
        <MetricCell
          label='Payments & Debits'
          value={cashOutflows}
          valueColor={getExpenseColor(cashOutflows)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'left' }}
          tooltip={tooltips.cashOutflows}
        />
        <MetricCell
          label='All Expenses'
          value={expenses}
          valueColor={getExpenseColor(expenses)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'center' }}
          tooltip={tooltips.expenses}
        />
        <MetricCell
          label='Card Charges'
          value={cardCharges}
          valueColor={getExpenseColor(cardCharges)}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
          tooltip={tooltips.cardCharges}
        />
      </Box>
    </Box>
  );
}

export function SummaryMetricsRow({
  leftMetric,
  middleMetric,
  rightMetric,
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
          label={leftMetric.label}
          value={leftMetric.value}
          valueColor={leftMetric.valueColor}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'left' }}
          tooltip={leftMetric.tooltip}
        />
        {middleMetric ? (
          <MetricCell
            label={middleMetric.label}
            value={middleMetric.value}
            valueColor={middleMetric.valueColor}
            formatCurrency={formatCurrency}
            textAlign={{ xs: 'left', sm: 'center' }}
            tooltip={middleMetric.tooltip}
          />
        ) : (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
        )}
        <MetricCell
          label={rightMetric.label}
          value={rightMetric.value}
          valueColor={rightMetric.valueColor}
          formatCurrency={formatCurrency}
          textAlign={{ xs: 'left', sm: 'right' }}
          tooltip={rightMetric.tooltip}
        />
      </Box>
    </Box>
  );
}
