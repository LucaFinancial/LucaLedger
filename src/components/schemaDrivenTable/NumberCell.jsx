import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

export default function NumberCell(props) {
  const { column, row, actions, readOnly } = props;
  const { field } = column;
  const value = row[field];
  const [editMode, setEditMode] = useState(false);
  const [newValue, setNewValue] = useState(value);
  const inputRef = useRef(null);

  const toggleEditNumber = () => {
    setEditMode((prev) => !prev);
  };

  const handleChange = (event) => {
    const numberValue = Number(event.target.value);
    setNewValue(numberValue);
  };

  const handleSave = () => {
    actions.updateItemById(row.id, { [field]: newValue });
    setNewValue(row[field]);
    toggleEditNumber();
  };

  useEffect(() => {
    if (editMode) {
      inputRef.current.focus();
    }
  });

  const displayValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  if (readOnly) {
    return <Typography>{displayValue}</Typography>;
  }

  if (editMode) {
    return (
      <>
        <input
          ref={inputRef}
          type='number'
          value={newValue}
          onChange={handleChange}
          onBlur={handleSave}
        />
      </>
    );
  }

  return <Typography onClick={toggleEditNumber}>{displayValue}</Typography>;
}

NumberCell.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  actions: PropTypes.object,
  readOnly: PropTypes.bool,
};
