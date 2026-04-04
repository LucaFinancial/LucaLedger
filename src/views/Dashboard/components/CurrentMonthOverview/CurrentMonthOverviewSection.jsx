import { Accordion, AccordionDetails } from '@mui/material';
import MonthOverviewSummary from './MonthOverviewSummary';

import MonthOverviewHeader from './MonthOverviewHeader';

export default function CurrentMonthOverviewSection({
  dateRanges,
  combinedBalances,
  currentMonthTotals,
  monthEndProjections,
  remainingMonthTotals,
  formatCurrency,
}) {
  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        mb: 3,
        borderLeft: '4px solid #2196f3',
        '&:before': { display: 'none' },
      }}
    >
      <MonthOverviewHeader
        dateRanges={dateRanges}
      />
      <AccordionDetails>
        <MonthOverviewSummary
          dateRanges={dateRanges}
          combinedBalances={combinedBalances}
          monthEndProjections={monthEndProjections}
          currentMonthTotals={currentMonthTotals}
          remainingMonthTotals={remainingMonthTotals}
          formatCurrency={formatCurrency}
        />
      </AccordionDetails>
    </Accordion>
  );
}
