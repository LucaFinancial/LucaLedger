import { Accordion, AccordionDetails } from '@mui/material';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import MonthOverviewSummary from './MonthOverviewSummary';

import MonthOverviewHeader from './MonthOverviewHeader';
import MonthlyIncomeExpenseCards from './MonthlyIncomeExpenseCards';

export default function CurrentMonthOverviewSection({
  dateRanges,
  totals,
  creditCardTotals,
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
        totals={totals}
        creditCardTotals={creditCardTotals}
        currentMonthTotals={currentMonthTotals}
        monthEndProjections={monthEndProjections}
        formatCurrency={formatCurrency}
      />
      <AccordionDetails>
        <MonthlyIncomeExpenseCards
          currentMonthTotals={currentMonthTotals}
          monthEndProjections={monthEndProjections}
          formatCurrency={formatCurrency}
        />

        <MonthOverviewSummary
          monthEndProjections={monthEndProjections}
          currentMonthTotals={currentMonthTotals}
          remainingMonthTotals={remainingMonthTotals}
          totals={totals}
          formatCurrency={formatCurrency}
        />

        <CategoryBreakdown />
      </AccordionDetails>
    </Accordion>
  );
}

