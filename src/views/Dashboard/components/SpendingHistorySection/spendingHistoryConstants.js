export const PIE_CHART_RADIUS = 100;
export const PIE_CHART_PADDING = 24;

export const COLORS = [
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#00bcd4',
  '#ffeb3b',
  '#795548',
  '#607d8b',
  '#e91e63',
  '#3f51b5',
  '#009688',
  '#cddc39',
  '#ff5722',
  '#673ab7',
];

export const DEFAULT_SELECTION = { type: 'aggregate', value: 'current-month' };

export const LEDGER_STATE_META = Object.freeze({
  completed: {
    backgroundColor: '#e0e0e0',
    borderColor: '#bdbdbd',
    color: '#424242',
  },
  pending: {
    backgroundColor: '#fff9c4',
    borderColor: '#fdd835',
    color: '#f9a825',
  },
  scheduled: {
    backgroundColor: '#b3e5fc',
    borderColor: '#4fc3f7',
    color: '#01579b',
  },
  planned: {
    backgroundColor: '#c8e6c9',
    borderColor: '#81c784',
    color: '#1b5e20',
  },
});

export const TOTAL_META = Object.freeze({
  backgroundColor: '#f3e5f5',
  borderColor: '#9c27b0',
  color: '#9c27b0',
});

export const MONTHLY_AVG_META = Object.freeze({
  backgroundColor: '#fff3e0',
  borderColor: '#ef6c00',
  color: '#e65100',
});

export const AGGREGATE_RANGES_WITH_VISIBLE_DATES = new Set([
  'last-3-months',
  'ytd',
  'last-12-months',
]);

export const RECURRING_TEXT_COLOR = TOTAL_META.color;
