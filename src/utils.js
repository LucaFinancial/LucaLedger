export const doublePrecisionFormatString = (value) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const parseFloatDoublePrecision = (value) =>
  parseFloat(parseFloat(value).toFixed(2));
