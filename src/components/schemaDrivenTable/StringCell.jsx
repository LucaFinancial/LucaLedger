import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

export default function StringCell({ row, column, actions, readOnly = true }) {
  const value = row[column.field];
  const [editMode, setEditMode] = useState(false);
  const [newValue, setNewValue] = useState(value);
  const inputRef = useRef(null);

  const toggleEditString = () => {
    setEditMode((prev) => !prev);
  };

  const handleChange = (event) => {
    setNewValue(event.target.value);
  };

  const handleSave = () => {
    actions.updateItemById(row.id, { [column.field]: newValue });
    setNewValue(row[column.field]);
    toggleEditString();
  };

  useEffect(() => {
    if (editMode) {
      inputRef.current.focus();
    }
  });

  if (readOnly) {
    return <div>{value}</div>;
  }

  if (editMode) {
    return (
      <>
        <input
          ref={inputRef}
          type='text'
          value={newValue}
          onChange={handleChange}
          onBlur={handleSave}
        />
      </>
    );
  }

  return <Typography onClick={toggleEditString}>{value}</Typography>;
}

StringCell.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.shape({
    field: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  actions: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
};
