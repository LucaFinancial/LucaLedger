import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectors as transactionSelectors } from '@/store/transactions';
import { constants as accountConstants } from '@/store/accounts';
import { centsToDollars } from '@/utils';

export default function BalanceDifference({
  accountId,
  accountType,
  filterArray,
}) {
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(accountId),
  );

  if (filterArray.length <= 1) {
    return null;
  }

  const lastStatus = filterArray[filterArray.length - 1];
  // Amounts are in cents
  const differenceCents = transactions
    .filter((t) => t.transactionState === lastStatus)
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Hide indicator when difference is $0.00
  if (differenceCents === 0) {
    return null;
  }

  // Convert to dollars for display
  const differenceDollars = centsToDollars(differenceCents);

  const isCreditCard = accountType === accountConstants.AccountType.CREDIT_CARD;
  const isPositive = differenceCents >= 0;
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
      {Math.abs(differenceDollars).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

BalanceDifference.propTypes = {
  accountId: PropTypes.string.isRequired,
  accountType: PropTypes.string.isRequired,
  filterArray: PropTypes.arrayOf(PropTypes.string).isRequired,
};
