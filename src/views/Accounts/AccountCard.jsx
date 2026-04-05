import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { constants } from '@/store/transactions';
import {
  selectors as accountSelectors,
  utils as accountUtils,
} from '@/store/accounts';
import BalanceRow from './BalanceRow';

import ActionsMenu from '@/components/ActionsMenu/ActionsMenu';

export default function AccountCard({ account }) {
  const navigate = useNavigate();
  const isLoading = useSelector(
    accountSelectors.selectIsAccountLoading(account.id),
  );
  const isClosed = accountUtils.isAccountClosed(account);

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
        border: '2px solid',
        borderColor: isClosed ? 'error.main' : 'transparent',
        backgroundColor: isClosed
          ? 'rgba(211, 47, 47, 0.04)'
          : 'background.paper',
        '&:hover': {
          backgroundColor: isLoading
            ? 'inherit'
            : isClosed
              ? 'rgba(211, 47, 47, 0.08)'
              : 'rgba(0, 0, 0, 0.04)',
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
      <CardContent
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='h4'>{account.name}</Typography>
        <Typography variant='subtitle1'>
          {accountUtils.formatAccountType(account.type)}
        </Typography>
        {isClosed ? (
          <Box
            sx={{
              mt: 'auto',
              pt: 2,
              mb: 0.5,
              height: '102px',
              borderTop: '1px solid',
              borderColor: 'rgba(211, 47, 47, 0.35)',
            }}
          >
            <Chip
              label='Closed'
              color='error'
              variant='outlined'
              sx={{ fontWeight: 700 }}
            />
          </Box>
        ) : (
          <>
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
          </>
        )}
        <ActionsMenu account={account} />
      </CardContent>
    </Card>
  );
}
