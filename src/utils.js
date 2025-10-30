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

/**
 * Safely convert dollars (float) to cents (integer)
 * Handles floating-point precision issues by using toFixed before conversion
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents (integer)
 */
export const dollarsToCents = (dollars) => {
  // Use toFixed(2) to ensure we only have 2 decimal places, then multiply and round
  // This handles cases like 0.1 * 100 = 10.000000000000002
  const centsFloat = parseFloat((dollars * 100).toFixed(0));
  return Math.round(centsFloat);
};
