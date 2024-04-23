import { Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';

export default function StartDatePicker({ startDate, setStartDate }) {
  const onDateChange = (newValue) => {
    setStartDate(newValue);
  };

  return (
    <>
      <Typography>Start Date</Typography>
      <DatePicker
        value={startDate}
        onChange={onDateChange}
      />
    </>
  );
}

StartDatePicker.propTypes = {
  startDate: PropTypes.object.isRequired,
  setStartDate: PropTypes.func.isRequired,
};
