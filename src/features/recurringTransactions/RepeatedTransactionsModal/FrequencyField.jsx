import PropTypes from 'prop-types';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

export default function FrequencyField({
  frequency,
  setFrequency,
  frequencyCount,
  setFrequencyCount,
}) {
  const isFrequencyCountDisabled = frequency === 'Bi-Monthly';

  const onFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };

  const onFrequencyCountChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setFrequencyCount(newValue);
    } else if (event.target.value === '') {
      setFrequencyCount(null);
    }
  };

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        item
        xs={6}
      >
        <Typography>Every</Typography>
        <TextField
          variant='filled'
          fullWidth
          type='number'
          value={frequencyCount === null ? '' : frequencyCount}
          onChange={onFrequencyCountChange}
          disabled={isFrequencyCountDisabled}
        />
      </Grid>
      <Grid
        item
        xs={6}
      >
        <Typography>Frequency</Typography>
        <FormControl
          fullWidth
          variant='filled'
        >
          <InputLabel id='frequency-label'>Choose Frequency</InputLabel>
          <Select
            labelId='frequency-label'
            value={frequency || ''}
            onChange={onFrequencyChange}
          >
            <MenuItem value={'Days'}>Days</MenuItem>
            <MenuItem value={'Weeks'}>Weeks</MenuItem>
            <MenuItem value={'Months'}>Months</MenuItem>
            <MenuItem value={'Years'}>Years</MenuItem>
            <MenuItem value={'Bi-Monthly'}>Bi-Monthly</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

FrequencyField.propTypes = {
  frequency: PropTypes.oneOf([
    'Days',
    'Weeks',
    'Months',
    'Years',
    'Bi-Monthly',
    null,
  ]),
  setFrequency: PropTypes.func.isRequired,
  frequencyCount: PropTypes.number,
  setFrequencyCount: PropTypes.func.isRequired,
};
