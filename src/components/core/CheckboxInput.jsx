import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

export default function CheckboxInput({ label, value, onChange }) {
  return (
    <div>
      <label>
        <input
          type='checkbox'
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label && <Typography variant='body1'>{label}</Typography>}
      </label>
    </div>
  );
}

CheckboxInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
