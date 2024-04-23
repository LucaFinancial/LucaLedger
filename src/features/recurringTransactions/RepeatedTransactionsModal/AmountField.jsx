import { InputAdornment, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function AmountField({ amount, setAmount }) {
  const validNumberRegex = /^-?\d+(\.\d{1,2})?$|^-?\.\d{1,2}$|^-?\d+\.$|^-?$/;

  const handleChange = (event) => {
    const { value } = event.target;
    if (value === '-') {
      setAmount(value);
    } else if (value === '') {
      setAmount(value);
    } else if (validNumberRegex.test(value)) {
      setAmount(value);
    }
  };

  return (
    <>
      <Typography>Amount</Typography>
      <TextField
        variant='filled'
        type='text'
        value={amount}
        onChange={handleChange}
        inputProps={{ step: '0.01' }}
        InputProps={{
          startAdornment: <InputAdornment position='start'>$</InputAdornment>,
        }}
        fullWidth
      />
    </>
  );
}

AmountField.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setAmount: PropTypes.func.isRequired,
};
