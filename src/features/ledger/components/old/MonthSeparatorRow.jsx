import { IconButton, TableCell, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import config from '@/config';

import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

export default function MonthSeparatorRow({
  transaction,
  previousTransaction,
  isCollapsed,
  onToggleCollapse,
}) {
  const transactionDate = dayjs(transaction.date);
  const transactionMonth = transactionDate.format(config.monthFormatString);

  let isMonthDifferent = false;
  if (!previousTransaction) {
    isMonthDifferent = true;
  } else {
    const previousTransactionDate = dayjs(previousTransaction.date);
    const previousMonth = previousTransactionDate.format(
      config.monthFormatString
    );
    isMonthDifferent = transactionMonth !== previousMonth;
  }

  return (
    isMonthDifferent && (
      <TableRow>
        <TableCell colSpan={6}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={onToggleCollapse}
              size='small'
            >
              {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
            <Typography
              variant='h4'
              style={{
                justifyContent: 'center',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {transactionMonth}
            </Typography>
          </div>
        </TableCell>
      </TableRow>
    )
  );
}

MonthSeparatorRow.propTypes = {
  transaction: PropTypes.shape({
    date: PropTypes.string.isRequired,
  }).isRequired,
  previousTransaction: PropTypes.shape({
    date: PropTypes.string.isRequired,
  }),
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
};
