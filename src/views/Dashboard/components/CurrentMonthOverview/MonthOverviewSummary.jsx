import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';
import DetailedComparisonTable from './DetailedComparisonTable';
import OverviewPeriodCard from './OverviewPeriodCard';
import {
  buildDetailedComparisonSections,
  buildDisplayMetrics,
  CARD_METRIC_TOOLTIPS,
  getBalanceColor,
  getCreditCardBalanceColor,
} from './monthOverviewSummaryUtils';

export default function MonthOverviewSummary({
  dateRanges,
  combinedBalances,
  monthEndProjections,
  currentMonthTotals,
  remainingMonthTotals,
  formatCurrency,
}) {
  const currentDisplayMetrics = buildDisplayMetrics(currentMonthTotals);
  const remainingDisplayMetrics = buildDisplayMetrics(remainingMonthTotals);
  const projectedDisplayMetrics = buildDisplayMetrics({
    income: monthEndProjections.projectedIncome,
    cashCredits: monthEndProjections.projectedCashCredits,
    creditCardCredits: monthEndProjections.projectedCreditCardCredits,
    creditCardPayments: monthEndProjections.projectedCreditCardPayments,
    cashOutflows: monthEndProjections.projectedCashOutflows,
    expenses: monthEndProjections.projectedExpenses,
    creditCardExpenses: monthEndProjections.projectedCreditCardExpenses,
  });
  const detailedComparisonSections = buildDetailedComparisonSections({
    combinedBalances,
    currentMonthTotals,
    monthEndProjections,
    remainingMonthTotals,
  });
  const upIcon = <ArrowDropUpIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />;
  const downIcon = (
    <ArrowDropDownIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />
  );
  const getDirectionalIcon = (amount) => {
    if (!amount) return null;

    return amount > 0 ? upIcon : downIcon;
  };

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
          <OverviewPeriodCard
            title='Current'
            titleColor='#2196f3'
            backgroundColor='#e3f2fd'
            cardBorderColor='#2196f3'
            summaryBorderColor='#90caf9'
            metrics={currentDisplayMetrics}
            leftMetric={{
              label: 'Current Balance',
              value: combinedBalances.current,
              valueColor: getBalanceColor(combinedBalances.current),
              tooltip: CARD_METRIC_TOOLTIPS.currentBalance,
            }}
            rightMetric={{
              label: 'Card Balance',
              value: combinedBalances.creditCardCurrent,
              valueColor: getCreditCardBalanceColor(
                combinedBalances.creditCardCurrent,
              ),
              tooltip: CARD_METRIC_TOOLTIPS.cardBalance,
            }}
            formatCurrency={formatCurrency}
            tooltips={CARD_METRIC_TOOLTIPS}
          />
        </Grid>

        {/* Remaining Month (Scheduled/Planned) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <OverviewPeriodCard
            title='Remaining'
            titleColor='#9c27b0'
            backgroundColor='#f3e5f5'
            cardBorderColor='#9c27b0'
            summaryBorderColor='#ce93d8'
            metrics={remainingDisplayMetrics}
            leftMetric={{
              label: 'Balance Change',
              value: remainingMonthTotals.balance,
              valueColor: getBalanceColor(remainingMonthTotals.balance),
              tooltip: CARD_METRIC_TOOLTIPS.balanceChange,
              icon: getDirectionalIcon(remainingMonthTotals.balance),
              useAbsoluteValue: true,
            }}
            rightMetric={{
              label: 'Card Balance Change',
              value: remainingMonthTotals.creditCardBalanceChange,
              valueColor: getCreditCardBalanceColor(
                remainingMonthTotals.creditCardBalanceChange,
              ),
              tooltip: CARD_METRIC_TOOLTIPS.cardBalanceChange,
              icon: getDirectionalIcon(
                remainingMonthTotals.creditCardBalanceChange,
              ),
              useAbsoluteValue: true,
            }}
            formatCurrency={formatCurrency}
            tooltips={CARD_METRIC_TOOLTIPS}
          />
        </Grid>

        {/* Month-End Projection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <OverviewPeriodCard
            title='End of Month Totals'
            titleColor='#2e7d32'
            backgroundColor='#e8f5e9'
            cardBorderColor='#4caf50'
            summaryBorderColor='#81c784'
            metrics={projectedDisplayMetrics}
            leftMetric={{
              label: 'Ending Balance',
              value: combinedBalances.projected,
              valueColor: getBalanceColor(combinedBalances.projected),
              tooltip: CARD_METRIC_TOOLTIPS.endingBalance,
            }}
            rightMetric={{
              label: 'Ending Card Balance',
              value: combinedBalances.creditCardProjected,
              valueColor: getCreditCardBalanceColor(
                combinedBalances.creditCardProjected,
              ),
              tooltip: CARD_METRIC_TOOLTIPS.endingCardBalance,
            }}
            formatCurrency={formatCurrency}
            tooltips={CARD_METRIC_TOOLTIPS}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <DetailedComparisonTable
          sections={detailedComparisonSections}
          formatCurrency={formatCurrency}
        />
      </Box>
    </Paper>
  );
}
