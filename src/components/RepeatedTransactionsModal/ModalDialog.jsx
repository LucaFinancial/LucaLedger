import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { actions } from '@/store/transactions';
import AmountField from './AmountField';
import DescriptionField from './DescriptionField';
import FrequencyField from './FrequencyField';
import OccurrencesField from './OccurrencesField';
import StartDatePicker from './StartDatePicker';

export default function ModalDialog({ open, handleClose, reset, setReset }) {
  const dispatch = useDispatch();
  const { accountId } = useParams();
  const [startDate, setStartDate] = useState(dayjs());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState(null);
  const [frequencyCount, setFrequencyCount] = useState(null);
  const [occurrences, setOccurrences] = useState(null);

  const handleCreate = () => {
    dispatch(
      actions.createRepeatTransaction({
        startDate,
        amount: Number(amount),
        description,
        frequency,
        frequencyCount,
        occurrences,
        accountId,
      })
    );
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  useEffect(() => {
    if (reset) {
      setTimeout(() => {
        setStartDate(dayjs());
        setDescription('');
        setAmount(0.0);
        setFrequency(null);
        setFrequencyCount(null);
        setOccurrences(null);
        setReset(false);
      }, 1000);
    }
  }, [reset, setReset]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: '900px',
        },
      }}
    >
      <DialogTitle>Create Repeated Transactions</DialogTitle>
      <DialogContent>
        <StartDatePicker
          startDate={startDate}
          setStartDate={setStartDate}
        />
        <DescriptionField
          description={description}
          setDescription={setDescription}
        />
        <AmountField
          amount={amount}
          setAmount={setAmount}
        />
        <FrequencyField
          frequency={frequency}
          setFrequency={setFrequency}
          frequencyCount={frequencyCount}
          setFrequencyCount={setFrequencyCount}
        />
        <OccurrencesField
          occurrences={occurrences}
          setOccurrences={setOccurrences}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color='primary'
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          color='primary'
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ModalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  reset: PropTypes.bool.isRequired,
  setReset: PropTypes.func.isRequired,
};
