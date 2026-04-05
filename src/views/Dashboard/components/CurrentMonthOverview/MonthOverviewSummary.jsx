import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
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

function getBalanceColor(amount) {
  return amount >= 0 ? '#4caf50' : '#f44336';
}

function TooltipValue({ tooltip, children }) {
  if (!tooltip) {
    return children;
  }

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ maxWidth: 320 }}>
          <Typography variant='body2'>{tooltip}</Typography>
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
}

function MetricCell({
  label,
  value,
  valueColor,
  formatCurrency,
  textAlign,
  tooltip,
}) {
  return (
    <Box sx={{ minWidth: 0, textAlign }}>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <TooltipValue tooltip={tooltip}>
        <Typography
          variant='h6'
          sx={{ color: valueColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          {formatCurrency(value)}
        </Typography>
      </TooltipValue>
    </Box>
  );
}

function IncomeMetricsRow({
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

function ExpenseMetricsRow({
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

function SummaryMetricsRow({
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

function getComparisonValueColor(rowType, amount) {
  if (rowType === 'cardPayments') {
    return '#4caf50';
  }

  if (
    rowType === 'outflow' ||
    rowType === 'cardCharges' ||
    rowType === 'cardBalance'
  ) {
    return getExpenseColor(amount);
  }

  return getBalanceColor(amount);
}

function getRemainingTotalCellConfig(row, sectionTitle) {
  const remainingValue = row.remaining ?? 0;
  const positiveIsGood = row.type === 'inflow' || row.type === 'balance';
  const upIcon = <ArrowDropUpIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />;
  const downIcon = (
    <ArrowDropDownIcon sx={{ fontSize: '1.9rem', mr: 0.25 }} />
  );

  if (sectionTitle === 'Income') {
    return {
      value: Math.abs(remainingValue),
      type: remainingValue >= 0 ? 'balance' : 'outflow',
      icon: null,
    };
  }

  if (sectionTitle === 'Expenses') {
    return {
      value: Math.abs(remainingValue),
      type: remainingValue >= 0 ? 'outflow' : 'balance',
      icon: null,
    };
  }

  if (remainingValue > 0) {
    return {
      value: Math.abs(remainingValue),
      type: positiveIsGood ? 'balance' : 'outflow',
      icon: upIcon,
    };
  }

  if (remainingValue < 0) {
    return {
      value: Math.abs(remainingValue),
      type: positiveIsGood ? 'outflow' : 'balance',
      icon: downIcon,
    };
  }

  return {
    value: remainingValue,
    type: row.type,
    icon: null,
  };
}

function getSectionHeaderStyles(sectionTitle) {
  switch (sectionTitle) {
    case 'Income':
      return {
        backgroundColor: '#e8f5e9',
        borderColor: '#a5d6a7',
        color: '#2e7d32',
      };
    case 'Expenses':
      return {
        backgroundColor: '#ffebee',
        borderColor: '#ef9a9a',
        color: '#c62828',
      };
    case 'Credit Cards':
      return {
        backgroundColor: '#e3f2fd',
        borderColor: '#90caf9',
        color: '#1565c0',
      };
    case 'Income vs Expenses':
      return {
        backgroundColor: '#f3e5f5',
        borderColor: '#ce93d8',
        color: '#7b1fa2',
      };
    default:
      return {
        backgroundColor: '#f8fafc',
        borderColor: '#e0e0e0',
        color: 'text.primary',
      };
  }
}

function DetailedComparisonTable({ sections, formatCurrency }) {
  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      {sections.map((section) => {
        const headerStyles = getSectionHeaderStyles(section.title);

        return (
          <Grid
            key={section.title}
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex' }}
          >
            <Paper
              sx={{
                width: '100%',
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  backgroundColor: headerStyles.backgroundColor,
                  borderBottom: `1px solid ${headerStyles.borderColor}`,
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 700, color: headerStyles.color }}
                >
                  {section.title}
                </Typography>
              </Box>

              <TableContainer sx={{ flex: 1 }}>
                <Table size='small' sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '34%' }} />
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#2196f3' }}
                      >
                        Current
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#9c27b0' }}
                      >
                        Remaining
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 700, color: '#2e7d32' }}
                      >
                        Month End Totals
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.rows.map((row) => {
                      const remainingDisplay =
                        row.emphasis === 'total'
                          ? getRemainingTotalCellConfig(row, section.title)
                          : {
                              value: row.remaining,
                              type: row.type,
                              icon: null,
                            };

                      return (
                        <TableRow
                          key={`${section.title}-${row.label}`}
                          sx={
                            row.emphasis
                              ? {
                                  backgroundColor:
                                    row.emphasis === 'total'
                                      ? '#fafafa'
                                      : 'rgba(33, 150, 243, 0.04)',
                                }
                              : undefined
                          }
                        >
                          <TableCell
                            component='th'
                            scope='row'
                            sx={{
                              pl: row.emphasis ? 2 : 3,
                            }}
                          >
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: row.emphasis ? 700 : 600 }}
                            >
                              {row.label}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    row.type,
                                    row.current,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCurrency(row.current)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                          <TableCell align='right'>
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    remainingDisplay.type,
                                    remainingDisplay.value,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                }}
                              >
                                {remainingDisplay.icon}
                                {formatCurrency(remainingDisplay.value)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                          <TableCell align='right'>
                            <TooltipValue tooltip={row.tooltip}>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: getComparisonValueColor(
                                    row.type,
                                    row.projected,
                                  ),
                                  fontWeight: row.emphasis ? 700 : 600,
                                  fontSize:
                                    row.emphasis === 'total'
                                      ? '1rem'
                                      : undefined,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCurrency(row.projected)}
                              </Typography>
                            </TooltipValue>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
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
  const cardMetricTooltips = {
    incomeAndCredits:
      'Income and credits to included asset accounts, such as checking, savings, and cash. This does not include credit card rewards, refunds, statement credits, or card payments.',
    income:
      'Transactions in income categories on included asset accounts.',
    cardCreditsAndPayments:
      'Combined total of credit card payments plus credit card rewards, refunds, and statement credits. These reduce the combined credit card balance.',
    cashOutflows:
      'Negative activity from included asset accounts, including card payments and other debits.',
    expenses:
      'Actual spending only: cash-account expenses plus credit card charges. This excludes credit card payments.',
    cardCharges:
      'Positive transactions on included credit card accounts, such as purchases and fees. This excludes payments, refunds, rewards, and statement credits.',
    currentBalance:
      'Combined total of included asset account balances. This excludes credit card accounts.',
    balanceChange:
      'Projected remaining change in the combined balance of included asset accounts based on remaining month activity.',
    endingBalance:
      'Projected end-of-month combined balance of included asset accounts. Calculated as current balance plus remaining balance change.',
    cardBalance:
      'Current combined balance of included credit card accounts.',
    cardBalanceChange:
      'Projected remaining change in the combined credit card balance, based on remaining card charges, credits, and payments.',
    endingCardBalance:
      'Projected end-of-month combined credit card balance. Calculated as current card balance plus remaining card balance change.',
  };
  const currentDisplayMetrics = {
    deposits:
      (currentMonthTotals.income || 0) + (currentMonthTotals.cashCredits || 0),
    incomeAndCredits:
      (currentMonthTotals.income || 0) + (currentMonthTotals.cashCredits || 0),
    income: currentMonthTotals.income || 0,
    cardCreditsAndPayments:
      (currentMonthTotals.creditCardCredits || 0) +
      (currentMonthTotals.creditCardPayments || 0),
    cashOutflows: currentMonthTotals.cashOutflows || 0,
    expenses: currentMonthTotals.expenses || 0,
    cardCharges: currentMonthTotals.creditCardExpenses || 0,
  };
  const remainingDisplayMetrics = {
    deposits:
      (remainingMonthTotals.income || 0) + (remainingMonthTotals.cashCredits || 0),
    incomeAndCredits:
      (remainingMonthTotals.income || 0) + (remainingMonthTotals.cashCredits || 0),
    income: remainingMonthTotals.income || 0,
    cardCreditsAndPayments:
      (remainingMonthTotals.creditCardCredits || 0) +
      (remainingMonthTotals.creditCardPayments || 0),
    cashOutflows: remainingMonthTotals.cashOutflows || 0,
    expenses: remainingMonthTotals.expenses || 0,
    cardCharges: remainingMonthTotals.creditCardExpenses || 0,
  };
  const projectedDisplayMetrics = {
    deposits:
      (monthEndProjections.projectedIncome || 0) +
      (monthEndProjections.projectedCashCredits || 0),
    incomeAndCredits:
      (monthEndProjections.projectedIncome || 0) +
      (monthEndProjections.projectedCashCredits || 0),
    income: monthEndProjections.projectedIncome || 0,
    cardCreditsAndPayments:
      (monthEndProjections.projectedCreditCardCredits || 0) +
      (monthEndProjections.projectedCreditCardPayments || 0),
    cashOutflows: monthEndProjections.projectedCashOutflows || 0,
    expenses: monthEndProjections.projectedExpenses || 0,
    cardCharges: monthEndProjections.projectedCreditCardExpenses || 0,
  };
  const assetCreditsMetrics = {
    current: currentMonthTotals.cashCredits || 0,
    remaining: remainingMonthTotals.cashCredits || 0,
    projected: monthEndProjections.projectedCashCredits || 0,
  };
  const assetExpensesMetrics = {
    current:
      (currentMonthTotals.expenses || 0) -
      (currentMonthTotals.creditCardExpenses || 0),
    remaining:
      (remainingMonthTotals.expenses || 0) -
      (remainingMonthTotals.creditCardExpenses || 0),
    projected:
      (monthEndProjections.projectedExpenses || 0) -
      (monthEndProjections.projectedCreditCardExpenses || 0),
  };
  const detailedComparisonSections = [
    {
      title: 'Income',
      rows: [
        {
          label: 'Income',
          type: 'inflow',
          current: currentMonthTotals.income || 0,
          remaining: remainingMonthTotals.income || 0,
          projected: monthEndProjections.projectedIncome || 0,
          tooltip:
            'Transactions in income categories on included asset accounts.',
        },
        {
          label: 'Checking/Savings Credits',
          type: 'inflow',
          current: assetCreditsMetrics.current,
          remaining: assetCreditsMetrics.remaining,
          projected: assetCreditsMetrics.projected,
          tooltip:
            'Credits to included checking and savings accounts that are not categorized as income, such as reimbursements and refunds.',
        },
        {
          label: 'Credit Card Credits / Rewards',
          type: 'inflow',
          current: currentMonthTotals.creditCardCredits || 0,
          remaining: remainingMonthTotals.creditCardCredits || 0,
          projected: monthEndProjections.projectedCreditCardCredits || 0,
          tooltip:
            'Credits on credit card accounts, such as rewards, refunds, and statement credits.',
        },
        {
          label: 'Total Income & Credits',
          type: 'inflow',
          current: currentMonthTotals.incomeAndCredits || 0,
          remaining: remainingMonthTotals.incomeAndCredits || 0,
          projected: monthEndProjections.projectedIncomeAndCredits || 0,
          emphasis: 'total',
          tooltip:
            'Overall income and credits across included accounts. This includes asset-account income, asset-account credits, and credit card rewards, refunds, and statement credits.',
        },
      ],
    },
    {
      title: 'Credit Cards',
      rows: [
        {
          label: 'Credit Card Payments',
          type: 'cardPayments',
          current: currentMonthTotals.creditCardPayments || 0,
          remaining: remainingMonthTotals.creditCardPayments || 0,
          projected: monthEndProjections.projectedCreditCardPayments || 0,
          tooltip:
            'Payments from included asset accounts to credit card accounts.',
        },
        {
          label: 'Credit Card Credits / Rewards',
          type: 'inflow',
          current: currentMonthTotals.creditCardCredits || 0,
          remaining: remainingMonthTotals.creditCardCredits || 0,
          projected: monthEndProjections.projectedCreditCardCredits || 0,
          tooltip:
            'Credits on credit card accounts, such as rewards, refunds, and statement credits.',
        },
        {
          label: 'Credit Card Charges',
          type: 'cardCharges',
          current: currentMonthTotals.creditCardExpenses || 0,
          remaining: remainingMonthTotals.creditCardExpenses || 0,
          projected: monthEndProjections.projectedCreditCardExpenses || 0,
          tooltip:
            'Positive transactions on included credit card accounts, such as purchases and fees.',
        },
        {
          label: 'Credit Card Balance',
          type: 'cardBalance',
          current: combinedBalances.creditCardCurrent,
          remaining: remainingMonthTotals.creditCardBalanceChange || 0,
          projected: combinedBalances.creditCardProjected,
          emphasis: 'total',
          tooltip:
            'Combined balance of included credit card accounts. The remaining column shows projected card balance change; the totals column shows projected ending card balance.',
        },
      ],
    },
    {
      title: 'Expenses',
      rows: [
        {
          label: 'Checking/Savings Expenses',
          type: 'outflow',
          current: assetExpensesMetrics.current,
          remaining: assetExpensesMetrics.remaining,
          projected: assetExpensesMetrics.projected,
          tooltip:
            'Expenses paid directly from included checking and savings accounts. This excludes card payments and excludes spending charged to credit cards.',
        },
        {
          label: 'Credit Card Charges',
          type: 'cardCharges',
          current: currentMonthTotals.creditCardExpenses || 0,
          remaining: remainingMonthTotals.creditCardExpenses || 0,
          projected: monthEndProjections.projectedCreditCardExpenses || 0,
          tooltip:
            'Positive transactions on included credit card accounts, such as purchases and fees.',
        },
        {
          label: 'Total Expenses',
          type: 'outflow',
          current: currentMonthTotals.expenses || 0,
          remaining: remainingMonthTotals.expenses || 0,
          projected: monthEndProjections.projectedExpenses || 0,
          emphasis: 'total',
          tooltip:
            'Actual spending only: asset-account expenses plus credit card charges. This excludes credit card payments.',
        },
      ],
    },
    {
      title: 'Income vs Expenses',
      rows: [
        {
          label: 'Income & Credits',
          type: 'inflow',
          current: currentMonthTotals.incomeAndCredits || 0,
          remaining: remainingMonthTotals.incomeAndCredits || 0,
          projected: monthEndProjections.projectedIncomeAndCredits || 0,
          tooltip:
            'Overall income and credits across included accounts. This includes asset-account income, asset-account credits, and credit card rewards, refunds, and statement credits.',
        },
        {
          label: 'Total Expenses',
          type: 'outflow',
          current: currentMonthTotals.expenses || 0,
          remaining: remainingMonthTotals.expenses || 0,
          projected: monthEndProjections.projectedExpenses || 0,
          tooltip:
            'Actual spending only: asset-account expenses plus credit card charges. This excludes credit card payments.',
        },
        {
          label: 'Net Income - Expenses',
          type: 'balance',
          current: currentMonthTotals.netFlow || 0,
          remaining: remainingMonthTotals.netFlow || 0,
          projected: monthEndProjections.projectedNetFlow || 0,
          emphasis: 'total',
          tooltip:
            'Income and credits minus actual spending. This excludes credit card payments, so it reflects change in net worth rather than cash movement.',
        },
      ],
    },
  ];

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
              incomeAndCredits={currentDisplayMetrics.incomeAndCredits}
              income={currentDisplayMetrics.income}
              cardCreditsAndPayments={currentDisplayMetrics.cardCreditsAndPayments}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <ExpenseMetricsRow
              cashOutflows={currentDisplayMetrics.cashOutflows}
              expenses={currentDisplayMetrics.expenses}
              cardCharges={currentDisplayMetrics.cardCharges}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <SummaryMetricsRow
              leftMetric={{
                label: 'Current Balance',
                value: combinedBalances.current,
                valueColor: getBalanceColor(combinedBalances.current),
                tooltip: cardMetricTooltips.currentBalance,
              }}
              rightMetric={{
                label: 'Card Balance',
                value: combinedBalances.creditCardCurrent,
                valueColor:
                  combinedBalances.creditCardCurrent > 0 ? '#f44336' : '#4caf50',
                tooltip: cardMetricTooltips.cardBalance,
              }}
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
              backgroundColor: '#f3e5f5',
              border: '1px solid #9c27b0',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1, color: '#9c27b0' }}
            >
              Remaining
            </Typography>
            <IncomeMetricsRow
              incomeAndCredits={remainingDisplayMetrics.incomeAndCredits}
              income={remainingDisplayMetrics.income}
              cardCreditsAndPayments={remainingDisplayMetrics.cardCreditsAndPayments}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <ExpenseMetricsRow
              cashOutflows={remainingDisplayMetrics.cashOutflows}
              expenses={remainingDisplayMetrics.expenses}
              cardCharges={remainingDisplayMetrics.cardCharges}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <SummaryMetricsRow
              leftMetric={{
                label: 'Balance Change',
                value: remainingMonthTotals.balance,
                valueColor: getBalanceColor(remainingMonthTotals.balance),
                tooltip: cardMetricTooltips.balanceChange,
              }}
              rightMetric={{
                label: 'Card Balance Change',
                value: remainingMonthTotals.creditCardBalanceChange,
                valueColor:
                  remainingMonthTotals.creditCardBalanceChange > 0
                    ? '#f44336'
                    : '#4caf50',
                tooltip: cardMetricTooltips.cardBalanceChange,
              }}
              borderColor='#ce93d8'
              formatCurrency={formatCurrency}
            />
          </Paper>
        </Grid>

        {/* Month-End Projection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}
            >
              End of Month Totals
            </Typography>
            <IncomeMetricsRow
              incomeAndCredits={projectedDisplayMetrics.incomeAndCredits}
              income={projectedDisplayMetrics.income}
              cardCreditsAndPayments={projectedDisplayMetrics.cardCreditsAndPayments}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <ExpenseMetricsRow
              cashOutflows={projectedDisplayMetrics.cashOutflows}
              expenses={projectedDisplayMetrics.expenses}
              cardCharges={projectedDisplayMetrics.cardCharges}
              formatCurrency={formatCurrency}
              tooltips={cardMetricTooltips}
            />
            <SummaryMetricsRow
              leftMetric={{
                label: 'Ending Balance',
                value: combinedBalances.projected,
                valueColor: getBalanceColor(combinedBalances.projected),
                tooltip: cardMetricTooltips.endingBalance,
              }}
              rightMetric={{
                label: 'Ending Card Balance',
                value: combinedBalances.creditCardProjected,
                valueColor:
                  combinedBalances.creditCardProjected > 0
                    ? '#f44336'
                    : '#4caf50',
                tooltip: cardMetricTooltips.endingCardBalance,
              }}
              borderColor='#81c784'
              formatCurrency={formatCurrency}
            />
          </Paper>
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
