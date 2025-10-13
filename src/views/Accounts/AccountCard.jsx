import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectors as transactionSelectors,
  constants,
} from '@/store/transactions';
import BalanceRow from './BalanceRow';

import ActionsMenu from '@/components/ActionsMenu/ActionsMenu';

export default function AccountCard({ account }) {
  const navigate = useNavigate();
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id)
  );

  const cardLength = '320px';

  const handleClick = () => {
    navigate(`/accounts/${account.id}`);
  };

  return (
    <Card
      id='AccountCard'
      onClick={handleClick}
      sx={{
        width: cardLength,
        // height: cardLength,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
        },
      }}
    >
      <CardContent style={{ position: 'relative' }}>
        <Typography variant='h4'>{account.name}</Typography>
        <Typography variant='subtitle1'>{account.type}</Typography>
        <BalanceRow
          transactions={transactions}
          accountType={account.type}
          balanceType={'Current'}
          filterArray={[constants.TransactionStatusEnum.COMPLETE]}
        />
        <BalanceRow
          transactions={transactions}
          accountType={account.type}
          balanceType={'Pending'}
          filterArray={[
            constants.TransactionStatusEnum.COMPLETE,
            constants.TransactionStatusEnum.PENDING,
          ]}
        />
        <BalanceRow
          transactions={transactions}
          accountType={account.type}
          balanceType={'Scheduled'}
          filterArray={[
            constants.TransactionStatusEnum.COMPLETE,
            constants.TransactionStatusEnum.PENDING,
            constants.TransactionStatusEnum.SCHEDULED,
          ]}
        />
        {/* <BalanceRow
          account={account}
          balanceType={'Planned'}
          filterArray={[
            constants.TransactionStatusEnum.COMPLETE,
            constants.TransactionStatusEnum.PENDING,
            constants.TransactionStatusEnum.SCHEDULED,
            constants.TransactionStatusEnum.PLANNED,
          ]}
        /> */}
        <ActionsMenu account={account} />
      </CardContent>
    </Card>
  );
}

AccountCard.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};
