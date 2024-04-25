import PropTypes from 'prop-types';
import { TextField, Typography } from '@mui/material';

export default function OccurrencesField({ occurrences, setOccurrences }) {
  const onOccurrencesChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setOccurrences(newValue);
    } else if (event.target.value === '') {
      setOccurrences(null);
    }
  };

  return (
    <>
      <Typography>Occurrences</Typography>
      <TextField
        variant='filled'
        fullWidth
        type='number'
        value={occurrences === null ? '' : occurrences}
        onChange={onOccurrencesChange}
      />
    </>
  );
}

OccurrencesField.propTypes = {
  occurrences: PropTypes.number,
  setOccurrences: PropTypes.func.isRequired,
};
