export default function doublePrecisionFormatString(value) {
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value;
}
