import { Box, Paper, Typography } from '@mui/material';

import {
  SPENDING_STATE_META,
  SPENDING_STATE_ORDER,
} from '@/utils/spendingAnalytics';

import { formatCurrencyFromCents } from './spendingHistoryHelpers';
import {
  LEDGER_STATE_META,
  MONTHLY_AVG_META,
  TOTAL_META,
} from './spendingHistoryConstants';

function SummaryCard({
  backgroundColor,
  borderColor,
  minWidth = 140,
  title,
  titleColor,
  value,
  subtitle,
}) {
  return (
    <Paper
      sx={{
        flex: 1,
        minWidth,
        p: 2,
        backgroundColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Typography
        sx={{
          color: titleColor,
          fontSize: '0.9rem',
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant='h5'
        sx={{
          color: titleColor,
          fontWeight: 'bold',
        }}
      >
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant='body2' color='text.secondary'>
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

export default function SpendingHistorySummaryCards({
  showStateBreakdown,
  stateTotals,
  totalExpenses,
  monthlyAvgExpenses,
  totalTransactions,
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {showStateBreakdown ? (
        <>
          {SPENDING_STATE_ORDER.map((stateKey) => (
            <SummaryCard
              key={stateKey}
              backgroundColor={LEDGER_STATE_META[stateKey].backgroundColor}
              borderColor={LEDGER_STATE_META[stateKey].borderColor}
              title={SPENDING_STATE_META[stateKey].label}
              titleColor={LEDGER_STATE_META[stateKey].color}
              value={formatCurrencyFromCents(stateTotals[stateKey])}
            />
          ))}
          <SummaryCard
            backgroundColor={TOTAL_META.backgroundColor}
            borderColor={TOTAL_META.borderColor}
            title='Total'
            titleColor={TOTAL_META.color}
            value={formatCurrencyFromCents(totalExpenses)}
          />
          <SummaryCard
            backgroundColor={MONTHLY_AVG_META.backgroundColor}
            borderColor={MONTHLY_AVG_META.borderColor}
            title='Monthly Avg'
            titleColor={MONTHLY_AVG_META.color}
            value={formatCurrencyFromCents(monthlyAvgExpenses)}
          />
        </>
      ) : (
        <>
          <SummaryCard
            backgroundColor={TOTAL_META.backgroundColor}
            borderColor={TOTAL_META.borderColor}
            minWidth={180}
            title='Total Spent'
            titleColor={TOTAL_META.color}
            value={formatCurrencyFromCents(totalExpenses)}
            subtitle={`${totalTransactions} transactions`}
          />
          <SummaryCard
            backgroundColor={MONTHLY_AVG_META.backgroundColor}
            borderColor={MONTHLY_AVG_META.borderColor}
            minWidth={180}
            title='Monthly Avg'
            titleColor={MONTHLY_AVG_META.color}
            value={formatCurrencyFromCents(monthlyAvgExpenses)}
          />
        </>
      )}
    </Box>
  );
}
