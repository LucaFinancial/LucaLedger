export const THREE_METRIC_ROW_SX = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(3, minmax(0, 1fr))',
  },
  gap: 2,
  alignItems: 'start',
};

export const CARD_METRIC_TOOLTIPS = {
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

export function getExpenseColor(amount) {
  return amount >= 0 ? '#f44336' : '#4caf50';
}

export function getBalanceColor(amount) {
  return amount >= 0 ? '#4caf50' : '#f44336';
}

export function getCreditCardBalanceColor(amount) {
  return amount > 0 ? '#f44336' : '#4caf50';
}

export function buildDisplayMetrics(totals) {
  return {
    incomeAndCredits: (totals.income || 0) + (totals.cashCredits || 0),
    income: totals.income || 0,
    cardCreditsAndPayments:
      (totals.creditCardCredits || 0) + (totals.creditCardPayments || 0),
    cashOutflows: totals.cashOutflows || 0,
    expenses: totals.expenses || 0,
    cardCharges: totals.creditCardExpenses || 0,
  };
}

function buildAssetCreditsMetrics({
  currentMonthTotals,
  remainingMonthTotals,
  monthEndProjections,
}) {
  return {
    current: currentMonthTotals.cashCredits || 0,
    remaining: remainingMonthTotals.cashCredits || 0,
    projected: monthEndProjections.projectedCashCredits || 0,
  };
}

function buildAssetExpensesMetrics({
  currentMonthTotals,
  remainingMonthTotals,
  monthEndProjections,
}) {
  return {
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
}

export function buildDetailedComparisonSections({
  combinedBalances,
  currentMonthTotals,
  monthEndProjections,
  remainingMonthTotals,
}) {
  const assetCreditsMetrics = buildAssetCreditsMetrics({
    currentMonthTotals,
    remainingMonthTotals,
    monthEndProjections,
  });
  const assetExpensesMetrics = buildAssetExpensesMetrics({
    currentMonthTotals,
    remainingMonthTotals,
    monthEndProjections,
  });

  return [
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
}
