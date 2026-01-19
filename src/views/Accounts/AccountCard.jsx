import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { constants } from '@/store/transactions';
import { selectors as accountSelectors } from '@/store/accounts';
import BalanceRow from './BalanceRow';

import ActionsMenu from '@/components/ActionsMenu/ActionsMenu';

export default function AccountCard({ account }) {
  const navigate = useNavigate();
  const isLoading = useSelector(
    accountSelectors.selectIsAccountLoading(account.id),
  );

  const cardLength = '320px';

  const handleClick = () => {
    if (!isLoading) {
      navigate(`/accounts/${account.id}`);
    }
  };

  return (
    <Card
      id='AccountCard'
      onClick={handleClick}
      sx={{
        width: cardLength,
        position: 'relative',
        '&:hover': {
          backgroundColor: isLoading ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
          cursor: isLoading ? 'default' : 'pointer',
        },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
      <CardContent style={{ position: 'relative' }}>
        <Typography variant='h4'>{account.name}</Typography>
        <Typography variant='subtitle1'>{account.type}</Typography>
        <BalanceRow
          accountId={account.id}
          accountType={account.type}
          balanceType={'Current'}
          filterArray={[constants.TransactionStateEnum.COMPLETED]}
        />
        <BalanceRow
          accountId={account.id}
          accountType={account.type}
          balanceType={'Pending'}
          filterArray={[
            constants.TransactionStateEnum.COMPLETED,
            constants.TransactionStateEnum.PENDING,
          ]}
        />
        <BalanceRow
          accountId={account.id}
          accountType={account.type}
          balanceType={'Scheduled'}
          filterArray={[
            constants.TransactionStateEnum.COMPLETED,
            constants.TransactionStateEnum.PENDING,
            constants.TransactionStateEnum.SCHEDULED,
          ]}
        />
        {/* <BalanceRow
          account={account}
          balanceType={'Planned'}
          filterArray={[
            constants.TransactionStateEnum.COMPLETED,
            constants.TransactionStateEnum.PENDING,
            constants.TransactionStateEnum.SCHEDULED,
            constants.TransactionStateEnum.SCHEDULED,
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
