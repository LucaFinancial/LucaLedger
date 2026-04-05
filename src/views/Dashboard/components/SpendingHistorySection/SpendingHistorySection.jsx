import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import SpendingPeriodControls from '@/components/SpendingPeriodControls';
import SpendingHistoryPieChart from './SpendingHistoryPieChart';
import SpendingHistorySummaryCards from './SpendingHistorySummaryCards';
import SpendingHistoryTable from './SpendingHistoryTable';
import useSpendingHistorySectionData from './useSpendingHistorySectionData';
import useSpendingHistorySectionState from './useSpendingHistorySectionState';

export default function SpendingHistorySection({ includedAccountIds = null }) {
  const {
    activeSelection,
    customRange,
    expandedCategoryId,
    expandedSubcategoryIds,
    hideSubcategories,
    handleAggregateChange,
    handleCustomEndChange,
    handleCustomStartChange,
    handleHideSubcategoriesChange,
    handleMonthChange,
    handleTransactionSortToggle,
    handleYearChange,
    toggleCategoryExpanded,
    toggleSubcategoryExpanded,
    transactionSortDirection,
  } = useSpendingHistorySectionState();

  const {
    accountsById,
    availableYears,
    categoryData,
    monthlyAvgExpenses,
    periodConfig,
    pieData,
    showStateBreakdown,
    stateTotals,
    totalExpenses,
    totalTransactions,
  } = useSpendingHistorySectionData({
    includedAccountIds,
    activeSelection,
  });

  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        mb: 3,
        borderLeft: '4px solid #9c27b0',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: '#f3e5f5',
          '&:hover': { backgroundColor: '#e1bee7' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            Categorized Spending
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 2.5 }}>
        <SpendingPeriodControls
          activeSelection={activeSelection}
          availableYears={availableYears}
          customRange={customRange}
          onAggregateChange={handleAggregateChange}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onCustomStartChange={handleCustomStartChange}
          onCustomEndChange={handleCustomEndChange}
          inlineDateControls
          dateTrailingControls={
            <FormControlLabel
              control={
                <Switch
                  checked={hideSubcategories}
                  onChange={handleHideSubcategoriesChange}
                  size='small'
                />
              }
              label='Hide subcategories'
              sx={{
                ml: 0.5,
                mr: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                },
              }}
            />
          }
          sx={{ mb: 3 }}
        />

        {categoryData.length === 0 ? (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ py: 3, textAlign: 'center' }}
          >
            No spending found for {periodConfig.label}
          </Typography>
        ) : (
          <>
            <SpendingHistorySummaryCards
              showStateBreakdown={showStateBreakdown}
              stateTotals={stateTotals}
              totalExpenses={totalExpenses}
              monthlyAvgExpenses={monthlyAvgExpenses}
              totalTransactions={totalTransactions}
            />

            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: { xs: 'flex-start', lg: 'stretch' },
              }}
            >
              <SpendingHistoryPieChart pieData={pieData} />

              <SpendingHistoryTable
                accountsById={accountsById}
                categoryData={categoryData}
                expandedCategoryId={expandedCategoryId}
                expandedSubcategoryIds={expandedSubcategoryIds}
                hideSubcategories={hideSubcategories}
                onToggleCategoryExpanded={toggleCategoryExpanded}
                onToggleSubcategoryExpanded={toggleSubcategoryExpanded}
                showStateBreakdown={showStateBreakdown}
                transactionSortDirection={transactionSortDirection}
                onTransactionSortToggle={handleTransactionSortToggle}
              />
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
