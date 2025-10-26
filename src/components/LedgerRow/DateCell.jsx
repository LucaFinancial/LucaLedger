import { TableCell, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import config from '@/config';
import { actions, constants } from '@/store/transactions';

export default function DateCell({ transaction }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [dateValue, setDateValue] = useState(
    dayjs(transaction.date, config.dateFormatString)
  );

  // Sync local state when transaction.date changes (e.g., from bulk edit)
  useEffect(() => {
    setDateValue(dayjs(transaction.date, config.dateFormatString));
  }, [transaction.date]);

  const handleSave = (value) => {
    if (value && value.isValid()) {
      dispatch(
        actions.updateTransactionProperty(
          accountId,
          transaction,
          constants.TransactionFields.DATE,
          value.format(config.dateFormatString)
        )
      );
    }
  };

  const handleClose = () => {
    // Reset to original value if closed without selecting
    setDateValue(dayjs(transaction.date, config.dateFormatString));
    setIsOpen(false);
  };

  const handleAccept = (value) => {
    handleSave(value);
    setIsOpen(false);
  };

  const handleEdit = () => {
    setIsOpen(true);
  };

  return (
    <TableCell style={{ cursor: 'pointer', width: '160px' }}>
      {isOpen ? (
        <DatePicker
          open={isOpen}
          onClose={handleClose}
          onAccept={handleAccept}
          value={dateValue}
          onChange={setDateValue}
        />
      ) : (
        <Typography onClick={handleEdit}>
          {dateValue.format('MMM DD YYYY')}
        </Typography>
      )}
    </TableCell>
  );
}

DateCell.propTypes = {
  transaction: PropTypes.object.isRequired,
};
