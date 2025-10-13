import PropTypes from 'prop-types';

export default function BalanceDifference({
  transactions,
  accountType,
  filterArray,
}) {
  if (filterArray.length <= 1) {
    return null;
  }

  const lastStatus = filterArray[filterArray.length - 1];
  const difference = transactions
    .filter((t) => t.status === lastStatus)
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Hide indicator when difference is $0.00
  if (difference === 0) {
    return null;
  }

  const isCreditCard = accountType === 'Credit Card';
  const isPositive = difference >= 0;
  const color = isCreditCard
    ? isPositive
      ? 'red'
      : 'green'
    : isPositive
    ? 'green'
    : 'red';

  return (
    <span
      style={{
        color,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {isPositive ? (
        <span
          style={{ marginLeft: 4, marginRight: 4 }}
          aria-label={isCreditCard ? 'decrease' : 'increase'}
          title={isCreditCard ? 'Decrease' : 'Increase'}
        >
          ▲
        </span>
      ) : (
        <span
          style={{ marginLeft: 4, marginRight: 4 }}
          aria-label={isCreditCard ? 'increase' : 'decrease'}
          title={isCreditCard ? 'Increase' : 'Decrease'}
        >
          ▼
        </span>
      )}
      $
      {Math.abs(difference).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

BalanceDifference.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  accountType: PropTypes.string.isRequired,
  filterArray: PropTypes.arrayOf(PropTypes.string).isRequired,
};
