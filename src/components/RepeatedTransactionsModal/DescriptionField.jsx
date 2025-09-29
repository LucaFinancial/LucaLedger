import PropTypes from 'prop-types';
import { TextField, Typography } from '@mui/material';

export default function DescriptionField({ description, setDescription }) {
  const onDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  return (
    <>
      <Typography>Description</Typography>
      <TextField
        variant='filled'
        fullWidth
        value={description}
        onChange={onDescriptionChange}
      />
    </>
  );
}

DescriptionField.propTypes = {
  description: PropTypes.string.isRequired,
  setDescription: PropTypes.func.isRequired,
};
