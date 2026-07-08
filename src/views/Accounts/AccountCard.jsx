import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { format, isValid, parseISO, startOfToday } from 'date-fns';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { constants } from '@/store/transactions';
import { selectors as transactionSelectors } from '@/store/transactions';
import {
  selectors as accountSelectors,
  utils as accountUtils,
} from '@/store/accounts';
import { centsToDollars } from '@/utils';

import ActionsMenu from '@/components/ActionsMenu/ActionsMenu';

const CARD_WIDTH = '320px';
const CARD_HEIGHT = '292px';
const MAX_PREVIEW_TRANSACTIONS = 4;

const ACTIVITY_STATE_META = {
  [constants.TransactionStateEnum.PENDING]: {
    label: 'Pending',
    priority: 0,
    color: 'warning',
  },
  [constants.TransactionStateEnum.SCHEDULED]: {
    label: 'Scheduled',
    priority: 1,
    color: 'info',
  },
  [constants.TransactionStateEnum.PLANNED]: {
    label: 'Planned',
    priority: 2,
    color: 'default',
  },
};

const formatCurrency = (cents, { signed = false } = {}) => {
  const dollars = centsToDollars(cents);
  const absoluteValue = Math.abs(dollars).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (signed && cents > 0) {
    return `+$${absoluteValue}`;
  }

  return `${cents < 0 ? '-' : ''}$${absoluteValue}`;
};

const getAmountColor = (amount, accountType) => {
  if (amount === 0) {
    return 'text.primary';
  }

  const isCreditCard = accountUtils.isCreditCardAccountType(accountType);

  if (isCreditCard) {
    return amount > 0 ? 'error.main' : 'success.main';
  }

  return amount > 0 ? 'success.main' : 'error.main';
};

const parseTransactionDate = (transaction) => {
  try {
    const parsed = parseISO(String(transaction.date).replace(/\//g, '-'));
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const formatActivityDate = (transaction) => {
  const parsed = parseTransactionDate(transaction);
  return parsed ? format(parsed, 'MMM d') : '';
};

export default function AccountCard({ account }) {
  const navigate = useNavigate();
  const isLoading = useSelector(
    accountSelectors.selectIsAccountLoading(account.id),
  );
  const transactions = useSelector(
    transactionSelectors.selectTransactionsByAccountId(account.id),
  );
  const isClosed = accountUtils.isAccountClosed(account);
  const { COMPLETED, PENDING, SCHEDULED, PLANNED } =
    constants.TransactionStateEnum;

  const {
    currentBalance,
    pendingDelta,
    pendingBalance,
    hasPendingTransactions,
    activityTransactions,
  } = useMemo(() => {
    const currentTransactions = transactions.filter(
      (transaction) => transaction.transactionState === COMPLETED,
    );
    const pendingTransactions = transactions.filter(
      (transaction) => transaction.transactionState === PENDING,
    );
    const today = startOfToday();
    const upcomingTransactions = transactions.filter((transaction) => {
      if (
        transaction.transactionState !== SCHEDULED &&
        transaction.transactionState !== PLANNED
      ) {
        return false;
      }

      const parsedDate = parseTransactionDate(transaction);
      return parsedDate ? parsedDate >= today : true;
    });
    const previewTransactions = [
      ...pendingTransactions,
      ...upcomingTransactions,
    ]
      .sort((left, right) => {
        const leftMeta = ACTIVITY_STATE_META[left.transactionState];
        const rightMeta = ACTIVITY_STATE_META[right.transactionState];
        const stateDifference =
          (leftMeta?.priority ?? 99) - (rightMeta?.priority ?? 99);

        if (stateDifference !== 0) {
          return stateDifference;
        }

        const leftDate = parseTransactionDate(left)?.getTime() ?? Infinity;
        const rightDate = parseTransactionDate(right)?.getTime() ?? Infinity;
        return leftDate - rightDate;
      })
      .slice(0, MAX_PREVIEW_TRANSACTIONS);

    const currentTotal = currentTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
    const pendingTotal = pendingTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    return {
      currentBalance: currentTotal,
      pendingDelta: pendingTotal,
      pendingBalance: currentTotal + pendingTotal,
      hasPendingTransactions: pendingTransactions.length > 0,
      activityTransactions: previewTransactions,
    };
  }, [COMPLETED, PENDING, PLANNED, SCHEDULED, transactions]);

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
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
          height: '100%',
          boxSizing: 'border-box',
          p: 2,
          '&:last-child': {
            pb: 2,
          },
        }}
      >
        <Box sx={{ minWidth: 0, pr: 5 }}>
          <Tooltip title={account.name} placement='top' arrow>
            <Typography
              variant='h5'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {account.name}
            </Typography>
          </Tooltip>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {accountUtils.formatAccountType(account.type)}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant='overline'
            color='text.secondary'
            sx={{ lineHeight: 1, display: 'block' }}
          >
            Current Balance
          </Typography>
          <Typography
            variant='h4'
            sx={{
              color:
                currentBalance < 0
                  ? getAmountColor(currentBalance, account.type)
                  : 'text.primary',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {formatCurrency(currentBalance)}
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              display: 'block',
              height: 18,
              lineHeight: '18px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {hasPendingTransactions
              ? `Pending ${formatCurrency(pendingDelta, {
                  signed: true,
                })} -> ${formatCurrency(pendingBalance)}`
              : ' '}
          </Typography>
        </Box>

        {isClosed && (
          <Box
            sx={{
              mt: 1,
              pt: 1,
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
        )}

        {!isClosed && (
          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              minHeight: 0,
            }}
          >
            {activityTransactions.length === 0 ? (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ py: 1 }}
              >
                No pending or upcoming activity
              </Typography>
            ) : (
              activityTransactions.map((transaction) => {
                const stateMeta = ACTIVITY_STATE_META[transaction.transactionState];
                const secondaryLabel =
                  transaction.transactionState === PENDING
                    ? stateMeta.label
                    : formatActivityDate(transaction);

                return (
                  <Box
                    key={transaction.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '72px minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 1,
                      minHeight: 23,
                    }}
                  >
                    <Chip
                      label={secondaryLabel || stateMeta.label}
                      color={stateMeta.color}
                      size='small'
                      variant='outlined'
                      sx={{
                        height: 20,
                        maxWidth: 72,
                        '& .MuiChip-label': {
                          px: 0.75,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                    <Typography
                      variant='body2'
                      title={transaction.description}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {transaction.description || 'Untitled transaction'}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: getAmountColor(transaction.amount, account.type),
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCurrency(Number(transaction.amount || 0), {
                        signed: true,
                      })}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        )}
        <ActionsMenu account={account} />
      </CardContent>
    </Card>
  );
}
