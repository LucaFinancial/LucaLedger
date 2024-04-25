import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectors } from '@/store/entities';

export default function EntityPicker({ selectedEntity, onChange }) {
  const [currentValue, setCurrentValue] = useState(selectedEntity.id);
  const entities = useSelector(selectors.selectAllEntities);

  const handleChange = (event) => {
    const { value } = event.target;
    setCurrentValue(value);
    onChange(value);
  };

  return (
    <FormControl
      sx={{ width: '125px' }}
      variant='standard'
      fullWidth
    >
      <InputLabel id='demo-simple-select-label'>Status</InputLabel>
      <Select
        labelId='entity-picker-label'
        id='entity-picker'
        value={currentValue}
        label='Entity'
        onChange={handleChange}
      >
        {entities.map((entity) => {
          return (
            <MenuItem
              key={entity.id}
              value={entity.id}
            >
              {entity.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

EntityPicker.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
