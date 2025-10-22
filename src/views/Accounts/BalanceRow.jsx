import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import BalanceDifference from './BalanceDifference';
import { selectors as transactionSelectors } from '@/store/transactions';

export default function BalanceRow({
  accountId,
  accountType,
  balanceType,
  filterArray,
}) {
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(accountId)
  );

  // Calculate total in cents (integer)
  const total = transactions
    .filter((t) => filterArray.includes(t.status))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // Format cents as dollars for display
  const formattedTotal = (Math.abs(total) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Determine color for negative balance
  let negativeColor;
  if (total < 0) {
    negativeColor = accountType === 'Credit Card' ? 'green' : 'red';
  }

  return (
    <Typography
      variant='body1'
      color='text.secondary'
      style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <span style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <span>{balanceType}</span>
        <span style={{ marginLeft: 'auto', textAlign: 'right', minWidth: 100 }}>
          <BalanceDifference
            accountId={accountId}
            accountType={accountType}
            filterArray={filterArray}
          />
        </span>
      </span>
      <span
        style={{
          color: total < 0 ? negativeColor : undefined,
          textAlign: 'right',
          minWidth: 100,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {total < 0 ? '-' : ''}
        {'$'}
        {formattedTotal}
      </span>
    </Typography>
  );
}

BalanceRow.propTypes = {
  accountId: PropTypes.string.isRequired,
  accountType: PropTypes.string.isRequired,
  balanceType: PropTypes.string.isRequired,
  filterArray: PropTypes.array.isRequired,
};
