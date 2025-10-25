export const doublePrecisionFormatString = (value) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const parseFloatDoublePrecision = (value) =>
  parseFloat(parseFloat(value).toFixed(2));

/**
 * Convert cents (integer) to dollars (float) for display
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export const centsToDollars = (cents) => cents / 100;
