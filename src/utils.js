/**
 * Convert cents (integer) to dollar amount (float) for display
 * @param {number} cents - Amount in cents (e.g., 1234 for $12.34)
 * @returns {number} Dollar amount as float (e.g., 12.34)
 */
export const centsToDollars = (cents) => cents / 100;

/**
 * Convert dollar amount (string or number) to cents (integer) for storage
 * @param {string|number} dollars - Dollar amount (e.g., "12.34" or 12.34)
 * @returns {number} Amount in cents (e.g., 1234)
 */
export const dollarsToCents = (dollars) => {
  const dollarValue =
    typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return Math.round(dollarValue * 100);
};

/**
 * Format cents as dollar string with 2 decimal places
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted dollar string (e.g., "12.34")
 */
export const formatCentsAsDollars = (cents) =>
  centsToDollars(cents).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Legacy function - kept for backwards compatibility during migration
export const doublePrecisionFormatString = (value) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Legacy function - kept for backwards compatibility during migration
export const parseFloatDoublePrecision = (value) =>
  parseFloat(parseFloat(value).toFixed(2));
