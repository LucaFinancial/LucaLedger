import { Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function StartDatePicker({ startDate, setStartDate }) {
  const onDateChange = (newValue) => {
    setStartDate(newValue);
  };

  return (
    <>
      <Typography>Start Date</Typography>
      <DatePicker value={startDate} onChange={onDateChange} />
    </>
  );
}

